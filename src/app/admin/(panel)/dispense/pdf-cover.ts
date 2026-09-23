"use client";

// First page of a PDF as a 480px wide JPEG, the same size and quality that
// scripts/make-thumbs.mjs produces, rendered in the operator's browser so the
// server needs no PDF tooling. pdf.js is imported on demand: only this page
// pays for it.
export async function renderCover(source: File | string): Promise<Blob> {
  const pdfjs = await import("pdfjs-dist");
  pdfjs.GlobalWorkerOptions.workerSrc = new URL(
    "pdfjs-dist/build/pdf.worker.min.mjs",
    import.meta.url,
  ).toString();

  const data =
    typeof source === "string"
      ? new Uint8Array(await (await fetch(source)).arrayBuffer())
      : new Uint8Array(await source.arrayBuffer());

  const doc = await pdfjs.getDocument({ data }).promise;
  try {
    const page = await doc.getPage(1);
    const base = page.getViewport({ scale: 1 });
    const viewport = page.getViewport({ scale: 480 / base.width });

    const canvas = document.createElement("canvas");
    canvas.width = Math.round(viewport.width);
    canvas.height = Math.round(viewport.height);
    const ctx = canvas.getContext("2d")!;
    // JPEG has no alpha; paint white so transparent PDFs don't come out black.
    ctx.fillStyle = "#fff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    await page.render({ canvas, canvasContext: ctx, viewport }).promise;

    return await new Promise<Blob>((resolve, reject) =>
      canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("Copertina vuota"))), "image/jpeg", 0.7),
    );
  } finally {
    await doc.destroy();
  }
}
