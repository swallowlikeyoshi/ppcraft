# PPcraft

**A raw developer for Sigma Foveon X3F files that runs entirely in your browser.**

Open it: **https://swallowlikeyoshi.github.io/ppcraft/** and drop `.X3F` files on the window.

- **Private:** your photos are processed on your own computer, in the browser. Nothing is uploaded.
- **Fast:** rendering runs on your GPU (WebGPU; Chrome or Edge recommended). Other browsers fall back to the CPU,
  which is much slower.
- **Non-destructive:** edits are stored in the browser's storage; the original file is never changed. Clearing the
  site's data in the browser deletes the library (edits), so export the photos you finish.
- **Your folders, linked:** *File → Import from Folder…* (Chrome, Edge) links a folder instead of copying its photos
  into the browser: they are read from the folder when needed. After reloading the page, click once anywhere and allow
  the browser to read the folder again. Library backups contain only photos imported by dropping or *Import Photos…*;
  linked photos stay in their folders.

## Supported cameras

| Generation | Cameras | Rendering |
|---|---|---|
| TRUE | DP1, DP1s, DP1x, DP2, DP2s, DP2x, SD15 | DP1s: matched to Sigma Photo Pro's output (measured). Others: the camera's own calibration data in the file |
| Merrill | DP1 / DP2 / DP3 Merrill, SD1, SD1 Merrill | the camera's own calibration data |
| Quattro | dp0 / dp1 / dp2 / dp3 Quattro, sd Quattro, sd Quattro H | the camera's own calibration data, full top-layer resolution |
| Older | SD9, SD10, SD14 | not supported yet |

Not affiliated with or endorsed by Sigma Corporation. "Sigma" and "Foveon" are trademarks of their owners and are used
here only to say which files PPcraft opens.

## Feedback

Bug reports and requests: [open an issue](https://github.com/swallowlikeyoshi/ppcraft/issues/new). Please include the
camera model, the browser, and, if you can share it, the X3F file.

## Licence

PPcraft is built on [LightCraft](https://github.com/storytold/lightcraft) (MIT OR Apache-2.0); see
[LICENSE.md](LICENSE.md). The X3F container format follows Kalpanika's
[x3f_tools](https://github.com/Kalpanika/x3f) (BSD licence).

The sample photo (`sample/SDIM0076.X3F`, Help ▸ Try a Sample Photo) is a Sigma DP2 Merrill file from
[raw.pixls.us](https://raw.pixls.us/), released into the public domain (CC0) by its uploader.

## Publishing (maintainers)

This repository holds only the built site. It is published from the source repository's `site` workflow when a
version tag is pushed: `git tag v0.1.0 && git push origin v0.1.0`.
