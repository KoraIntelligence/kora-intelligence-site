declare module "pdfkit" {
  const PDFDocument: any;
  export default PDFDocument;
}

declare module "pdf-parse" {
  function pdfParse(dataBuffer: Buffer): Promise<{ text: string }>;
  export default pdfParse;
}
declare module "formidable" {
  import { IncomingMessage } from "http";

  export interface File {
    filepath: string;
    originalFilename?: string;
    mimetype?: string;
    size: number;
  }

  export interface Fields {
    [key: string]: string | string[];
  }

  export interface Files {
    [key: string]: File | File[];
  }

  export interface FormidableOptions {
    multiples?: boolean;
    uploadDir?: string;
    keepExtensions?: boolean;
  }

  export default function formidable(options?: FormidableOptions): {
    parse(
      req: IncomingMessage,
      callback: (err: any, fields: Fields, files: Files) => void
    ): void;
  };
}