// LightCraft render worker: a second instance of the app's wasm module that renders jobs posted
// by the page (see apps/lightcraft-web/src/workers.rs). The first message carries the compiled
// WebAssembly.Module and the storage backend kind; the module then takes over `onmessage`.
import init, { worker_main } from "./lightcraft_web.js";
import * as folders from "./folders.js";
// linked folders: originals read through their stored handles (folders.js)
self.ppcraftFolders = folders;

self.onmessage = async (e) => {
  self.onmessage = null;
  try {
    await init({ module_or_path: e.data.module });
    worker_main(e.data.store, e.data.gpu);
  } catch (err) {
    // surfaces as the Worker's `error` event on the page, which falls back to inline rendering
    setTimeout(() => { throw err; });
  }
};
