import test from "node:test";
import assert from "node:assert/strict";

const records = new Map();

function fakeRequest(run) {
  const request = { result: undefined, error: undefined };
  setTimeout(() => {
    try {
      request.result = run();
      request.onsuccess?.({ target: request });
    } catch (err) {
      request.error = err;
      request.onerror?.({ target: request });
    }
  }, 0);
  return request;
}

function fakeDb() {
  return {
    objectStoreNames: { contains: (name) => name === "images" },
    createObjectStore() {},
    close() {},
    transaction() {
      const tx = { error: null };
      const store = {
        put: (value) =>
          fakeRequest(() => {
            records.set(value.id, value);
            return value.id;
          }),
        get: (key) => fakeRequest(() => records.get(key)),
        delete: (key) =>
          fakeRequest(() => {
            records.delete(key);
          }),
        clear: () =>
          fakeRequest(() => {
            records.clear();
          }),
        getAllKeys: () => fakeRequest(() => [...records.keys()]),
      };
      tx.objectStore = () => store;
      setTimeout(() => tx.oncomplete?.(), 5);
      return tx;
    },
  };
}

globalThis.indexedDB = {
  open() {
    const request = {};
    setTimeout(() => {
      request.result = fakeDb();
      request.onsuccess?.({ target: request });
    }, 0);
    return request;
  },
};

let urlCount = 0;
const revoked = [];
globalThis.URL.createObjectURL = () => `blob:fake-${++urlCount}`;
globalThis.URL.revokeObjectURL = (url) => revoked.push(url);
globalThis.Image = class {
  constructor() {
    this.complete = false;
    this.naturalWidth = 0;
    this.naturalHeight = 0;
  }
  set src(value) {
    this._src = value;
    setTimeout(() => {
      this.naturalWidth = 40;
      this.naturalHeight = 20;
      this.complete = true;
      this.onload?.();
    }, 0);
  }
  get src() {
    return this._src;
  }
};

const store = await import("../src/features/board/lib/imageStore.js");
const images = await import("../src/features/board/lib/images.js");
const boardModel = await import("../src/features/board/model/useBoard.js");

test("imageStore saves, reads, deletes and clears records", async () => {
  const blob = new Blob(["abc"], { type: "image/png" });
  await store.saveImage("a", blob, "image/png");
  const record = await store.getImage("a");
  assert.equal(record.id, "a");
  assert.equal(record.mimeType, "image/png");
  assert.ok(record.createdAt > 0);
  assert.equal(await record.blob.text(), "abc");

  await store.deleteImage("a");
  assert.equal(await store.getImage("a"), undefined);
  await store.saveImage("b", blob);
  await store.clearImages();
  assert.deepEqual(await store.getAllImageIds(), []);
});

test("importImageFile stores the blob and returns a fileId reference", async () => {
  const file = new Blob([new Uint8Array([1, 2, 3])], { type: "image/png" });
  file.name = "pic.png";
  const meta = await images.importImageFile(file);
  assert.ok(meta.fileId);
  assert.deepEqual([meta.width, meta.height], [40, 20]);
  assert.equal(meta.name, "pic.png");
  const record = await store.getImage(meta.fileId);
  assert.equal(record.blob, file);
  await store.deleteImage(meta.fileId);
});

test("legacy base64 migration is idempotent and survives export/import", async () => {
  await store.clearImages();
  const blob = new Blob([new Uint8Array([9, 8, 7])], { type: "image/png" });
  const dataUrl = await images.blobToDataURL(blob);
  const legacy = [{ id: "el-1", type: "image", src: dataUrl, width: 40, height: 20 }];

  const first = await images.migrateImageElements(legacy);
  assert.equal(first.changed, true);
  assert.ok(first.elements[0].fileId);
  assert.ok(!("src" in first.elements[0]));
  assert.equal((await store.getAllImageIds()).length, 1);

  const second = await images.migrateImageElements(first.elements);
  assert.equal(second.changed, false);
  assert.equal((await store.getAllImageIds()).length, 1);

  const scene = {
    elements: first.elements,
    view: { x: 0, y: 0, zoom: 1 },
    style: {},
    grid: false,
    theme: "light",
  };
  const local = boardModel.serializeScene(scene);
  assert.ok(!("src" in local.elements[0]));
  assert.equal(JSON.stringify(local).includes("base64"), false);

  const exported = await boardModel.exportScene(scene);
  assert.equal(exported.version, 2);
  assert.match(exported.elements[0].src, /^data:image\/png;base64,/);

  const reimported = await images.migrateImageElements(exported.elements);
  assert.equal(reimported.elements[0].fileId, first.elements[0].fileId);
  assert.ok(!("src" in reimported.elements[0]));
  assert.equal((await store.getAllImageIds()).length, 1);
});

test("15 images stay small in localStorage", () => {
  const elements = Array.from({ length: 15 }, (_, i) => ({
    id: `img-${i}`,
    type: "image",
    fileId: `file-${i}`,
    width: 200,
    height: 100,
  }));
  const json = JSON.stringify(
    boardModel.serializeScene({
      elements,
      view: {},
      style: {},
      grid: false,
      theme: "light",
    }),
  );
  assert.ok(json.length < 5000);
  assert.equal(json.includes("base64"), false);
});

test("decoded images use an LRU cache and release object URLs", async () => {
  images.releaseAllImages();
  revoked.length = 0;
  await store.clearImages();
  const ids = Array.from({ length: 13 }, (_, i) => `lru-${i}`);
  for (const id of ids)
    await store.saveImage(id, new Blob(["x"], { type: "image/png" }));
  for (const id of ids) await images.loadImage(id);

  assert.equal(revoked.length, 1, "oldest URL revoked when the cache fills");
  assert.ok(images.getImage(ids[12]), "newest image stays decoded");
  images.releaseAllImages();
  assert.equal(revoked.length, 13, "all remaining URLs revoked on unmount");
});

test("missing IndexedDB produces a clear error", async () => {
  const original = globalThis.indexedDB;
  delete globalThis.indexedDB;
  try {
    const fresh = await import(
      "../src/features/board/lib/imageStore.js?unavailable"
    );
    await assert.rejects(() => fresh.openImageDb(), /not available/i);
  } finally {
    globalThis.indexedDB = original;
  }
});
