declare module "pdfkit" {
  const PDFDocument: any;
  export default PDFDocument;
}

declare module "pdf-parse" {
  function pdfParse(dataBuffer: Buffer): Promise<{ text: string }>;
  export default pdfParse;
}