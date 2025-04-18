import type { APIRoute } from "astro";
import JSZip from "jszip";
import { PDFDocument } from "pdf-lib";

export const prerender = false;

async function splitPDF(buf: Blob): Promise<Buffer[]> {
  const pdfBytes = await buf.arrayBuffer();
  const pdfDoc = await PDFDocument.load(pdfBytes);
  const totalPages = pdfDoc.getPageCount();
  const buffers: Buffer[] = [];

  for (let i = 0; i < totalPages; i++) {
    const newPdfDoc = await PDFDocument.create();
    const [copiedPage] = await newPdfDoc.copyPages(pdfDoc, [i]);
    newPdfDoc.addPage(copiedPage);
    const pdfBytes = await newPdfDoc.save();
    buffers.push(Buffer.from(pdfBytes));
  }

  return buffers;
}

export const POST: APIRoute = async ({ request }) => {
  const buffer = await request.blob();

  const splitFiles = await splitPDF(buffer);

  const fileNames = splitFiles.map((_, index) => `split-${index + 1}.pdf`);
  const fileBuffers = splitFiles.map((_, index) => ({
    name: fileNames[index],
    buffer: _,
  }));
  const zip = new JSZip();

  fileBuffers.forEach(({ name, buffer }) => {
    zip.file(name, buffer);
  });

  const zipBlob = await zip.generateAsync({ type: "blob" });

  return new Response(zipBlob, {
    headers: {
      "Content-Type": "application/zip",
      "Content-Disposition": `attachment; filename=split-files.zip`,
    },
  });
};
