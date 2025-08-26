// app/api/model-builder/export/route.ts
import { NextResponse } from "next/server";
import { exportModelState } from "@/lib/model/export";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const state = body?.modelState;
    if (!state) {
      return NextResponse.json({ error: "Missing modelState" }, { status: 400 });
    }
    const payload = exportModelState(state);
    return NextResponse.json(payload, { status: 200 });
  } catch (err: any) {
    return NextResponse.json(
      { error: "Export failed", details: String(err?.message || err) },
      { status: 500 }
    );
  }
}

