import type { APIRoute } from "astro";
import fs from "fs/promises";
import path from "path";
import os from "os";
import JSZip from "jszip";
import { PDFDocument } from "pdf-lib";

export const prerender = false;

async function mergePDFs(buf: Blob): Promise<Buffer> {
  const zipped = await buf.arrayBuffer();
  const zip = new JSZip();
  const zipContent = await zip.loadAsync(zipped);
  const pdfFiles = Object.keys(zipContent.files).filter((file) =>
    file.endsWith(".pdf"),
  );
  const pdfDoc = await PDFDocument.create();

  for (const pdfFile of pdfFiles) {
    const blob = await zipContent.file(pdfFile)!.async("arraybuffer");
    const toAddDoc = await PDFDocument.load(blob);
    const pages = await pdfDoc.copyPages(toAddDoc, toAddDoc.getPageIndices());
    for (const page of pages) {
      pdfDoc.addPage(page);
    }
  }
  const mergedPDFBuffer = await pdfDoc.save();
  return Buffer.from(mergedPDFBuffer);
}

export const POST: APIRoute = async ({ request }) => {
  const buffer = await request.blob();

  const pdfBlob = await mergePDFs(buffer);

  return new Response(pdfBlob, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename=merged.pdf`,
    },
  });
};
