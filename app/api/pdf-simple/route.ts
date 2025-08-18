import { NextRequest, NextResponse } from "next/server";
import pdfParse from "pdf-parse";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const startTime = Date.now();
  
  try {
    console.log("📄 Simple PDF processing started");
    
    const form = await req.formData();
    const file = form.get("file") as File | null;
    if (!file) {
      console.log("❌ No file provided");
      return NextResponse.json({ error: "No file provided." }, { status: 400 });
    }

    console.log(`📂 Processing file: ${file.name} (${(file.size / 1024 / 1024).toFixed(2)} MB)`);
    
    // Just extract text without OpenAI processing
    const buf = Buffer.from(await file.arrayBuffer());
    const { text } = await pdfParse(buf);
    
    const duration = ((Date.now() - startTime) / 1000).toFixed(1);
    console.log(`✅ PDF text extraction complete in ${duration}s`);
    console.log(`📊 Output length: ${text.length} characters`);

    return NextResponse.json({ 
      chunksProcessed: 1,
      text: text.trim()
    });
  } catch (e: any) {
    const duration = ((Date.now() - startTime) / 1000).toFixed(1);
    console.error(`❌ PDF processing failed after ${duration}s:`, e?.message);
    console.error("Full error:", e);
    
    return NextResponse.json(
      { error: e?.message ?? "Unexpected error" },
      { status: e?.status ?? 500 }
    );
  }
}




