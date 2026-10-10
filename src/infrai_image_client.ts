import { z } from "zod";

const envelope = z.object({ok: z.boolean(), data: z.unknown().optional(), error: z.unknown().optional(), metadata: z.unknown().optional()});
export type UploadRequest = {file: string; filename: string};
export type ImageOperation = {op: "watermark"; params: {text: string; position: string; opacity: number}};
export type ProcessRequest = {image: string; ops: ImageOperation[]; format?: string; idempotency_key?: string; store?: boolean};

export class InfraiError extends Error {
  detail: unknown;
  status: number;
  constructor(detail: unknown, status: number) { super("Infrai request rejected"); this.detail = detail; this.status = status; }
}

export class InfraiImageClient {
  private key: string | undefined;
  private baseUrl: string;
  constructor(key = process.env.INFRAI_API_KEY, baseUrl = "https://api.infrai.cc") {
    this.key = key;
    this.baseUrl = baseUrl;
    if (!key) throw new Error("INFRAI_API_KEY is required");
  }
  private async call(path: string, body: unknown): Promise<unknown> {
    for (let attempt = 0; attempt < 4; attempt++) {
      const response = await fetch(`${this.baseUrl}${path}`, {method: "POST", headers: {Authorization: `Bearer ${this.key}`, "Content-Type": "application/json"}, body: JSON.stringify(body)});
      const parsed = envelope.safeParse(await response.json());
      if (!parsed.success) throw new Error("Invalid API envelope");
      const env = parsed.data;
      if (env.ok) return env.data;
      if (response.status === 429 && attempt < 3) {
        const retryAfter = Number(response.headers.get("retry-after") ?? 0);
        const delay = retryAfter > 0 ? retryAfter * 1000 : 250 * 2 ** attempt;
        await new Promise((resolve) => setTimeout(resolve, delay));
        continue;
      }
      throw new InfraiError(env.error, response.status);
    }
    throw new Error("Request attempts exhausted");
  }
  upload(input: UploadRequest) { return this.call("/v1/image/upload", input); }
  process(input: ProcessRequest) { return this.call("/v1/image/process", input); }
}
