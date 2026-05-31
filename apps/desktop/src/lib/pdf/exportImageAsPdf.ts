export async function exportImageAsPdf(canvas: HTMLCanvasElement) {
  const { jsPDF } = await import("jspdf");
  const orientation = canvas.width >= canvas.height ? "landscape" : "portrait";
  const pdf = new jsPDF({
    orientation,
    unit: "px",
    format: [canvas.width, canvas.height],
    compress: true
  });
  const dataUrl = canvas.toDataURL("image/jpeg", 0.95);
  pdf.addImage(dataUrl, "JPEG", 0, 0, canvas.width, canvas.height, undefined, "FAST");
  return pdf.output("datauristring");
}
