import type { APIRoute } from "astro";
import { Recipe } from "muhammara";
import fs from "fs/promises";
import path from "path";
import os from "os";
import sharp, { type OutputInfo } from "sharp";
export const prerender = false;

async function tempDir(): Promise<string> {
  const randomDirName = Math.random().toString(36).substring(2, 15);
  // create a temporary directory to store the split files
  return await fs.mkdtemp(path.join(os.tmpdir(), randomDirName));
}

async function convertImage(
  blob: Blob,
  format: string,
): Promise<[Blob, OutputInfo]> {
  const buffer = await blob.arrayBuffer();
  const tempDirectory = await tempDir();
  try {
    const outInfo = await sharp(Buffer.from(buffer)).toFile(
      path.join(tempDirectory, `temp.${format}`),
    );
    const convertedBuffer = await fs.readFile(
      path.join(tempDirectory, `temp.${format}`),
    );

    return [new Blob([convertedBuffer], { type: `image/${format}` }), outInfo];
  } finally {
    await fs.rm(tempDirectory, { recursive: true, force: true });
  }
}

export const POST: APIRoute = async ({ request }) => {
  const buffer = await request.blob();

  const targetFormat = request.headers.get("X-Image-Format");
  if (!targetFormat) {
    return new Response("No target format specified", { status: 400 });
  }

  const [outBlob, outInfo] = await convertImage(buffer, targetFormat);

  return new Response(outBlob, {
    headers: {
      "Content-Type": `application/${outInfo.format}`,
      "Content-Disposition": `attachment; filename=converted.${outInfo.format}`,
    },
  });
};
