export type Attachment =
  | { kind: "pdf"; filename: string; dataUrl: string }
  | { kind: "docx"; filename: string; dataUrl: string }
  | { kind: "xlsx"; filename: string; dataUrl: string }
  | { kind: "html"; title?: string; content: string }
  | { kind: "preview"; title: string; body: string; canvaUrl?: string };

export type Message = {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  ts: number;
  attachments?: Attachment[];
  meta?: {
    nextActions?: string[];
    companion?: string;
    mode?: string;
    tone?: string;
    identity?: any;
  };
};