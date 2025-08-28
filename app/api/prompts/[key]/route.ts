import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ensureSqliteSafety } from "@/lib/dbInit";
import { PromptInput, computeChecksum } from "@/lib/promptSchema";
import { z } from "zod";
import { readFile } from "fs/promises";
import path from "path";

export async function GET(req: NextRequest, { params }: { params: { key: string } }) {
  try {
    await ensureSqliteSafety();
    const row = await prisma.prompt.findUnique({ where: { key: params.key } });
    if (row) {
      // Transform the data to parse JSON strings back to arrays
      const transformedRow = {
        ...row,
        tags: JSON.parse(row.tags || '[]'),
      };
      
      const res = NextResponse.json(transformedRow, { status: 200 });
      res.headers.set("ETag", `W/"${row.version}"`);
      return res;
    }
  } catch (error) {
    console.log('Database error, falling back to JSON file:', error);
  }

  // Fallback to JSON file if database is empty or unavailable
  try {
    const filePath = path.join(process.cwd(), 'data', 'prompts.json');
    const fileContent = await readFile(filePath, 'utf8');
    const jsonData = JSON.parse(fileContent);
    
    // Search for the prompt by key across all categories
    let foundPrompt = null;
    
    Object.entries(jsonData).forEach(([category, categoryPrompts]) => {
      if (Array.isArray(categoryPrompts)) {
        const prompt = categoryPrompts.find((p: any) => p.id === params.key);
        if (prompt) {
          foundPrompt = {
            id: prompt.id,
            key: prompt.id,
            title: prompt.title || `Prompt ${prompt.id}`,
            body: prompt.content || prompt.body || '',
            tags: JSON.stringify([category, ...(prompt.tags || [])]),
            version: 1,
            checksum: 'json-fallback',
            archived: false,
            updatedAt: new Date().toISOString()
          };
        }
      }
    });
    
    if (foundPrompt) {
      const res = NextResponse.json(foundPrompt, { status: 200 });
      res.headers.set("ETag", `W/"${foundPrompt.version}"`);
      return res;
    }
  } catch (error) {
    console.error('Failed to load prompt from JSON file:', error);
  }

  return NextResponse.json({ error: "Not found" }, { status: 404 });
}

export async function PUT(req: NextRequest, { params }: { params: { key: string } }) {
  await ensureSqliteSafety();
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const parsed = PromptInput.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid_input", details: parsed.error.flatten() }, { status: 400 });
  }
  const input = parsed.data;

  try {
    const updated = await prisma.$transaction(async (tx) => {
      const existing = await tx.prompt.findUnique({ where: { key: params.key } });
      if (!existing) {
        throw Object.assign(new Error("Not found"), { code: 404 });
      }
      // Concurrency control
      if (input.version < existing.version) {
        throw Object.assign(new Error("version_conflict"), {
          code: 409,
          payload: { server: existing, client: input },
        });
      }

      const nextVersion = existing.version + 1;
      const checksum = computeChecksum({
        key: existing.key,
        title: input.title,
        body: input.body,
        tags: input.tags ?? [],
        version: nextVersion,
      });

      const row = await tx.prompt.update({
        where: { key: params.key },
        data: {
          title: input.title,
          body: input.body,
          tags: JSON.stringify(input.tags ?? []),
          version: nextVersion,
          checksum,
        },
      });

      await tx.promptAudit.create({
        data: {
          promptId: row.id,
          actor: "local",
          changeSummary: "Edited via Prompts Hub",
          beforeJson: JSON.stringify(existing),
          afterJson: JSON.stringify(row),
        },
      });

      return row;
    });

    const res = NextResponse.json(updated, { status: 200 });
    res.headers.set("ETag", `W/"${updated.version}"`);
    return res;
  } catch (e: any) {
    if (e?.code === 404) {
      return NextResponse.json({ error: "not_found" }, { status: 404 });
    }
    if (e?.code === 409) {
      return NextResponse.json({ error: "version_conflict", ...(e.payload ?? {}) }, { status: 409 });
    }
    return NextResponse.json({ error: "unavailable" }, { status: 503, headers: { "Retry-After": "2" } });
  }
}
