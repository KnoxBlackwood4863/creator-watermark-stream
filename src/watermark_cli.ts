import { InfraiImageClient } from "./infrai_image_client.js";
import { watermarkForCreator } from "./watermark_service.js";

const [creatorId, filename, image, watermark] = process.argv.slice(2);
if (!creatorId || !filename || !image || !watermark) {
  console.error("usage: npm start -- <creatorId> <filename> <image-id-or-data> <watermark>");
  process.exit(1);
}
const delivery = await watermarkForCreator({creatorId, filename, image, watermark}, new InfraiImageClient());
console.log(JSON.stringify(delivery, null, 2));
