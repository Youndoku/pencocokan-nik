import { useState, useEffect, useCallback } from "react";
import {
  ambilSemuaSesi,
  simpanSesi as dbSimpan,
  hapusSesi as dbHapus,
  hapusBanyakSesi as dbHapusBanyak,
  ambilSesi as dbAmbil,
} from "../utils/db.js";

export function useRiwayat() {
  const [sesiList, setSesiList] = useState([]);
  const [loading, setLoading] = useState(true);

  const muat = useCallback(async () => {
    try {
      setLoading(true);
      const data = await ambilSemuaSesi();
      // Sort descending by tanggal (newest first)
      data.sort((a, b) => new Date(b.tanggal) - new Date(a.tanggal));
      setSesiList(data);
    } catch (err) {
      console.error("Gagal memuat riwayat:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    muat();
  }, [muat]);

  const simpanSesi = useCallback(
    async (sesi) => {
      await dbSimpan(sesi);
      await muat();
    },
    [muat]
  );

  const hapusSesi = useCallback(
    async (id) => {
      await dbHapus(id);
      await muat();
    },
    [muat]
  );

  const hapusBanyakSesi = useCallback(
    async (ids) => {
      await dbHapusBanyak(ids);
      await muat();
    },
    [muat]
  );

  const ambilSesi = useCallback(async (id) => {
    return dbAmbil(id);
  }, []);

  // Estimate storage size in bytes (rough)
  const totalUkuran = sesiList.reduce((acc, s) => {
    const ringkasanSize = JSON.stringify(s.ringkasan || {}).length;
    const dataSize = s.dataHasil ? JSON.stringify(s.dataHasil).length : 0;
    const bufferSize = s.excelBuffer ? s.excelBuffer.byteLength : 0;
    return acc + ringkasanSize + dataSize + bufferSize;
  }, 0);

  return {
    sesiList,
    jumlahSesi: sesiList.length,
    loading,
    simpanSesi,
    hapusSesi,
    hapusBanyakSesi,
    ambilSesi,
    totalUkuran,
    muat,
  };
}
