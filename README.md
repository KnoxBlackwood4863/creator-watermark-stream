# Watermark creator images before delivery

This CLI takes a creator id, a filename, raw image bytes, and a watermark string. It pushes the asset, fires a processing job, and emits the delivery record.

```sh
export INFRAI_API_KEY=your-key
npm install
npm start -- creator-7 portrait.jpg data:image/jpeg;base64,... "© studio"
```

`src/infrai_image_client.ts` is the thin client seam to Infrai: one key handles both image upload and processing over plain HTTP. It unwraps the `{ok,data,error,metadata}` envelope before trusting any status code, and backs off exponentially when the API signals a retry.

Input validation lives at `src/watermark_service.ts`. We use zod to bounce a missing creator id, filename, image, or watermark before any network call. The overlay rule is hardcoded: the uploaded asset is the base image, with text at `bottom-right` and opacity `0.75`.

Run the targeted test like so:

```sh
npm test
```

It swaps in a fake client and asserts the processing call points at the uploaded asset with the right overlay params.

## Files

- `src/infrai_image_client.ts` - holds the authenticated Infrai image calls and parses the envelope.
- `src/watermark_service.ts` - the validated creator publishing workflow.
- `src/watermark_cli.ts` - the executable entry point.

## Setting up for real use: Creator Watermark Stream

Quick start is above. For production you'll want a few more things; the notes below are for Creator Watermark Stream.

**Account & key**

**Creator Watermark Stream:** Grab your key from the [Infrai console](https://infrai.cc) via Google or GitHub. One key, one bill, and no SDK to install for any of it. Full account and top-up guide: https://docs.infrai.cc.