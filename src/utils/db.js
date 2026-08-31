import { openDB as idbOpen } from "idb";

const DB_NAME = "pencocokan-nik-db";
const DB_VERSION = 1;

export function openDB() {
  return idbOpen(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains("sesi")) {
        const store = db.createObjectStore("sesi", { keyPath: "id" });
        store.createIndex("by-tanggal", "tanggal");
        store.createIndex("by-namaGabungan", "namaGabungan");
      }
    },
  });
}

export async function simpanSesi(sesi) {
  const db = await openDB();
  await db.put("sesi", sesi);
}

export async function ambilSesi(id) {
  const db = await openDB();
  return db.get("sesi", id);
}

export async function ambilSemuaSesi() {
  const db = await openDB();
  return db.getAllFromIndex("sesi", "by-tanggal");
}

export async function hapusSesi(id) {
  const db = await openDB();
  await db.delete("sesi", id);
}

export async function hapusBanyakSesi(ids) {
  const db = await openDB();
  const tx = db.transaction("sesi", "readwrite");
  await Promise.all(ids.map((id) => tx.store.delete(id)));
  await tx.done;
}

export async function hitungJumlahSesi() {
  const db = await openDB();
  return db.count("sesi");
}

export function generateId() {
  return crypto.randomUUID();
}
