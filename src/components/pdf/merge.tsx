import { Merge } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import JSZip from "jszip";

export function MergePDF() {
  return (
    <main>
      <h1 className="flex flex-row items-center gap-1">
        <Merge /> Merge PDFs
      </h1>
      <p>Merge multiple PDF files into one.</p>
      <br />

      <div className="flex flex-col items-start justify-center mt-2">
        <Label htmlFor="pdffile">PDF files</Label>
        <Input
          id="pdffile"
          type="file"
          accept=".pdf"
          className="w-full"
          multiple
        />
      </div>
      <Button
        className="mt-4"
        onClick={async () => {
          const fileInput = document.getElementById(
            "pdffile",
          ) as HTMLInputElement;
          const files = fileInput.files ? fileInput.files : null;

          if (!files) {
            console.error("No files selected");
            return;
          }

          const zip = new JSZip();
          for (let i = 0; i < files.length; i++) {
            const file = files[i];
            const blob = new Blob([file], { type: "application/pdf" });
            zip.file(file.name, blob);
          }
          const zipBlob = await zip.generateAsync({ type: "blob" });

          const response = await fetch("/modules/pdf/merge-pdf", {
            method: "POST",
            body: zipBlob,
            headers: {
              "Content-Type": "application/zip",
            },
          });

          if (!response.ok) {
            console.error("Error merging PDF:", response.statusText);
            return;
          }

          const blob = await response.blob();
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = "merged.pdf";
          document.body.appendChild(a);
          a.click();
          a.remove();
          window.URL.revokeObjectURL(url);
          console.log("merged PDFs successfully");
        }}
      >
        Merge!
      </Button>
    </main>
  );
}
