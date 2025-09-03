import { Buffer } from "buffer";

// Use globalThis so TS is happy and it works cross-env (RN, web, etc.)
const g = globalThis as any;
if (!g.Buffer) {
  g.Buffer = Buffer;
}
