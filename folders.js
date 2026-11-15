// Linked folders: photos imported from a folder the user picked stay in that folder. Their handles are kept in
// IndexedDB (database "ppcraft-folders"), and the page and the render workers read files through them on demand
// instead of copying the bytes into browser storage. Needs the File System Access API (Chrome, Edge); after a
// reload the browser asks again for permission, which the page requests on the first click.
const DB = "ppcraft-folders";

function db() {
  return new Promise((resolve, reject) => {
    const r = indexedDB.open(DB, 1);
    r.onupgradeneeded = () => r.result.createObjectStore("handles");
    r.onsuccess = () => resolve(r.result);
    r.onerror = () => reject(r.error);
  });
}

async function tx(mode, fn) {
  const d = await db();
  return new Promise((resolve, reject) => {
    const t = d.transaction("handles", mode);
    const req = fn(t.objectStore("handles"));
    t.oncomplete = () => resolve(req && req.result);
    t.onerror = () => reject(t.error);
  });
}

const handles = new Map();

async function handle(id) {
  if (!handles.has(id)) handles.set(id, await tx("readonly", (s) => s.get(id)));
  return handles.get(id);
}

export const supported = () => typeof globalThis.showDirectoryPicker === "function";

// Lets the user pick a folder; resolves to { id, name, files: [[relativePath, File], ...] } for the files whose
// extension is in `extensions` (lower case, without the dot), searched recursively, or null when cancelled.
export async function pick(extensions) {
  let dir;
  try {
    dir = await globalThis.showDirectoryPicker({ id: "ppcraft-import", mode: "read" });
  } catch (e) {
    if (e && e.name === "AbortError") return null;
    throw e;
  }
  const id = String(Date.now().toString(36) + Math.random().toString(36).slice(2, 6));
  await tx("readwrite", (s) => s.put(dir, id));
  handles.set(id, dir);
  const want = new Set(extensions);
  const files = [];
  async function walk(d, prefix, depth) {
    for await (const [name, entry] of d.entries()) {
      if (name.startsWith(".")) continue;
      if (entry.kind === "directory") {
        if (depth < 8) await walk(entry, prefix + name + "/", depth + 1);
      } else {
        const ext = name.includes(".") ? name.split(".").pop().toLowerCase() : "";
        if (want.has(ext)) files.push([prefix + name, await entry.getFile()]);
      }
    }
  }
  await walk(dir, "", 0);
  return { id, name: dir.name, files };
}

// The bytes of `rel` in linked folder `id`, or null (folder forgotten, file gone, or permission not granted yet).
export async function read(id, rel) {
  try {
    let d = await handle(id);
    if (!d) return null;
    const parts = rel.split("/");
    for (const p of parts.slice(0, -1)) d = await d.getDirectoryHandle(p);
    const f = await (await d.getFileHandle(parts[parts.length - 1])).getFile();
    return new Uint8Array(await f.arrayBuffer());
  } catch (e) {
    return null;
  }
}

// Asks again for read permission on every linked folder that needs it (call from a user gesture).
export async function reconnect() {
  try {
    const all = await tx("readonly", (s) => s.getAllKeys());
    for (const id of all || []) {
      const d = await handle(id);
      if (d && d.queryPermission && (await d.queryPermission({ mode: "read" })) !== "granted") {
        await d.requestPermission({ mode: "read" });
      }
    }
  } catch (e) {
    console.warn("linked folders:", e);
  }
}
