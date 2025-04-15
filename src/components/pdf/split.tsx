import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

export function SplitPDF() {
  return (
    <>
      <div className="flex flex-col items-start justify-center mt-2">
        <Label htmlFor="pdffile">PDF File</Label>
        <Input id="pdffile" type="file" accept=".pdf" className="w-full" />
      </div>
      <Button
        className="mt-4"
        onClick={async () => {
          const fileInput = document.getElementById(
            "pdffile",
          ) as HTMLInputElement;
          const file = fileInput.files ? fileInput.files[0] : null;
          const fileBlob = file
            ? new Blob([file], { type: "application/pdf" })
            : null;
          // response is a zipBlob with Content-Disposition: attachment; filename="split.zip"

          const response = await fetch("/modules/pdf/split-pdf", {
            method: "POST",
            body: fileBlob,
            headers: {
              "Content-Type": "application/pdf",
            },
          });

          if (!response.ok) {
            console.error("Error splitting PDF:", response.statusText);
            return;
          }

          const blob = await response.blob();
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = "split.zip";
          document.body.appendChild(a);
          a.click();
          a.remove();
          window.URL.revokeObjectURL(url);
          console.log("PDF split successfully");
        }}
      >
        Split!
      </Button>
    </>
  );
}
