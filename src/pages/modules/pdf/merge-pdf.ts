import type { APIRoute } from "astro";
import { Recipe } from "muhammara";
import fs from "fs/promises";
import path from "path";
import os from "os";
import JSZip from "jszip";

export const prerender = false;

async function tempDir(): Promise<string> {
  const randomDirName = Math.random().toString(36).substring(2, 15);
  // create a temporary directory to store the split files
  return await fs.mkdtemp(path.join(os.tmpdir(), randomDirName));
}

async function mergePDFs(buf: Blob): Promise<Buffer> {
  const tempDirectory = await tempDir();
  const randomName = Math.random().toString(36).substring(2, 15);
  try {
    const zipped = await buf.arrayBuffer();
    const zip = new JSZip();
    const zipContent = await zip.loadAsync(zipped);
    const pdfFiles = Object.keys(zipContent.files).filter((file) =>
      file.endsWith(".pdf"),
    );
    const pdfPaths = [];

    for (const pdfFile of pdfFiles) {
      const pdfPath = path.join(tempDirectory, `${randomName}-${pdfFile}`);

      const pdfBlob = await zipContent.file(pdfFile)!.async("uint8array");
      await fs.writeFile(pdfPath, pdfBlob);
      pdfPaths.push(pdfPath);
    }
    const outputPath = path.join(tempDirectory, `${randomName}-merged.pdf`);
    const pdf = new Recipe(pdfPaths.pop()!, outputPath);

    for (const pdfPath of pdfPaths) {
      pdf.appendPage(pdfPath);
    }
    pdf.endPDF();

    const mergedPDFBuffer = await fs.readFile(outputPath);
    return mergedPDFBuffer;
  } finally {
    await fs.rm(tempDirectory, { recursive: true, force: true }); // delete the temporary directory
  }
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
