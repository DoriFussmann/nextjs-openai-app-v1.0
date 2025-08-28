import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ensureSqliteSafety } from "@/lib/dbInit";
import { PromptInput, computeChecksum } from "@/lib/promptSchema";
import { readFile } from "fs/promises";
import path from "path";

export async function GET() {
  try {
    await ensureSqliteSafety();
    const rows = await prisma.prompt.findMany({
      where: { archived: false },
      orderBy: { updatedAt: "desc" },
    });
    
    // If database has data, return it
    if (rows.length > 0) {
      const transformedRows = rows.map(row => ({
        ...row,
        tags: JSON.parse(row.tags || '[]'),
      }));
      return NextResponse.json(transformedRows, { status: 200 });
    }
  } catch (error) {
    console.log('Database error, falling back to JSON file:', error);
  }

  // Fallback to JSON file if database is empty or unavailable
  try {
    const filePath = path.join(process.cwd(), 'data', 'prompts.json');
    const fileContent = await readFile(filePath, 'utf8');
    const jsonData = JSON.parse(fileContent);
    
    // Convert the JSON structure to match the database format
    const prompts = [];
    
    // Process each category
    Object.entries(jsonData).forEach(([category, categoryPrompts]) => {
      if (Array.isArray(categoryPrompts)) {
        categoryPrompts.forEach((prompt: any, index: number) => {
          prompts.push({
            id: prompt.id || `${category}-${index}`,
            key: prompt.id || `${category}-${index}`,
            title: prompt.title || `Prompt ${index + 1}`,
            body: prompt.content || prompt.body || '',
            tags: [category, ...(prompt.tags || [])], // Return as array, not JSON string
            version: 1,
            checksum: 'json-fallback',
            archived: false,
            updatedAt: new Date().toISOString()
          });
        });
      }
    });
    
    return NextResponse.json(prompts, { status: 200 });
  } catch (error) {
    console.error('Failed to load prompts from JSON file:', error);
    return NextResponse.json([], { status: 200 });
  }
}

export async function POST(req: NextRequest) {
  await ensureSqliteSafety();
  const json = await req.json();
  const parsed = PromptInput.parse({ ...json, version: 0 }); // new record starts at 0 -> server bumps to 1
  const nextVersion = 1;
  const checksum = computeChecksum({ ...parsed, version: nextVersion });
  const created = await prisma.$transaction(async (tx) => {
    const row = await tx.prompt.create({
      data: {
        key: parsed.key,
        title: parsed.title,
        body: parsed.body,
        tags: JSON.stringify(parsed.tags ?? []),
        version: nextVersion,
        checksum,
      },
    });
    await tx.promptAudit.create({
      data: {
        promptId: row.id,
        actor: "local",
        changeSummary: "Created prompt",
        beforeJson: JSON.stringify({}),
        afterJson: JSON.stringify(row),
      },
    });
    return row;
  });
  const res = NextResponse.json(created, { status: 201 });
  res.headers.set("ETag", `W/"${created.version}"`);
  return res;
}
