import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    console.log("📄 PDF test route hit");
    
    const form = await req.formData();
    const file = form.get("file") as File | null;
    
    if (!file) {
      return NextResponse.json({ error: "No file provided." }, { status: 400 });
    }

    console.log(`📂 Received file: ${file.name} (${file.size} bytes)`);
    
    // Just return basic info without processing
    return NextResponse.json({ 
      message: "File received successfully",
      filename: file.name,
      size: file.size,
      type: file.type
    });
  } catch (e: any) {
    console.error("❌ Error:", e);
    return NextResponse.json(
      { error: e?.message ?? "Unexpected error" },
      { status: 500 }
    );
  }
}

