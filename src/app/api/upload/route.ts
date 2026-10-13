import { NextResponse } from "next/server";
import { isBucket, presignUpload, safePath } from "@/lib/r2";

export async function POST(req: Request) {
  const { bucket, path, contentType } = await req.json().catch(() => ({}));
  if (!isBucket(bucket) || !safePath(path) || typeof contentType !== "string")
    return NextResponse.json({ error: "Richiesta non valida" }, { status: 400 });

  const uploadUrl = await presignUpload(bucket, path, contentType);
  if (!uploadUrl) return NextResponse.json({ error: "Non hai il permesso di caricare file" }, { status: 403 });
  return NextResponse.json({ uploadUrl });
}
