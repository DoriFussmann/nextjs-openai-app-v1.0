import { z } from "zod";
import crypto from "crypto";

export const PromptInput = z.object({
  key: z.string().min(1),
  title: z.string().min(1),
  body: z.string().default(""),
  tags: z.array(z.string()).default([]),
  version: z.number().int().nonnegative(),
});

export type PromptInputType = z.infer<typeof PromptInput>;

// Response type for prompts from the API
export const PromptResponse = z.object({
  id: z.string(),
  key: z.string(),
  title: z.string(),
  body: z.string(),
  tags: z.array(z.string()),
  version: z.number(),
  checksum: z.string(),
  archived: z.boolean(),
  updatedAt: z.string(),
});

export type PromptResponseType = z.infer<typeof PromptResponse>;

export function computeChecksum(p: {
  key: string; title: string; body: string; tags: string[]; version: number;
}) {
  return crypto
    .createHash("sha256")
    .update(`${p.key}|${p.title}|${p.body}|${p.tags.join(",")}|${p.version}`)
    .digest("hex");
}
