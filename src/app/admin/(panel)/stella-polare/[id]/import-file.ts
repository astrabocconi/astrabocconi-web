"use client";

// Turns an uploaded Word or PDF file into editor HTML, in the operator's
// browser. Both libraries load on demand, so only an import pays for them.
// The server sanitises the result on save like any other body.

const escape = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

// Word keeps headings, bold, lists, links and images. Images are uploaded
// to R2 so the body never carries base64 blobs.
async function docxToHtml(file: File, upload: (f: File) => Promise<string>) {
  const mammoth = await import("mammoth");
  const { value } = await mammoth.convertToHtml(
    { arrayBuffer: await file.arrayBuffer() },
    {
      // The page renders its own h1, and the editor offers h2 and h3 only.
      styleMap: [
        "p[style-name='Title'] => h2:fresh",
        "p[style-name='Heading 1'] => h2:fresh",
        "p[style-name='Heading 2'] => h3:fresh",
        "p[style-name='Heading 3'] => h3:fresh",
      ],
      convertImage: mammoth.images.imgElement(async (image) => {
        const ext = image.contentType.split("/")[1] ?? "png";
        const blob = new Blob([await image.readAsArrayBuffer()], { type: image.contentType });
        return { src: await upload(new File([blob], `docx-image.${ext}`, { type: image.contentType })) };
      }),
    },
  );
  return value;
}

// ponytail: PDFs carry no structure, so this recovers text only, split into
// paragraphs where the vertical gap between lines is larger than usual.
// Headings, bold and images need fixing by hand; upgrade to a layout-aware
// extractor if editors import PDFs often.
async function pdfToHtml(file: File) {
  const pdfjs = await import("pdfjs-dist");
  pdfjs.GlobalWorkerOptions.workerSrc = new URL("pdfjs-dist/build/pdf.worker.min.mjs", import.meta.url).toString();
  const doc = await pdfjs.getDocument({ data: new Uint8Array(await file.arrayBuffer()) }).promise;

  const paragraphs: string[] = [];
  let current = "";
  const flush = () => {
    if (current.trim()) paragraphs.push(current.trim().replace(/\s+/g, " "));
    current = "";
  };

  try {
    for (let n = 1; n <= doc.numPages; n++) {
      const page = await doc.getPage(n);
      const { items } = await page.getTextContent();
      let lastY: number | null = null;
      for (const item of items) {
        if (!("str" in item)) continue;
        const y = item.transform[5];
        const size = item.height || 10;
        if (lastY !== null && lastY - y > size * 1.8) flush();
        // A word hyphenated across lines joins back up.
        current = current.endsWith("-") ? current.slice(0, -1) + item.str : current + item.str;
        if (item.hasEOL) current += " ";
        if (item.str.trim()) lastY = y;
      }
      flush();
    }
  } finally {
    await doc.destroy();
  }
  return paragraphs.map((p) => `<p>${escape(p)}</p>`).join("");
}

export async function importFile(file: File, upload: (f: File) => Promise<string>): Promise<string> {
  const name = file.name.toLowerCase();
  if (name.endsWith(".docx")) return docxToHtml(file, upload);
  if (name.endsWith(".pdf")) return pdfToHtml(file);
  throw new Error("Formato non supportato: usa un file .docx o .pdf");
}
