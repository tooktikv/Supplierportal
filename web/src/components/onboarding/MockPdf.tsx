"use client";

const LINE_WIDTHS = [92, 100, 85, 96, 70, 100, 88, 60];

/** Downloads a tiny generated PDF (ASCII text only) as a stand-in for the real document. */
export function downloadMockPdf(fileName: string, lines: string[]) {
  const escape = (text: string) => text.replace(/[^\x20-\x7e]/g, "?").replace(/[()\\]/g, "\\$&");
  const stream = `BT /F1 14 Tf 72 740 Td 22 TL\n${lines.map((line, i) => `${i ? "T* " : ""}(${escape(line)}) Tj`).join("\n")}\nET`;
  const objects = [
    "<< /Type /Catalog /Pages 2 0 R >>",
    "<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
    "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>",
    `<< /Length ${stream.length} >>\nstream\n${stream}\nendstream`,
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>",
  ];
  let pdf = "%PDF-1.4\n";
  const offsets = objects.map((body, i) => {
    const offset = pdf.length;
    pdf += `${i + 1} 0 obj\n${body}\nendobj\n`;
    return offset;
  });
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n${offsets.map((o) => `${String(o).padStart(10, "0")} 00000 n \n`).join("")}`;
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${pdf.indexOf("xref\n")}\n%%EOF`;
  const url = URL.createObjectURL(new Blob([pdf], { type: "application/pdf" }));
  const link = Object.assign(document.createElement("a"), { href: url, download: fileName });
  link.click();
  URL.revokeObjectURL(url);
}

export default function MockPdf({ title, fileName, pages, intro, signature }: { title: string; fileName: string; pages: number; intro?: string[]; signature?: { src: string; name: string } }) {
  return (
    <div className="mock-pdf" role="region" aria-label={`${title} PDF preview`}>
      <div className="mock-pdf-bar">
        <span>▤ {fileName}</span>
        <small>{pages} pages · Mock preview</small>
      </div>
      <div className="mock-pdf-pages" tabIndex={0}>
        {Array.from({ length: pages }, (_, index) => (
          <div className="mock-pdf-page" key={index}>
            {index === 0 && <strong>{title}</strong>}
            {index === 0 && intro?.map((line) => <p key={line}>{line}</p>)}
            {LINE_WIDTHS.map((width, line) => <span key={line} style={{ width: `${width}%` }} />)}
            {signature && index === pages - 1 && (
              <div className="mock-pdf-signature">
                {/* eslint-disable-next-line @next/next/no-img-element -- local preview of the user's signature */}
                <img src={signature.src} alt="Signature" />
                <small>({signature.name})</small>
              </div>
            )}
            <small>Page {index + 1} of {pages}</small>
          </div>
        ))}
      </div>
    </div>
  );
}
