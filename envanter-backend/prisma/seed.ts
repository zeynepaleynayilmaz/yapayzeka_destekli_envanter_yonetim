import csv from "csv-parser";
import fs from "fs";
import path from "path";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

function readCsvFile(fileName: string) {
  const cwd = process.cwd();
  const filePath = path.join(cwd, "csv_files", fileName);

  return new Promise((resolve, reject) => {
    let results: any[] = [];
    fs.createReadStream(filePath)
      .pipe(csv())
      .on("data", (data) => results.push(data))
      .on("end", () => {
        resolve(results);
      });
  });
}

const mapOdemeYontemi = (
  value: string
): "KrediKarti" | "Havale" | "KapidaOdeme" | "Nakit" => {
  switch (value.toLowerCase()) {
    case "kredi kartı":
      return "KrediKarti";
    case "havale":
      return "Havale";
    case "kapida odeme":
      return "KapidaOdeme";
    case "nakit":
      return "Nakit";
    default:
      throw new Error(`Geçersiz ödeme yöntemi: ${value}`);
  }
};

async function clearAllData() {
  await prisma.$executeRaw`TRUNCATE TABLE "public"."Urun" CASCADE;`;
  await prisma.$executeRaw`TRUNCATE TABLE "public"."AltKategori" CASCADE;`;
  await prisma.$executeRaw`TRUNCATE TABLE "public"."AnaKategori" CASCADE;`;
  await prisma.$executeRaw`TRUNCATE TABLE "public"."Satis" CASCADE;`;
  await prisma.$executeRaw`TRUNCATE TABLE "public"."Fiyat" CASCADE;`;
  await prisma.$executeRaw`TRUNCATE TABLE "public"."Stok" CASCADE;`;
}

async function main() {
  await clearAllData();

  const fileNames = [
    "ocak.csv",
    "subat.csv",
    "mart.csv",
    "nisan.csv",
    "mayis.csv",
    "haziran.csv",
    "temmuz.csv",
    "agustos.csv",
    "eylul.csv",
    "ekim.csv",
    "kasim.csv",
    "aralik.csv",
  ];

  let anaKategoriler: any[] = [],
    altKategoriler: any[] = [],
    urunler: any[] = [];

  for (const fileName of fileNames) {
    const data = (await readCsvFile(fileName)) as any[];

    for (const row of data) {
      const anaKategori = {
        id: Number(row.ana_kategori_id),
        kategori_adi: row.ana_kategori,
      };
      const altKategori = {
        id: Number(row.alt_kategori_id),
        kategori_adi: row.alt_kategori,
        anaKategoriId: Number(row.ana_kategori_id),
      };

      if (!anaKategoriler.find((x) => x.id === anaKategori.id)) {
        anaKategoriler.push(anaKategori);
      }

      if (!altKategoriler.find((x) => x.id === altKategori.id)) {
        altKategoriler.push(altKategori);
      }

      const urun = {
        urun_turu: row.urun_turu,
        urun_modeli: row.urun_modeli,
        altKategoriId: Number(row.alt_kategori_id),
        normal_fiyat: Number(row.normal_fiyat),
        indirimli_fiyat: Number(row.indirimli_fiyat),
        stok_adedi: Number(row.stok_adedi),
        indirim_satis_adedi: Number(row.indirim_satis_adedi),
        normal_satis_adedi: Number(row.normal_satis_adedi),
        stok_giris_tarihi: new Date(row.stok_giris_tarihi),
        stok_cikis_tarihi: new Date(row.stok_cikis_tarihi),
        customUrunId: Number(row.urun_id),
        odeme_yontemi: row.odeme_yontemi,
      };

      urunler.push(urun);
    }
  }

  await prisma.anaKategori.createMany({ data: anaKategoriler });
  await prisma.altKategori.createMany({ data: altKategoriler });

  urunler.forEach(async (urunData) => {
    const { odeme_yontemi, customUrunId, ...rest } = urunData;

    const urun = await prisma.urun.create({ data: rest });
    await prisma.satis.create({
      data: {
        urunId: urun.id,
        odeme: mapOdemeYontemi(urunData.odeme_yontemi),
        satistarihi: new Date(urunData.stok_cikis_tarihi!),
        adet: Number(urunData.stok_adedi),
        indirim_satis_adedi: Number(urunData.indirim_satis_adedi),
        normal_satis_adedi: Number(urunData.normal_satis_adedi),
      },
    });

    await prisma.fiyat.create({
      data: {
        urunId: urun.id,
        normal_fiyat: Number(urunData.normal_fiyat),
        indirimli_fiyat: Number(urunData.indirimli_fiyat),
      },
    });
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
