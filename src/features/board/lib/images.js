import {
  deleteImage,
  getAllImageIds,
  getImage as getImageRecord,
  saveImage,
} from "./imageStore.js";

export { clearImages, deleteImage, getAllImageIds } from "./imageStore.js";

const CACHE_LIMIT = 12;
const IMAGE_SIZE_LIMIT = 10 * 1024 * 1024;
const cache = new Map();
const pending = new Map();
const legacy = new Map();
const legacyPending = new Map();

const touch = (map, key, entry) => {
  map.delete(key);
  map.set(key, entry);
};

const evict = (map, onEvict) => {
  while (map.size > CACHE_LIMIT) {
    const [key, entry] = map.entries().next().value;
    map.delete(key);
    onEvict?.(entry);
  }
};

const createUrl = (blob) => {
  if (typeof URL === "undefined" || !URL.createObjectURL)
    throw new Error("This browser cannot create image object URLs");
  return URL.createObjectURL(blob);
};

const revoke = (url) => {
  if (url && typeof URL !== "undefined" && URL.revokeObjectURL)
    URL.revokeObjectURL(url);
};

const decodeImage = (src) =>
  new Promise((resolve, reject) => {
    if (typeof Image === "undefined") {
      reject(new Error("Images cannot be decoded in this environment"));
      return;
    }
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Could not decode image"));
    img.src = src;
  });

const newId = () =>
  typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 10)}`;

export function confirmLargeImage(file) {
  if (!file || file.size <= IMAGE_SIZE_LIMIT) return true;
  if (typeof confirm !== "function") return true;
  const mb = (file.size / 1024 / 1024).toFixed(1);
  return confirm(
    `This image is ${mb} MB. Large images can be slow and may exceed browser storage. Continue?`,
  );
}

export function blobToDataURL(blob) {
  const mime = blob?.type || "application/octet-stream";
  if (typeof FileReader !== "undefined")
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result));
      reader.onerror = () => reject(reader.error);
      reader.readAsDataURL(blob);
    });
  return blob.arrayBuffer().then((buffer) => {
    const bytes = new Uint8Array(buffer);
    let binary = "";
    for (let i = 0; i < bytes.length; i += 8192)
      binary += String.fromCharCode(...bytes.subarray(i, i + 8192));
    const base64 =
      typeof btoa === "function"
        ? btoa(binary)
        : globalThis.Buffer
          ? globalThis.Buffer.from(bytes).toString("base64")
          : (() => {
              throw new Error("Cannot encode image data");
            })();
    return `data:${mime};base64,${base64}`;
  });
}

export function dataURLToBlob(dataUrl) {
  const match = /^data:([^;,]*)(;base64)?,(.*)$/s.exec(String(dataUrl));
  if (!match) throw new Error("Not a data URL");
  const mime = match[1] || "application/octet-stream";
  if (!match[2])
    return new Blob([decodeURIComponent(match[3])], { type: mime });
  if (typeof atob === "function") {
    const binary = atob(match[3]);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
    return new Blob([bytes], { type: mime });
  }
  if (globalThis.Buffer)
    return new Blob([new Uint8Array(globalThis.Buffer.from(match[3], "base64"))], {
      type: mime,
    });
  throw new Error("Cannot decode image data");
}

function loadLegacyImage(src) {
  const cached = legacy.get(src);
  if (cached) {
    touch(legacy, src, cached);
    return Promise.resolve(cached.img);
  }
  if (legacyPending.has(src)) return legacyPending.get(src);
  const task = decodeImage(src)
    .then((img) => {
      legacy.set(src, { img, url: null });
      evict(legacy);
      return img;
    })
    .finally(() => legacyPending.delete(src));
  legacyPending.set(src, task);
  return task;
}

export function getImage(key) {
  if (!key) return null;
  const map = cache.has(key) ? cache : legacy.has(key) ? legacy : null;
  if (!map) return null;
  const entry = map.get(key);
  touch(map, key, entry);
  return entry.img.complete && entry.img.naturalWidth ? entry.img : null;
}

export function loadImage(key) {
  if (!key) return Promise.reject(new Error("Missing image id"));
  if (String(key).startsWith("data:")) return loadLegacyImage(key);
  const cached = cache.get(key);
  if (cached) {
    touch(cache, key, cached);
    return Promise.resolve(cached.img);
  }
  if (pending.has(key)) return pending.get(key);
  const task = (async () => {
    const record = await getImageRecord(key);
    if (!record?.blob)
      throw new Error(
        "An image is missing from storage. Re-import the board to restore it.",
      );
    const url = createUrl(record.blob);
    try {
      const img = await decodeImage(url);
      cache.set(key, { img, url });
      evict(cache, (entry) => {
        if (entry.url !== url) revoke(entry.url);
      });
      return img;
    } catch (err) {
      revoke(url);
      throw err;
    }
  })();
  const wrapped = task.finally(() => pending.delete(key));
  pending.set(key, wrapped);
  return wrapped;
}

export function preloadImages(elements) {
  const keys = new Set();
  for (const el of elements ?? []) {
    if (el?.type !== "image") continue;
    const key = el.fileId || el.src;
    if (key) keys.add(key);
  }
  return Promise.all([...keys].map((key) => loadImage(key)));
}

export function releaseImage(key) {
  if (!key) return;
  const entry = cache.get(key) ?? legacy.get(key);
  if (!entry) return;
  cache.delete(key);
  legacy.delete(key);
  revoke(entry.url);
}

export function releaseAllImages() {
  for (const entry of cache.values()) revoke(entry.url);
  cache.clear();
  legacy.clear();
}

export async function readImageFile(file) {
  if (!file?.type?.startsWith("image/"))
    throw new Error("That file is not an image");
  const url = createUrl(file);
  let img;
  try {
    img = await decodeImage(url);
  } finally {
    revoke(url);
  }
  return {
    blob: file,
    mimeType: file.type,
    width: img.naturalWidth || img.width || 1,
    height: img.naturalHeight || img.height || 1,
    name: file.name || "image",
  };
}

export async function importImageFile(file) {
  const image = await readImageFile(file);
  const fileId = newId();
  await saveImage(fileId, image.blob, image.mimeType);
  return {
    fileId,
    width: image.width,
    height: image.height,
    name: image.name,
    mimeType: image.mimeType,
  };
}

export function fitImageSize(width, height, max = 360) {
  const w = Math.max(1, width || 1);
  const h = Math.max(1, height || 1);
  const scale = Math.min(1, max / Math.max(w, h));
  return {
    width: Math.max(1, Math.round(w * scale)),
    height: Math.max(1, Math.round(h * scale)),
  };
}

export function withoutImageSource(el) {
  if (el?.type !== "image" || !el.fileId || !("src" in el)) return el;
  const next = { ...el };
  delete next.src;
  return next;
}

export async function withImageSources(elements) {
  return Promise.all(
    (elements ?? []).map(async (el) => {
      if (el?.type !== "image" || !el.fileId || el.src?.startsWith("data:"))
        return el;
      const record = await getImageRecord(el.fileId);
      if (!record?.blob)
        throw new Error(
          "Some images are missing from storage and could not be exported.",
        );
      return { ...el, src: await blobToDataURL(record.blob) };
    }),
  );
}

export async function migrateImageElements(elements) {
  const bySource = new Map();
  const result = [];
  let changed = false;
  for (const el of elements ?? []) {
    if (el?.type !== "image" || !el.src?.startsWith("data:")) {
      result.push(el);
      continue;
    }
    const src = el.src;
    const fileId = bySource.get(src) || el.fileId || newId();
    bySource.set(src, fileId);
    const existing = await getImageRecord(fileId);
    if (!existing?.blob) {
      const blob = dataURLToBlob(src);
      await saveImage(fileId, blob, blob.type);
    }
    const next = { ...el };
    delete next.src;
    result.push({ ...next, fileId });
    releaseImage(src);
    changed = true;
  }
  return { elements: result, changed };
}

export function findRemovedImageKeys(previous = [], next = [], keepIds = []) {
  const used = new Set([
    ...next
      .filter((el) => el?.type === "image" && el.fileId)
      .map((el) => el.fileId),
    ...keepIds.filter(Boolean),
  ]);
  const removed = new Set();
  for (const el of previous) {
    if (el?.type !== "image" || !el.fileId || used.has(el.fileId)) continue;
    if (next.some((candidate) => candidate.src === el.src && candidate.src))
      continue;
    removed.add(el.fileId);
  }
  return [...removed];
}

export async function pruneImageRecords(keepIds = []) {
  const ids = await getAllImageIds();
  const keep = new Set(keepIds.filter(Boolean));
  const stale = ids.filter((id) => !keep.has(id));
  for (const id of stale) {
    releaseImage(id);
    await deleteImage(id).catch(() => null);
  }
  return stale;
}
