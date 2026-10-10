import assert from "node:assert/strict";
import { watermarkForCreator } from "../src/watermark_service.js";

const calls: unknown[] = [];
const client = {upload: async (body: unknown) => {calls.push(body); return {id: "asset-1"};}, process: async (body: unknown) => {calls.push(body); return {id: "processed-1"};}} as any;
const result = await watermarkForCreator({creatorId: "creator-7", filename: "portrait.jpg", image: "data:image/jpeg;base64,AA", watermark: "© studio"}, client);
assert.equal(result.creatorId, "creator-7");
assert.deepEqual(calls[1], {image: "asset-1", ops: [{op: "watermark", params: {text: "© studio", position: "bottom-right", opacity: 0.75}}]});
console.log("watermark policy: upload then bottom-right overlay");
