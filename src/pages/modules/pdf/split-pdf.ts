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

async function splitPDF(buf: Blob): Promise<Buffer[]> {
  const tempDirectory = await tempDir();
  try {
    const randomName = Math.random().toString(36).substring(2, 15);
    const inputFile = path.join(tempDirectory, `${randomName}.pdf`);
    await fs.writeFile(inputFile, await buf.bytes());
    const pdf = new Recipe(inputFile);
    pdf.split(tempDirectory, "split-");
    const files = await fs.readdir(tempDirectory);
    const buffers: Buffer[] = [];
    for (const file of files) {
      const filePath = path.join(tempDirectory, file);
      const buffer = await fs.readFile(filePath);
      buffers.push(buffer);
      await fs.unlink(filePath); // delete the file after reading
    }

    return buffers;
  } finally {
    await fs.rm(tempDirectory, { recursive: true, force: true }); // delete the temporary directory
  }
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
