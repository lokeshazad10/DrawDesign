const DB_NAME = "drawdesign-images";
const DB_VERSION = 1;
const STORE_NAME = "images";

let dbPromise = null;

function storageError(action, cause) {
  if (cause?.__drawdesign) return cause;
  const name = cause?.name ?? "";
  const full = name
    ? `${name}: ${cause.message ?? ""}`
    : (cause?.message ?? "");
  let message;
  if (
    name === "QuotaExceededError" ||
    name === "NS_ERROR_DOM_QUOTA_REACHED" ||
    cause?.code === 22
  ) {
    message = "Image storage is full. Try a smaller image or clear old images.";
  } else if (!cause || !("indexedDB" in globalThis)) {
    message = "Image storage (IndexedDB) is not available in this browser.";
  } else {
    message = `Could not ${action} image storage. ${full}`.trim();
  }
  const error = new Error(message);
  error.__drawdesign = true;
  return error;
}

export function isImageStoreAvailable() {
  return typeof indexedDB !== "undefined";
}

export function openImageDb() {
  if (!isImageStoreAvailable())
    return Promise.reject(
      storageError("open", new Error("IndexedDB is unavailable")),
    );
  if (!dbPromise) {
    dbPromise = new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);
      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains(STORE_NAME))
          db.createObjectStore(STORE_NAME, { keyPath: "id" });
      };
      request.onsuccess = () => {
        const db = request.result;
        db.onversionchange = () => {
          db.close();
          dbPromise = null;
        };
        resolve(db);
      };
      request.onerror = () => reject(storageError("open", request.error));
      request.onblocked = () =>
        reject(
          storageError(
            "open",
            new Error(
              "Another tab is blocking image storage. Close it and retry.",
            ),
          ),
        );
    }).catch((err) => {
      dbPromise = null;
      throw err;
    });
  }
  return dbPromise;
}

function run(mode, action, requestStore) {
  return openImageDb().then(
    (db) =>
      new Promise((resolve, reject) => {
        let request;
        let result;
        let tx;
        try {
          tx = db.transaction(STORE_NAME, mode);
          request = requestStore(tx.objectStore(STORE_NAME));
        } catch (err) {
          reject(storageError(action, err));
          return;
        }
        request.onsuccess = () => {
          result = request.result;
        };
        request.onerror = () => reject(storageError(action, request.error));
        tx.onabort = () => reject(storageError(action, tx.error));
        tx.onerror = () => reject(storageError(action, tx.error));
        tx.oncomplete = () => resolve(result);
      }),
  );
}

export function saveImage(id, blob, mimeType = blob?.type) {
  if (!id) return Promise.reject(storageError("save", new Error("Missing id")));
  const record = {
    id,
    blob,
    mimeType: mimeType || "application/octet-stream",
    createdAt: Date.now(),
  };
  return run("readwrite", "save", (store) => store.put(record));
}

export function getImage(id) {
  if (!id) return Promise.resolve(undefined);
  return run("readonly", "read", (store) => store.get(id));
}

export function deleteImage(id) {
  if (!id) return Promise.resolve();
  return run("readwrite", "delete", (store) => store.delete(id));
}

export function clearImages() {
  return run("readwrite", "clear", (store) => store.clear());
}

export function getAllImageIds() {
  return run("readonly", "list", (store) => store.getAllKeys());
}
