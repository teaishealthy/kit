import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import JSZip from "jszip";

export function ConvertImage() {
  return (
    <>
      <div className="flex flex-col items-start justify-center mt-2">
        <div className="flex gap-2 flex-col">
          <div>
            <Label htmlFor="image">Image</Label>
            <Input id="image" type="file" className="w-full" />
          </div>
          <div>
            <Label htmlFor="format">Format</Label>
            <Input
              id="format"
              type="text"
              className="w-full"
              placeholder="jpg, png, webp, etc."
            />
          </div>
        </div>
      </div>
      <Button
        className="mt-4"
        onClick={async () => {
          const fileInput = document.getElementById(
            "image",
          ) as HTMLInputElement;
          const files = fileInput.files ? fileInput.files : null;

          const targetFormatInput = document.getElementById(
            "format",
          ) as HTMLInputElement;

          const targetFormat = targetFormatInput.value.trim();

          if (!targetFormat) {
            console.error("No target format specified");
            return;
          }

          if (!files) {
            console.error("No files selected");
            return;
          }

          const imageBlob = new Blob([files[0]], {
            type: "application/octet-stream",
          });

          const response = await fetch("/modules/image/convert-image", {
            method: "POST",
            body: imageBlob,
            headers: {
              "Content-Type": "application/octet-stream",
              "X-Image-Format": targetFormat,
            },
          });

          if (!response.ok) {
            console.error("Error converting image:", response.statusText);
            return;
          }

          const blob = await response.blob();
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = response.headers
            .get("Content-Disposition")
            ?.split("filename=")[1]!;
          document.body.appendChild(a);
          a.click();
          a.remove();
          window.URL.revokeObjectURL(url);
        }}
      >
        Convert!
      </Button>
    </>
  );
}
