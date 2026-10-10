import { z } from "zod";
import { InfraiImageClient } from "./infrai_image_client.js";

export const publishRequest = z.object({creatorId: z.string().min(1), filename: z.string().min(1), image: z.string().min(1), watermark: z.string().min(1)});
export type PublishRequest = z.infer<typeof publishRequest>;
export type Delivery = {creatorId: string; image: unknown; watermark: string};

export async function watermarkForCreator(raw: unknown, client: InfraiImageClient): Promise<Delivery> {
  const input = publishRequest.parse(raw);
  const uploaded = await client.upload({file: input.image, filename: input.filename}) as {id?: string};
  const image = await client.process({
    image: uploaded.id ?? input.image,
    ops: [{op: "watermark", params: {text: input.watermark, position: "bottom-right", opacity: 0.75}}]
  });
  return {creatorId: input.creatorId, image, watermark: input.watermark};
}
