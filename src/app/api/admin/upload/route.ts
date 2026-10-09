import { NextResponse } from "next/server";
import { getOperator } from "@/lib/auth/operator";
import { insertImageAsset } from "@/lib/events-admin";

export const runtime = "nodejs";

// Event covers go where astra-app keeps its own uploads: the "ImageAsset" table
// in Neon, served by the app at /api/media/<id>. That is what lets an event made
// here show its cover in the mobile app too. The browser downsizes and
// re-encodes before sending (see image-input.tsx), so the cap is generous.
const MAX_BYTES = 3 * 1024 * 1024;

// Trust the bytes, not the declared content type.
function sniff(b: Uint8Array): string | null {
  if (b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff) return "image/jpeg";
  if (b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47) return "image/png";
  if (b[0] === 0x47 && b[1] === 0x49 && b[2] === 0x46) return "image/gif";
  const riff = String.fromCharCode(...b.slice(0, 4));
  const webp = String.fromCharCode(...b.slice(8, 12));
  if (riff === "RIFF" && webp === "WEBP") return "image/webp";
  return null;
}

export async function POST(request: Request) {
  const op = await getOperator();
  if (!op?.can("events:write")) {
    return NextResponse.json({ error: "Non autorizzato" }, { status: 403 });
  }

  let file: FormDataEntryValue | null;
  try {
    file = (await request.formData()).get("file");
  } catch {
    return NextResponse.json({ error: "Richiesta non valida" }, { status: 400 });
  }
  if (!(file instanceof File)) return NextResponse.json({ error: "Nessun file" }, { status: 400 });
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: "Immagine troppo pesante (max 3 MB)" }, { status: 413 });
  }

  const bytes = new Uint8Array(await file.arrayBuffer());
  const mime = sniff(bytes);
  if (!mime) {
    return NextResponse.json({ error: "Solo JPEG, PNG, WebP o GIF" }, { status: 400 });
  }

  try {
    const id = await insertImageAsset(bytes, mime);
    return NextResponse.json({ url: `/api/media/${id}` }, { status: 201 });
  } catch (e) {
    console.error("image upload failed:", e);
    return NextResponse.json({ error: "Caricamento non riuscito" }, { status: 500 });
  }
}
