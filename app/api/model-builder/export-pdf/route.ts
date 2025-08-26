// app/api/model-builder/export-pdf/route.ts
import { NextResponse } from "next/server";
import { buildReport } from "@/lib/model/report";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const state = body?.modelState;
    if (!state) {
      return NextResponse.json({ error: "Missing modelState" }, { status: 400 });
    }

    // Build markdown-style report
    const report = buildReport(state);

    // Simple PDF: text only
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([595, 842]); // A4
    const { height } = page.getSize();
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

    const fontSize = 10;
    const lineHeight = 14;
    const margin = 40;

    const lines = report.split("\n");
    let y = height - margin;

    for (const line of lines) {
      if (y < margin) {
        // new page
        const newPage = pdfDoc.addPage([595, 842]);
        y = height - margin;
        page.drawText("", { x: margin, y });
      }
      page.drawText(line, { x: margin, y, size: fontSize, font, color: rgb(0, 0, 0) });
      y -= lineHeight;
    }

    const pdfBytes = await pdfDoc.save();

    return new Response(pdfBytes as any, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": "attachment; filename=Model_Report.pdf",
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: "PDF export failed", details: String(err?.message || err) },
      { status: 500 }
    );
  }
}
