import express, { Request, Response } from "express";
import bodyParser from "body-parser";
import cors from "cors";
import { PrismaClient } from "@prisma/client";
import dotenv from "dotenv";
import multer from "multer";
import fs from "fs";
import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";
import axios from 'axios';

dotenv.config({ path: "./envanter-backend/.env" });

const upload = multer({ dest: "uploads/" });
const app = express();
app.use(bodyParser.json());
app.use(cors());

app.use((req, res, next) => {
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  next();
});


async function getProductsWithPaymentMethods() {
  const products = await prismaClient.urun.findMany({
    include: {
      Fiyat: true, 
      Satis: {
        select: {
          odeme: true, 
        },
      },
    },
  });

  return products;
}

const prismaClient = new PrismaClient();
const genAI = new GoogleGenerativeAI(process.env.API_KEY!);


function fileToGenerativePart(path: string, mimeType: string) {
  return {
    inlineData: {
      data: fs.readFileSync(path).toString("base64"),
      mimeType,
    },
  };
}


app.post("/gemini",upload.single("image"),async (req: Request, res: Response): Promise<void> => {
    try {
      const image = req.file?.path;
      if (!image) {
        res.status(400).json({ error: "Resim yüklenemedi." });
        return;
      }

      console.log("Alınan resim yolu:", image);

      const prompt = `Fotoğrafı analiz et ve şu formatta yanıt ver: {"anaKategori": "Elektronik", "altKategori": "Telefon", "urunTuru": "Android Cep Telefon"}.
Eğer başka bir ürün varsa, lütfen aşağıdaki kategorilere göre yanıt ver:
- Ana Kategoriler: "Giyim", "Kozmetik", "Elektronik", "Ev"
- Alt Kategoriler: "Dış Giyim", "Ayakkabı", "Çocuk Giyim", "Üst Giyim", "Alt Giyim", "Aksesuar", "Makyaj", "Kişisel Bakım", "Küçük Ev Aletleri", "Giyilebilir Teknoloji", "Telefon", "Kamera", "Aksesuarlar", "Sofra & Mutfak", "Ev Tekstili", "Ev Gereçleri", "Ev Dekorasyon", "Mobilya"
- Ürün Türleri: Belirtilen alt kategorilere göre uygun olan ürün türlerini yaz.

Örneğin, bir telefon gördüysen bu cevabı ver:
{"altKategori": "Telefon", "anaKategori": "Elektronik", "urunTuru": "Android Cep Telefon"}`;
      const imageParts = [fileToGenerativePart(image, "image/jpeg")];

      const schema = {
        description: "Ürün bilgileri",
        type: SchemaType.OBJECT,
        properties: {
          anaKategori: {
            type: SchemaType.STRING,
            description: "Ürünün ana kategorisi",
            nullable: false,
          },
          altKategori: {
            type: SchemaType.STRING,
            description: "Ürünün alt kategorisi",
            nullable: false,
          },
          urunTuru: {
            type: SchemaType.STRING,
            description: "Ürünün türü",
            nullable: false,
          },
        },
        required: ["anaKategori", "altKategori", "urunTuru"],
      };

      const model = genAI.getGenerativeModel({
        model: "gemini-1.5-pro",
        generationConfig: {
          responseMimeType: "application/json",
          responseSchema: schema,
        },
      });

      const result = await model.generateContent([prompt, ...imageParts]);

      const response = result.response.text();
      console.log("Gemini Yanıtı:", response);

      res.json(JSON.parse(response));
    } catch (error) {
      console.error("Gemini API hatası:", error);
      res.status(500).json({ error: "Gemini API'den veri alınamadı." });
    }
  }
);
  //ödeme yönt getir
app.get("/products", async (req, res) => {
  try {
    const products = await getProductsWithPaymentMethods();
    res.json(products);
  } catch (error) {
    res.status(500).send("Error fetching products");
  }
});

app.get("/urunler", async (req, res) => {
  try {
    const urunler = await prismaClient.urun.findMany();
    res.json(urunler);
  } catch (error) {
    res.status(500).json({ error: "Ürünleri getirirken bir hata oluştu." });
  }
});

app.get("/anakategoriler", async (req, res) => {
  try {
    const anakategoriler = await prismaClient.anaKategori.findMany({
      include: {
        AltKategori: true,
      },
    });
    res.json(anakategoriler);
  } catch (error) {
    res
      .status(500)
      .json({ error: "Ana kategorileri getirirken bir hata oluştu." });
  }
});

app.get("/altkategoriler", async (req, res) => {
  try {
    const altkategoriler = await prismaClient.altKategori.findMany();
    res.json(altkategoriler);
  } catch (error) {
    res
      .status(500)
      .json({ error: "Alt kategorileri getirirken bir hata oluştu." });
  }
});

app.get("/urun-modelleri", async (req, res) => {
  const { altKategoriId, urunTuru } = req.query;
  try {
    const response = await prismaClient.urun.findMany({
      where: {
        altKategoriId: Number(altKategoriId),
        urun_turu: urunTuru?.toString(),
      },
      include: {
        Satis: true, // Satış bilgilerini dahil ederek ödeme yöntemine erişebiliriz
      },
    });
    res.json(response);
  } catch (error) {
    res
      .status(500)
      .json({ error: "Ürün modellerini getirirken bir hata oluştu." });
  }
});

// Ürün türlerini listele (benzersiz olarak)
app.get("/urun-turleri", async (req, res) => {
  const { altKategoriId } = req.query;
  try {
    const response = await prismaClient.urun.groupBy({
      by: ["urun_turu"],
      where: { altKategoriId: Number(altKategoriId) },
    });
    res.json(response);
  } catch (error) {
    res
      .status(500)
      .json({ error: "Ürün türlerini getirirken bir hata oluştu." });
  }
});

// Ürün ekleme endpoint'i
app.post("/urun-ekle", async (req, res) => {
  const body = req.body;
  const stokCikisTarihi =
    body.stok_cikis_tarihi && body.stok_cikis_tarihi !== ""
      ? new Date(body.stok_cikis_tarihi)
      : null;
  try {
    const response = await prismaClient.urun.create({
      data: {
        urun_turu: body.urun_turu,
        normal_fiyat: body.normal_fiyat,
        indirimli_fiyat: body.indirimli_fiyat,
        stok_adedi: body.stok_adedi,
        stok_giris_tarihi: new Date(body.stok_giris_tarihi),
        stok_cikis_tarihi: stokCikisTarihi,
        indirim_satis_adedi: body.indirim_satis_adedi,
        normal_satis_adedi: body.normal_satis_adedi,
        urun_modeli: body.urun_modeli,
        altKategoriId: body.altKategoriId,
      },
    });

    await logIslem(
      "Ürün Ekleme",
      `${body.urun_modeli} modeli eklendi`,
      response.id
    );

    res.json(response);
  } catch (error) {
    res.status(500).json({ error: "Ürün eklerken bir hata oluştu." });
  }
});

// Get payment method percentages
app.get("/payment-methods-percentage", async (req:Request, res:Response):  Promise <any> => {
  try {
    const totalSales = await prismaClient.satis.groupBy({
      by: ["odeme"],
      _sum: { adet: true },
    });

    const total = totalSales.reduce(
      (acc, curr) => acc + (curr._sum.adet || 0),
      0
    );

    if (total === 0) {
      return res.json([]);
    }

    const percentages = totalSales.map((sale) => ({
      paymentMethod: sale.odeme,
      percentage: ((sale._sum.adet || 0) / total) * 100,
    }));

    res.json(percentages);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error fetching payment methods" });
  }
});

//ürün kamera ekle
app.post("/urun-kamera-ekle", async (req, res) => {
  try {
    const yeniUrun = await prismaClient.urun.create({
      data: {
        urun_turu: req.body.urun_turu, 
        urun_modeli: req.body.urun_modeli,  
        normal_fiyat: req.body.normal_fiyat,  
        indirimli_fiyat: req.body.indirimli_fiyat,  
        stok_adedi: req.body.stok_adedi,  
        stok_giris_tarihi: new Date(req.body.stok_giris_tarihi), 
        stok_cikis_tarihi: req.body.stok_cikis_tarihi ? new Date(req.body.stok_cikis_tarihi) : null, 
        indirim_satis_adedi: req.body.indirim_satis_adedi, 
        normal_satis_adedi: req.body.normal_satis_adedi, 
        altKategoriId: req.body.altKategoriId, 
      },
    });
    console.log("Eklenen ürün:", yeniUrun);

    res.status(201).json(yeniUrun);
  } catch (error) {
    console.error("Veritabanı hatası:", error);
    res.status(500).json({ error: "Ürün ekleme başarısız oldu." });
  }
});

// Stok girişi endpoint'i
app.post("/stok-urun-ekle", async (req, res) => {
  const body = req.body;
  const stokCikisTarihi =
    body.stok_cikis_tarihi && body.stok_cikis_tarihi !== ""
      ? new Date(body.stok_cikis_tarihi)
      : null;
  try {
    const response = await prismaClient.stok.create({
      data: {
        urunId: body.urunId,
        stok_adedi: body.stok_adedi,
        stok_giris_tarihi: new Date(body.stok_giris_tarihi),
        stok_cikis_tarihi: stokCikisTarihi,
      },
    });
    
    await logIslem(
      "Stok Girişi",
      `${body.stok_adedi} adet ürün stoka eklendi`,
      body.urunId
    );
    
    res.json(response);
  } catch (error) {
    res.status(500).json({ error: "Stok eklerken bir hata oluştu." });
  }
});

// Ürün güncelleme endpoint'i
app.put("/urunguncelle", async (req: Request, res: Response): Promise<any> => {
  const {
    id,
    normal_fiyat,
    indirimli_fiyat,
    stok_adedi,
    indirim_satis_adedi,
    normal_satis_adedi,
  } = req.body;

  try {
    const urun = await prismaClient.urun.findUnique({
      where: { id: id }, 
    });

    if (urun) {
      const updatedUrun = await prismaClient.urun.update({
        where: { id: urun.id },
        data: {
          normal_fiyat: normal_fiyat,
          indirimli_fiyat: indirimli_fiyat,
          stok_adedi: stok_adedi,
          indirim_satis_adedi: indirim_satis_adedi,
          normal_satis_adedi: normal_satis_adedi,
        },
      });

      await logIslem(
        "Ürün Güncelleme",
        `ID: ${id} olan ürün güncellendi`,
        id
      );

      res.status(200).json({
        message: "Ürün başarıyla güncellendi.",
        urun: updatedUrun,
      });
    } else {
      res.status(404).json({ message: "Ürün bulunamadı." });
    }
  } catch (error) {
    res.status(500).json({ error: "Ürün güncellenirken bir hata oluştu." });
  }
});


//ürün çıkış tarihi güncelle
app.put(
  "/uruncikisyap",
  async (req: Request, res: Response): Promise<void> => {
    const { id } = req.body; 
    try {
      const stokCikisTarihi = new Date(); 
      const response = await prismaClient.urun.update({ 
        where: { id: Number(id) }, 
        data: {
          stok_cikis_tarihi: stokCikisTarihi, 
        },
      });

      await logIslem(
        "Stok Çıkışı",
        `ID: ${id} olan ürün için çıkış yapıldı`,
        id
      );

      res.json(response);
    } catch (error) {
      console.error("Ürün çıkış tarihi güncellenirken hata oluştu:", error);
      res
        .status(500)
        .json({ error: "Ürün çıkış tarihi güncellenirken bir hata oluştu." });
    }
  }
);

// Ürün silme endpoint'i
app.delete("/urunsil", async (req, res) => {
  const { id } = req.body;
  try {
    const urun = await prismaClient.urun.findUnique({
      where: { id: Number(id) },
      select: { urun_modeli: true }
    });

    const response = await prismaClient.urun.delete({
      where: { id: Number(id) },
    });

    await logIslem(
      "Ürün Silme",
      `${urun?.urun_modeli || 'Bilinmeyen ürün'} silindi`,
      id
    );

    res.json(response);
  } catch (error) {
    res.status(500).json({ error: "Ürün silerken bir hata oluştu." });
  }
});

//en çok stokta olan ürünleri getir
app.get("/top10-stok", async (req: Request, res: Response) => {
  try {
    const year = parseInt(req.query.year as string);
    const month = parseInt(req.query.month as string);

    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);

    const products = await prismaClient.urun.findMany({
      where: {
        stok_giris_tarihi: {
          gte: startDate,
          lt: endDate,
        },
      },
      orderBy: {
        stok_adedi: "desc",
      },
      take: 10,
      select: {
        urun_modeli: true,
        stok_adedi: true,
      },
    });

    res.json(products);
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({ error: "Bir hata oluştu" });
  }
});

// En hızlı satılan 10 ürünü getiren endpoint
app.get("/top10-fastest-selling", async (req: Request, res: Response) => {
  try {
    const year = parseInt(req.query.year as string);
    const month = parseInt(req.query.month as string);

    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);
    const products = await prismaClient.urun.findMany({
      select: {
        urun_modeli: true,
        stok_giris_tarihi: true,
        stok_cikis_tarihi: true,
      },
      where: {
        stok_cikis_tarihi: {
          not: null, 
        },
        stok_giris_tarihi: {
          gte: startDate,
          lt: endDate, 
        },
      },
    });
    const productsWithSaleTime = products.map((product) => {
      const stokGiris = product.stok_giris_tarihi
        ? new Date(product.stok_giris_tarihi)
        : null;
      const stokCikis = product.stok_cikis_tarihi
        ? new Date(product.stok_cikis_tarihi)
        : null;
      if (!stokGiris || !stokCikis) {
        return {
          urun_modeli: product.urun_modeli,
          satis_suresi: Number.MAX_VALUE,
        };
      }
      const fark =
        (stokCikis.getTime() - stokGiris.getTime()) / (1000 * 60 * 60 * 24); // Gün cinsinden fark
      return { urun_modeli: product.urun_modeli, satis_suresi: fark };
    });

    const top10FastestSelling = productsWithSaleTime
      .sort((a, b) => a.satis_suresi - b.satis_suresi)
      .slice(0, 10);
    res.json(top10FastestSelling);
  } catch (error) {
    console.error("Error fetching fastest selling products:", error);
    res.status(500).json({ error: "Bir hata oluştu" });
  }
});

//en yavaş satılan 10 ürünü getir
app.get("/top10-enyavas-selling", async (req: Request, res: Response) => {
  try {
    const year = parseInt(req.query.year as string);
    const month = parseInt(req.query.month as string);

    // Başlangıç ve bitiş tarihini belirliyoruz
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);

    const products = await prismaClient.urun.findMany({
      select: {
        urun_modeli: true,
        stok_giris_tarihi: true,
        stok_cikis_tarihi: true,
      },
      where: {
        stok_cikis_tarihi: {
          not: null, // Çıkış tarihi olan ürünler
        },
        stok_giris_tarihi: {
          gte: startDate,
          lt: endDate, // İlgili ayın verisi
        },
      },
    });
    // Stok giriş ve çıkış tarihleri arasındaki farkı hesapla
    const productsWithSaleTime = products.map((product) => {
      const stokGiris = product.stok_giris_tarihi
        ? new Date(product.stok_giris_tarihi)
        : null;
      const stokCikis = product.stok_cikis_tarihi
        ? new Date(product.stok_cikis_tarihi)
        : null;

      if (!stokGiris || !stokCikis) {
        return {
          urun_modeli: product.urun_modeli,
          satis_suresi: Number.MAX_VALUE,
        };
      }

      const fark =
        (stokCikis.getTime() - stokGiris.getTime()) / (1000 * 60 * 60 * 24); // Gün cinsinden fark
      return { urun_modeli: product.urun_modeli, satis_suresi: fark };
    });

    // En hızlı satılan 10 ürünü sırala
    const top10FastestSelling = productsWithSaleTime
      .sort((a, b) => b.satis_suresi - a.satis_suresi)
      .slice(0, 10);

    res.json(top10FastestSelling);
  } catch (error) {
    console.error("Error fetching fastest selling products:", error);
    res.status(500).json({ error: "Bir hata oluştu" });
  }
});

// API endpoint: Get sales data (indirimli ve normal satış adedi)
app.get("/sales-data", async (req: Request, res: Response): Promise<any> => {
  const urunId = req.query.urunId;
  try {
    if (urunId) {
      // Belirli bir ürün için verileri döndür
      const salesData = await prismaClient.satis.aggregate({
        where: { urunId: parseInt(urunId as string) },
        _sum: {
          indirim_satis_adedi: true,
          normal_satis_adedi: true,
        },
      });

      return res.json({
        urunId: parseInt(urunId as string),
        indirimli: salesData._sum?.indirim_satis_adedi || 0,
        normal: salesData._sum?.normal_satis_adedi || 0,
      });
    } else {
      // Tüm ürünlerin verilerini döndür
      const salesData = await prismaClient.satis.findMany({
        include: {
          urun: {
            select: { urun_modeli: true },
          },
        },
      });

      const formattedData = salesData.map((sale) => ({
        urun_modeli: sale.urun.urun_modeli,
        indirim_satis_adedi: sale.indirim_satis_adedi || 0,
        normal_satis_adedi: sale.normal_satis_adedi || 0,
      }));

      return res.json(formattedData);
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Veri alınamadı" });
  }
});

// Ana kategorilere ait ürün sayısını getir
app.get("/category-product-count", async (req, res) => {
  try {
    const categoryCounts = await prismaClient.anaKategori.findMany({
      include: {
        AltKategori: {
          include: {
            Urun: true, // Alt kategoriler altındaki ürünleri alıyoruz
          },
        },
      },
    });

    const result = categoryCounts.map((category) => ({
      kategoriAdi: category.kategori_adi,
      urunSayisi: category.AltKategori.reduce(
        (count, altKategori) => count + altKategori.Urun.length,
        0
      ),
    }));

    res.json(result);
  } catch (error) {
    console.error("Ana kategorilere ait ürün sayısı alınırken hata oluştu:", error);
    res.status(500).json({ error: "Ana kategorilere ait ürün sayısı alınamadı." });
  }
});

// Alt kategorilere ait ürün sayısını getir
app.get(
  "/subcategory-product-count/:categoryId",
  async (req: Request, res: Response): Promise<any> => {
    const { categoryId } = req.params;

    try {
      const category = await prismaClient.anaKategori.findUnique({
        where: { id: parseInt(categoryId) },
        include: {
          AltKategori: {
            include: {
              Urun: true,
            },
          },
        },
      });

      if (!category) {
        console.error(`Ana kategori bulunamadı. ID: ${categoryId}`);
        return res
          .status(404)
          .json({ error: `Ana kategori bulunamadı. ID: ${categoryId}` });
      }

      const result = category.AltKategori.map((altKategori) => ({
        altKategoriAdi: altKategori.kategori_adi,
        urunSayisi: altKategori.Urun.length,
      }));

      res.json(result);
    } catch (error) {
      console.error("Alt kategorilere ait ürün sayısı alınırken hata:", error);
      res
        .status(500)
        .json({ error: "Alt kategorilere ait ürün sayısı alınamadı." });
    }
  }
);

// Stok giriş ve çıkış tarihlerini getir
app.get(
  "/product-stock-history/:productId",
  async (req: Request, res: Response): Promise<any> => {
    const { productId } = req.params;
    if (!productId || isNaN(parseInt(productId))) {
      return res.status(400).json({ error: "Geçersiz ürün ID'si" });
    }


    try {
const stockHistory = await prismaClient.stok.findMany({
  where: { urunId: parseInt(productId) },
  select: {
    stok_giris_tarihi: true,
    stok_cikis_tarihi: true,
  },
});

console.log("Stok Geçmişi:", stockHistory);

      if (!stockHistory || stockHistory.length === 0) {
        return res.status(404).json({ error: "Stok geçmişi bulunamadı." });
      }

      res.json(stockHistory);
    } catch (error) {
      console.error("Stok geçmişi alınırken hata:", error);
      res.status(500).json({ error: "Stok geçmişi alınamadı." });
    }
  }
);

// Kategoriye göre gelir dağılımı (Pasta Grafiği)
app.get("/kategori-gelir-dagilimi", async (req, res) => {
  try {
    const gelirDagilimi = await prismaClient.anaKategori.findMany({
      include: {
        AltKategori: {
          include: {
            Urun: {
              include: {
                Satis: true,
              },
            },
          },
        },
      }
    });

    const result = gelirDagilimi.map((kategori) => {
      const totalRevenue = kategori.AltKategori.reduce((sum, altKategori) => {
        const altRevenue = altKategori.Urun.reduce((urunSum, urun) => {
          const satisGeliri = urun.Satis.reduce((satisSum, satis) => {
            return satisSum + satis.adet * urun.normal_fiyat;
          }, 0);
          return urunSum + satisGeliri;
        }, 0);
        return sum + altRevenue;
      }, 0);

      return {
        kategoriAdi: kategori.kategori_adi,
        toplamGelir: totalRevenue,
      };
    });

    res.json(result);
  } catch (error) {
    res.status(500).json({ error: "Gelir dağılımı hesaplanırken hata oluştu." });
  }
});

//ürün gelir dağılımı
app.get("/sales-data2", async (req: Request, res: Response): Promise<any> => {
  const urunId = req.query.urunId;

  try {
    if (urunId) {
      // Belirli bir ürün için verileri döndür
      const salesData = await prismaClient.satis.findMany({
        where: { urunId: parseInt(urunId as string) },
        include: {
          urun: {
            select: { normal_fiyat: true, indirimli_fiyat: true },
          },
        },
      });

      // Gelir hesapla
      const gelir = salesData.reduce(
        (total, sale) =>
          total +
          sale.indirim_satis_adedi * sale.urun.indirimli_fiyat +
          sale.normal_satis_adedi * sale.urun.normal_fiyat,
        0
      );

      return res.json({
        urunId: parseInt(urunId as string),
        gelir,
      });
    } else {
      // Tüm ürünlerin gelir verilerini döndür
      const salesData = await prismaClient.satis.findMany({
        include: {
          urun: {
            select: {
              urun_modeli: true,
              normal_fiyat: true,
              indirimli_fiyat: true,
            },
          },
        },
      });

      const formattedData = salesData.map((sale) => ({
        urun_modeli: sale.urun.urun_modeli,
        gelir:
          sale.indirim_satis_adedi * sale.urun.indirimli_fiyat +
          sale.normal_satis_adedi * sale.urun.normal_fiyat,
      }));

      return res.json(formattedData);
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Veri alınamadı" });
  }
});

// Endpoint: Fiyat Trendleri
app.get(
  "/fiyat-trendleri",
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { urunId } = req.query;

      if (!urunId || isNaN(Number(urunId))) {
        res.status(400).json({ error: "Geçerli bir Ürün ID gerekli." });
        return;
      }

      const fiyatTrendleri = await prismaClient.fiyat.findMany({
        where: { urunId: Number(urunId) },
        orderBy: { id: "asc" },
      });

      if (!fiyatTrendleri.length) {
        res.status(404).json({ error: "Fiyat trendi bulunamadı." });
        return;
      }

      res.json(fiyatTrendleri);
    } catch (error) {
      console.error("Fiyat trendleri alınamadı:", error);
      res
        .status(500)
        .json({ error: "Sunucu hatası, lütfen daha sonra tekrar deneyin." });
    }
  }
);

// En çok satılan ürünleri getiren endpoint
app.get("/encok-satan", async (req: Request, res: Response) => {
  try {
    const year = parseInt(req.query.year as string);
    const month = parseInt(req.query.month as string);

    console.log("İstek parametreleri:", { year, month });

    // Başlangıç ve bitiş tarihini belirliyoruz
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);

    console.log("Tarih aralığı:", { startDate, endDate });

    const products = await prismaClient.satis.findMany({
      where: {
        satistarihi: {
          gte: startDate,
          lt: endDate,
        },
      },
      include: {
        urun: {
          select: {
            urun_modeli: true,
          },
        },
      },
      orderBy: {
        adet: 'desc',
      },
    });

    console.log("Bulunan ürün sayısı:", products.length);

    // Ürünleri gruplandır ve toplam satışları hesapla
    const salesByProduct = products.reduce((acc, curr) => {
      const urunModeli = curr.urun.urun_modeli;
      if (!acc[urunModeli]) {
        acc[urunModeli] = {
          urun_modeli: urunModeli,
          toplam_satis: 0
        };
      }
      acc[urunModeli].toplam_satis += curr.indirim_satis_adedi + curr.normal_satis_adedi;
      return acc;
    }, {} as Record<string, { urun_modeli: string; toplam_satis: number }>);

    // En çok satan 10 ürünü al
    const sortedProducts = Object.values(salesByProduct)
      .sort((a, b) => b.toplam_satis - a.toplam_satis)
      .slice(0, 10);

    console.log("Gönderilen sonuç:", sortedProducts);

    res.json(sortedProducts);
  } catch (error) {
    console.error("Error fetching most sold products:", error);
    res.status(500).json({ error: "Bir hata oluştu" });
  }
});

// En az satılan ürünleri getiren endpoint
app.get("/enaz-satan", async (req: Request, res: Response) => {
  try {
    const year = parseInt(req.query.year as string);
    const month = parseInt(req.query.month as string);

    console.log("İstek parametreleri:", { year, month });

    // Başlangıç ve bitiş tarihini belirliyoruz
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);

    console.log("Tarih aralığı:", { startDate, endDate });

    const products = await prismaClient.satis.findMany({
      where: {
        satistarihi: {
          gte: startDate,
          lt: endDate,
        },
      },
      include: {
        urun: {
          select: {
            urun_modeli: true,
          },
        },
      },
      orderBy: {
        adet: 'asc',
      },
    });

    console.log("Bulunan ürün sayısı:", products.length);

    // Ürünleri gruplandır ve toplam satışları hesapla
    const salesByProduct = products.reduce((acc, curr) => {
      const urunModeli = curr.urun.urun_modeli;
      if (!acc[urunModeli]) {
        acc[urunModeli] = {
          urun_modeli: urunModeli,
          toplam_satis: 0
        };
      }
      acc[urunModeli].toplam_satis += curr.indirim_satis_adedi + curr.normal_satis_adedi;
      return acc;
    }, {} as Record<string, { urun_modeli: string; toplam_satis: number }>);

    // En az satan 10 ürünü al
    const sortedProducts = Object.values(salesByProduct)
      .sort((a, b) => a.toplam_satis - b.toplam_satis)
      .slice(0, 10);

    console.log("Gönderilen sonuç:", sortedProducts);

    res.json(sortedProducts);
  } catch (error) {
    console.error("Error fetching least sold products:", error);
    res.status(500).json({ error: "Bir hata oluştu" });
  }
});

// Toplam ürün sayısını getiren endpoint
app.get("/toplam-urun-sayisi", async (req: Request, res: Response) => {
  try {
    const urunler = await prismaClient.urun.findMany({
      select: {
        stok_adedi: true
      }
    });
    
    const toplamStok = urunler.reduce((toplam, urun) => toplam + urun.stok_adedi, 0);
    
    res.json({ 
      toplamStok,
      toplamUrunCesidi: urunler.length 
    });
  } catch (error) {
    console.error("Toplam ürün sayısı alınırken hata:", error);
    res.status(500).json({ error: "Toplam ürün sayısı alınamadı" });
  }
});


// Chat endpoint'i
app.post("/api/chat", async (req: Request, res: Response): Promise<void> => {
  try {
    const { message } = req.body;
    
    if (!message) {
      res.status(400).json({ error: "Mesaj gerekli" });
      return;
    }

    const anakategoriler = await prismaClient.anaKategori.findMany({
      include: {
        AltKategori: true,
      },
    });
    
    const urunler = await prismaClient.urun.findMany();
    
    const kategorilerUrunSayisi = await Promise.all(
      anakategoriler.map(async (category) => {
        const urunSayisi = await prismaClient.urun.count({
          where: {
            altKategori: {
              anaKategoriId: category.id
            }
          }
        });
        return {
          kategoriAdi: category.kategori_adi,
          urunSayisi: urunSayisi
        };
      })
    );
    
    const odemeTurleriSayisi = await prismaClient.satis.groupBy({
      by: ["odeme"],
      _sum: { adet: true },
    });
    
    const toplamUrunler = await prismaClient.urun.findMany({
      select: {
        stok_adedi: true
      }
    });
    
    const toplamStok = toplamUrunler.reduce((toplam, urun) => toplam + urun.stok_adedi, 0);
    
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth() + 1;
    
    const startDate = new Date(currentYear, currentMonth - 1, 1);
    const endDate = new Date(currentYear, currentMonth, 0);
    
    const enCokStokta = await prismaClient.urun.findMany({
      where: {
        stok_giris_tarihi: {
          gte: startDate,
          lt: endDate,
        },
      },
      orderBy: {
        stok_adedi: "desc",
      },
      take: 10,
      select: {
        urun_modeli: true,
        stok_adedi: true,
      },
    });
    
    const enHizliSatilanlar = await prismaClient.urun.findMany({
      select: {
        urun_modeli: true,
        stok_giris_tarihi: true,
        stok_cikis_tarihi: true,
      },
      where: {
        stok_cikis_tarihi: {
          not: null, 
        },
        stok_giris_tarihi: {
          gte: startDate,
          lt: endDate,
        },
      },
    });
    
    const enHizliSatilanlarHesapli = enHizliSatilanlar.map((product) => {
      const stokGiris = product.stok_giris_tarihi
        ? new Date(product.stok_giris_tarihi)
        : null;
      const stokCikis = product.stok_cikis_tarihi
        ? new Date(product.stok_cikis_tarihi)
        : null;
      if (!stokGiris || !stokCikis) {
        return {
          urun_modeli: product.urun_modeli,
          satis_suresi: Number.MAX_VALUE,
        };
      }
      const fark = (stokCikis.getTime() - stokGiris.getTime()) / (1000 * 60 * 60 * 24);
      return { urun_modeli: product.urun_modeli, satis_suresi: fark };
    }).sort((a, b) => a.satis_suresi - b.satis_suresi).slice(0, 10);
    
    const satislar = await prismaClient.satis.findMany({
      where: {
        satistarihi: {
          gte: startDate,
          lt: endDate,
        },
      },
      include: {
        urun: {
          select: {
            urun_modeli: true,
          },
        },
      },
      orderBy: {
        adet: 'desc',
      },
    });
    
    const satisGruplanmis = satislar.reduce((acc, curr) => {
      const urunModeli = curr.urun.urun_modeli;
      if (!acc[urunModeli]) {
        acc[urunModeli] = {
          urun_modeli: urunModeli,
          toplam_satis: 0
        };
      }
      acc[urunModeli].toplam_satis += curr.indirim_satis_adedi + curr.normal_satis_adedi;
      return acc;
    }, {} as Record<string, { urun_modeli: string; toplam_satis: number }>);
    
    const enCokSatan = Object.values(satisGruplanmis)
      .sort((a, b) => b.toplam_satis - a.toplam_satis)
      .slice(0, 10);
    
    const gelirDagilimi = await prismaClient.anaKategori.findMany({
      include: {
        AltKategori: {
          include: {
            Urun: {
              include: {
                Satis: true,
              },
            },
          },
        },
      }
    });

    const gelirHesapli = gelirDagilimi.map((kategori) => {
      const totalRevenue = kategori.AltKategori.reduce((sum, altKategori) => {
        const altRevenue = altKategori.Urun.reduce((urunSum, urun) => {
          const satisGeliri = urun.Satis.reduce((satisSum, satis) => {
            return satisSum + satis.adet * urun.normal_fiyat;
          }, 0);
          return urunSum + satisGeliri;
        }, 0);
        return sum + altRevenue;
      }, 0);

      return {
        kategoriAdi: kategori.kategori_adi,
        toplamGelir: totalRevenue,
      };
    });
    
    // Tüm verileri tek bir veri yapısında birleştir
    const tumVeriler = {
      anakategoriler,
      urunler,
      kategoriUrunSayilari: kategorilerUrunSayisi,
      odemeTurleriIstatistigi: odemeTurleriSayisi,
      toplamStokDurumu: {
        toplamStok,
        toplamUrunCesidi: urunler.length
      },
      enCokStoktakiUrunler: enCokStokta,
      enHizliSatilanUrunler: enHizliSatilanlarHesapli,
      enCokSatanUrunler: enCokSatan,
      kategorilereGoreGelirler: gelirHesapli
    };

    // Prompt hazırla
    const promptWithData = `
Sen DepoStok Asistan'sın. Envanter yönetim sistemimiz için yapay zeka asistanı olarak çalışıyorsun.
Aşağıdaki veritabanı bilgilerini kullanarak soruları doğru ve detaylı şekilde yanıtla:

VERİTABANI VERİLERİ:
${JSON.stringify(tumVeriler, null, 2)}

VERİTABANI YAPISI:
- AnaKategori: Ana ürün kategorileri (Giyim, Elektronik vb.)
- AltKategori: Alt kategoriler, bir ana kategoriye bağlıdır
- Urun: Ürün bilgileri, bir alt kategoriye bağlıdır
- Kategori Ürün Sayıları: Her ana kategorideki toplam ürün sayısı
- Ödeme Türleri İstatistiği: Hangi ödeme yöntemlerinin ne kadar kullanıldığı
- Toplam Stok Durumu: Sistemdeki toplam ürün adedi ve çeşidi
- En Çok Stoktaki Ürünler: En yüksek stok miktarına sahip 10 ürün
- En Hızlı Satılan Ürünler: Stokta kalma süresi en kısa 10 ürün (gün cinsinden)
- En Çok Satan Ürünler: En fazla satış adedine sahip 10 ürün
- Kategorilere Göre Gelirler: Her ana kategoriden elde edilen toplam gelir

Kullanıcı sorusu: ${message}
`;

    const response = await axios.post("http://localhost:11434/api/generate", {
      model: "qwen2.5",
      prompt: promptWithData,
      stream: false,
    });

    res.json({ response: response.data.response });
  } catch (error) {
    console.error('Chat API Hatası:', error);
    res.status(500).json({ error: 'Yapay zeka ile iletişim kurulurken bir hata oluştu' });
  }
});

// Fiyat analizi endpoint'i
app.post("/satis-analizi", async (req: Request, res: Response): Promise<void> => {
  const { urun_modeli } = req.body;
  try {
    const urun = await prismaClient.urun.findFirst({
      where: { urun_modeli },
      select: { id: true }
    });

    if (!urun) {
      res.status(404).json({ error: "Ürün bulunamadı" });
      return;
    }

    const urunVerileri = await prismaClient.urun.findMany({
      where: {
        urun_modeli: urun_modeli
      },
      select: {
        normal_fiyat: true,
        indirimli_fiyat: true,
        stok_adedi: true,
        indirim_satis_adedi: true,
        normal_satis_adedi: true,
        stok_giris_tarihi: true,
        stok_cikis_tarihi: true
      }
    });

    if (urunVerileri.length === 0) {
      res.status(404).json({ error: "Ürün bulunamadı" });
      return;
    }

    
    const prompt = `You are a JSON API. Analyze the data below and respond ONLY in JSON format.
NEVER write anything else. NEVER add explanations. NEVER use <think> tags. Never return null.
ANALYZE THE DATA PROVIDED AND RETURN THE BEST PRICE RECOMMENDATION FOR THE PRODUCT.
Use ONLY and ONLY this JSON format. Never return empty data. Strictly use the JSON format below.Analyze the data and provide an optimum price recommendation:

{
  "fiyat_analizi": {
    "optimum_fiyat_onerisi": number
  },
}

Data to analyze:
${JSON.stringify({ urun_modeli, urunVerileri }, null, 2)}

WARNING: RETURN ONLY AND ONLY JSON. DO NOT WRITE ANYTHING ELSE.`;

    const response = await axios.post("http://localhost:11434/api/generate", {
      model: "qwen2.5",
      prompt: prompt,
      stream: false,
      temperature: 0.1,
      max_tokens: 500,
      top_p: 0.1,
      top_k: 1,
      stop: ["}"],
      format: "json", // JSON formatını zorla
    });

    // Yanıtı temizle ve parse et
    const cleanResponse = response.data.response
      .replace(/<[^>]*>/g, '')           // HTML etiketlerini temizle
      .replace(/```json\s*|\s*```/g, '') // JSON blok işaretlerini temizle
      .replace(/^[^{]*/, '')             // İlk { öncesi her şeyi temizle
      .replace(/}[^}]*$/, '}')           // Son } sonrası her şeyi temizle
      .trim();                           // Boşlukları temizle

    console.log('AI yanıtı:', cleanResponse);

    // JSON parse işlemi
    const analiz = JSON.parse(cleanResponse);

    // Yanıtı gönder
    res.json({ 
      urun_modeli,
      veriler: urunVerileri,
      analiz,
      durum: "başarılı"
    });

    await logIslem(
      "Fiyat Analizi",
      `${urun_modeli} için fiyat analizi yapıldı`,
      urun?.id
    );

  } catch (error) {
    console.error('Satış Analizi Hatası:', error);
    res.status(500).json({ error: 'Satış analizi yapılırken bir hata oluştu' });
  }
});

// Stok analizi endpoint'i
app.post("/stok-analizi", async (req: Request, res: Response): Promise<void> => {
  try {
    const { urun_modeli } = req.body;

    if (!urun_modeli) {
      res.status(400).json({ error: "Product model is required" });
      return;
    }

    const urunVerileri = await prismaClient.urun.findMany({
      where: {
        urun_modeli: urun_modeli,
      },
      select: {
        id: true,
        normal_fiyat: true,
        indirimli_fiyat: true,
        stok_adedi: true,
        indirim_satis_adedi: true,
        normal_satis_adedi: true,
        stok_giris_tarihi: true,
        stok_cikis_tarihi: true,
      },
    });

    if (urunVerileri.length === 0) {
      res.status(404).json({ error: "Product not found" });
      return;
    }

    // Total stock and turnover rate calculations
    const toplam_stok = urunVerileri.reduce(
      (acc, curr) => acc + curr.stok_adedi,
      0
    );
    const stok_devir_hizi = urunVerileri.reduce(
      (acc, curr) => acc + curr.indirim_satis_adedi + curr.normal_satis_adedi,
      0
    );

    // Prompt
    const prompt = `You are a JSON API. Analyze the data below and respond ONLY in JSON format.
NEVER write anything else. NEVER add explanations. NEVER use <think> tags. Never return null.
ANALYZE THE DATA PROVIDED AND RETURN THE BEST PRICE RECOMMENDATION FOR THE PRODUCT.
Use ONLY and ONLY this JSON format. Never return empty data. Strictly use the JSON format below.Analyze the data and provide an optimum stock recommendation:

{
"stok_analizi": {
    "toplam_stok_adedi": ${toplam_stok},
    "stok_devir_hizi": ${stok_devir_hizi},
    "optimum_stok_onerisi": number
  }
}

Data to analyze:
${JSON.stringify({ urun_modeli, veriler: urunVerileri }, null, 2)}

WARNING: RETURN ONLY AND ONLY JSON. DO NOT WRITE ANYTHING ELSE.`;

    const response = await axios.post("http://localhost:11434/api/generate", {
      model: "qwen2.5",
      prompt: prompt,
      stream: false,
      temperature: 0.1,
      max_tokens: 500,
      top_p: 0.1,
      top_k: 1,
      stop: ["}"],
      format: "json", // Force JSON format
    });

    // Clean and parse the response
    const cleanResponse = response.data.response
      .replace(/<[^>]*>/g, "") // Clean HTML tags
      .replace(/```json\s*|\s*```/g, "") // Clean JSON block markers
      .replace(/^[^{]*/, "") // İlk { öncesi her şeyi temizle
      .replace(/}[^}]*$/, "}") // Son } sonrası her şeyi temizle
      .trim(); // Boşlukları temizle

    console.log("AI response:", cleanResponse);

    // JSON parse
    const analiz = JSON.parse(cleanResponse);

    // Send response
    res.json({
      urun_modeli,
      veriler: urunVerileri,
      analiz,
      durum: "başarılı",
    });

    await logIslem(
      "Stok Analizi",
      `Stok analizi yapıldı ${urun_modeli}`,
      urunVerileri[0]?.id
    );

  } catch (error) {
    console.error("Stok Analizi Hatası:", error);
    res
      .status(500)
      .json({ error: "Stok analizi yapılırken bir hata oluştu" });
  }
});


app.post("/satis-karsilastirma-analizi", async (req: Request, res: Response): Promise<void> => {
    try {
      const { urun_modeli } = req.body;

      if (!urun_modeli) {
        res.status(400).json({ error: "Ürün modeli gerekli" });
        return;
      }

      const urunVerileri = await prismaClient.urun.findMany({
        where: {
          urun_modeli: urun_modeli,
        },
        select: {
          id: true,
          normal_fiyat: true,
          indirimli_fiyat: true,
          stok_adedi: true,
          indirim_satis_adedi: true,
          normal_satis_adedi: true,
          stok_giris_tarihi: true,
          stok_cikis_tarihi: true,
        },
      });

      if (urunVerileri.length === 0) {
        res.status(404).json({ error: "Ürün bulunamadı" });
        return;
      }

            const toplam_satis_adedi = urunVerileri.reduce(
              (acc, curr) => acc + curr.stok_adedi,
              0
            );

      // Toplam stok ve devir hızı hesaplamaları
      const ind_satis_adedi = urunVerileri.reduce(
        (acc, curr) => acc + curr.indirim_satis_adedi,
        0
      );
      const norm_satis_adedi = urunVerileri.reduce(
        (acc, curr) => acc + curr.normal_satis_adedi,
        0
      );

      // Prompt'u JSON formatına zorlamak için güncellendi
      const prompt = `You are a JSON API. Analyze the data below and respond ONLY in JSON format.
NEVER write anything else. NEVER add explanations. NEVER use <think> tags. Never return null.
ANALYZE THE DATA PROVIDED AND RETURN THE BEST PRICE RECOMMENDATION FOR THE PRODUCT.
Use ONLY and ONLY this JSON format. Never return empty data. Strictly use the JSON format below.:

{
  "satis_karsilastirmasi": {
    "indirimli_satis_yuzdesi": number,
    "normal_satis_yuzdesi": number,
    "karlilik_analizi": string
  }
}

Rules:
1. Calculate percentages: 
   - indirimli_satis_yuzdesi = (total discounted sales / total all sales) * 100
   - normal_satis_yuzdesi = (total normal sales / total all sales) * 100
2. karlilik_analizi must be ONE of these EXACT phrases:
   - "Normal satış oranı daha yüksek."
   - "İndirimli satış oranı daha yüksek."
   - "Normal ve indirimli satış oranları eşit."

Data to analyze:
${JSON.stringify({ urun_modeli, urunVerileri }, null, 2)}

CRITICAL: 
- MUST return EXACTLY this JSON structure
- NO explanations
- NO additional fields
- NO modifications to the format
- Numbers must be between 0-100
- Percentages must sum to 100`;

      const response = await axios.post("http://localhost:11434/api/generate", {
        model: "qwen2.5",
        prompt: prompt,
        stream: false,
        temperature: 0.1,
        max_tokens: 500,
        top_p: 0.1,
        top_k: 1,
        stop: ["}"],
        format: "json", // JSON formatını zorla
      });

      // Yanıtı temizle ve parse et
      const cleanResponse = response.data.response
        .replace(/<[^>]*>/g, "") // HTML etiketlerini temizle
        .replace(/```json\s*|\s*```/g, "") // JSON blok işaretlerini temizle
        .replace(/^[^{]*/, "") // İlk { öncesi her şeyi temizle
        .replace(/}[^}]*$/, "}") // Son } sonrası her şeyi temizle
        .trim(); // Boşlukları temizle

      console.log("AI yanıtı:", cleanResponse);

      // JSON parse işlemi
      const analiz = JSON.parse(cleanResponse);

      // Yanıtı gönder
      res.json({
        urun_modeli,
        veriler: urunVerileri,
        analiz,
        durum: "başarılı",
      });

      await logIslem(
        "Satış Karşılaştırma Analizi",
        `${urun_modeli} için satış karşılaştırma analizi yapıldı`,
        urunVerileri[0]?.id
      );

    } catch (error) {
      console.error("Satış Karşılaştırma Analizi Hatası:", error);
      res
        .status(500)
        .json({ error: "Satış karşılaştırma analizi yapılırken bir hata oluştu" });
    }
  }
);


app.post("/karlilik-analizi", async (req: Request, res: Response): Promise<void> => {
  try {
    console.log("\n=== KARLILIK ANALİZİ BAŞLIYOR ===");

    
    const urunler = await prismaClient.urun.findMany({
      select: {
        id: true,
        urun_modeli: true,
        normal_fiyat: true,
        indirimli_fiyat: true,
        normal_satis_adedi: true,
        indirim_satis_adedi: true,
        stok_adedi: true,
      },
    });

    const karlilikHesaplamalari = urunler.map((urun) => {
      const normalCiro = urun.normal_fiyat * urun.normal_satis_adedi;
      const indirimliCiro = urun.indirimli_fiyat * urun.indirim_satis_adedi;
      const toplamCiro = normalCiro + indirimliCiro;
      const toplamSatis = urun.normal_satis_adedi + urun.indirim_satis_adedi;
      
      const karlilikYuzdesi = toplamSatis > 0 ? 
        ((toplamCiro / toplamSatis) / urun.normal_fiyat * 100) : 0;

      return {
        ...urun,
        karlilik_yuzdesi: Number(karlilikYuzdesi.toFixed(2))
      };
    });

    
    const enKarliUrunler = karlilikHesaplamalari
      .sort((a, b) => b.karlilik_yuzdesi - a.karlilik_yuzdesi)
      .slice(0, 6);

    const prompt = `Sen bir JSON API'sın. Aşağıdaki 6 ürünün her biri için ayrı ayrı karlılık analizi yap.
SADECE JSON formatında yanıt ver. Başka hiçbir şey yazma.
Her ürün için ayrı analiz yap ve öneriler sun.
Yanıtını bu formatta ver:

{
  "karlilik_analizi": [
    {
      "urun_modeli": string,
      "karlilik_yuzdesi": number,
      "normal_satis_adedi": number,
      "indirim_satis_adedi": number,
      "normal_fiyat": number,
      "indirimli_fiyat": number,
      "stok_adedi": number,
      "risk_faktoru": "DÜŞÜK" | "ORTA" | "YÜKSEK",
      "öneriler": string[]
      "fiyat_onerisi": number
    },
  ]
}

Kurallar:
1. Tam olarak 6 ürün analizi dön
2. Her ürün için 2-3 öneri yaz
3. Risk faktörü:
   - Karlılık > 80% ise "DÜŞÜK"
   - Karlılık 50-80% arası ise "ORTA" 
   - Karlılık < 50% ise "YÜKSEK"
4. Öneriler Türkçe olmalı
5. Her ürün için farklı öneriler sun
6. Boş veya null değer döndürme

Analiz edilecek ürün verileri:
${JSON.stringify(enKarliUrunler, null, 2)}`;

    const response = await axios.post("http://localhost:11434/api/generate", {
      model: "qwen2.5",
      prompt: prompt,
      stream: false,
      temperature: 0.7,
      max_tokens: 1000,
      format: "json"
    });

    const cleanResponse = response.data.response
      .replace(/<[^>]*>/g, "")
      .replace(/```json\s*|\s*```/g, "")
      .replace(/^[^{]*/, "")
      .replace(/}[^}]*$/, "}")
      .trim();

    console.log("AI yanıtı:", cleanResponse);

    const analiz = JSON.parse(cleanResponse);
    
    res.json({
      karlilik_analizi: analiz.karlilik_analizi,
      durum: "başarılı"
    });

    await logIslem(
      "Karlılık Analizi",
      "6 ürün için karlılık analizi yapıldı",
      undefined
    );

  } catch (err: any) {
    console.error("\n❌ KARLILIK ANALİZİ HATASI:", err?.message || 'Bilinmeyen hata');
    res.status(500).json({ error: "Karlılık analizi yapılırken bir hata oluştu" });
  }
});


app.post(
  "/kategorik-gelir-analizi-v2",
  async (req: Request, res: Response): Promise<void> => {
    try {
      console.log("\n=== YENİ KATEGORİK GELİR ANALİZİ (v2) BAŞLIYOR ===");

   
      console.log("1. İlişkisel veritabanı sorgusu yapılıyor...");
      const anaKategoriler = await prismaClient.anaKategori.findMany({
        include: {
          AltKategori: {
            include: {
              Urun: {
                select: {
                  normal_fiyat: true,
                  indirimli_fiyat: true,
                  normal_satis_adedi: true,
                  indirim_satis_adedi: true,
                },
              },
            },
          },
        },
      });
      console.log(`Veri alındı. ${anaKategoriler.length} ana kategori bulundu.`);

      
      console.log("2. Her ana kategori için toplam gelir manuel hesaplanıyor...");
      const manuelHesaplama = anaKategoriler.map(kategori => {
        let toplamGelir = 0;
        kategori.AltKategori.forEach(altKategori => {
          altKategori.Urun.forEach(urun => {
            const normalGelir = (urun.normal_fiyat || 0) * (urun.normal_satis_adedi || 0);
            const indirimliGelir = (urun.indirimli_fiyat || 0) * (urun.indirim_satis_adedi || 0);
            toplamGelir += normalGelir + indirimliGelir;
          });
        });
        return {
          kategori_adi: kategori.kategori_adi,
          toplam_gelir: Math.round(toplamGelir)
        };
      });
      console.log("Manuel hesaplama sonuçları:", JSON.stringify(manuelHesaplama, null, 2));

      console.log("3. Öneriler için Deepseek prompt'u hazırlanıyor...");
      
      const formatOrnegi = manuelHesaplama.map(kat => (
        `    { "kategori_adi": "${kat.kategori_adi}", "toplam_gelir": ${kat.toplam_gelir}, "öneriler": "string" }`
      )).join(",\n");

      const prompt = `SADECE VE SADECE BU FORMATTA YANIT VER:
{
  "kategori_analizi": [
${formatOrnegi}
  ]
}

BAŞKA HİÇBİR ŞEY YAZMA. SADECE BU JSON FORMATINI KULLAN.

Görevin: Yukarıdaki JSON'ı kopyala, "string" yerine her kategori için kısa öneriler yaz.
Kategori_adi ve toplam_gelir değerlerini değiştirme, sadece "öneriler" kısmını değiştir.
Her kategori için 1-2 cümlelik anlamlı öneri ekle. Örneğin, düşük gelirli kategori için satışları artırma, yüksek gelirli kategori için stoğu yönetme önerisi gibi.

Analiz edilecek manuel hesaplanmış veriler:
${JSON.stringify(manuelHesaplama, null, 2)}`;

      console.log("Hazırlanan prompt:", prompt);

 
      console.log("4. Deepseek API'ye öneri isteği gönderiliyor...");
      const modelParams = {
        model: "qwen2.5",
        prompt: prompt,
        stream: false,
        temperature: 0.7, 
        max_tokens: 500, 
        top_p: 0.9,
        format: "json"
      };
      console.log("Model parametreleri:", JSON.stringify(modelParams, null, 2));

      const response = await axios.post("http://localhost:11434/api/generate", modelParams);

      console.log("5. Ham AI yanıtı alındı:", response.data.response);

      
      console.log("6. Yanıt temizleniyor...");
      const cleanResponse = (response.data.response || '')
        .replace(/<[^>]*>/g, '')
        .replace(/```json\s*|\s*```/g, '')
        .replace(/^[^{]*/, '')
        .replace(/}[^}]*$/, '}')
        .trim();
      console.log("Temizlenmiş yanıt:", cleanResponse);
  
      console.log("7. JSON parse ediliyor ve doğrulanıyor...");
      let analiz;
      try {
        if (!cleanResponse || cleanResponse === '{}' || cleanResponse.length < 10) {
            console.warn("Geçersiz veya boş AI yanıtı. Fallback kullanılacak.");
            throw new Error("Geçersiz AI yanıtı");
        }
        analiz = JSON.parse(cleanResponse);
        console.log("Parse edilen JSON:", JSON.stringify(analiz, null, 2));

      
        if (!analiz.kategori_analizi || !Array.isArray(analiz.kategori_analizi) || analiz.kategori_analizi.length !== manuelHesaplama.length) {
            console.error("Hata: AI yanıtı beklenen yapıda değil.");
            throw new Error("Yanlış AI yanıt formatı");
        }

        // AI yanıtındaki gelirlerin manuel hesaplamayla eşleştiğini kontrol et (isteğe bağlı ama önerilir)
        // Burada basit bir kontrol yapılıyor, isterseniz daha detaylı hale getirebilirsiniz.
        if (analiz.kategori_analizi[0]?.toplam_gelir !== manuelHesaplama[0]?.toplam_gelir) {
            console.warn("Uyarı: AI yanıtındaki gelir, manuel hesaplamayla eşleşmiyor. Manuel veri kullanılacak.");
            // Hata yerine manuel veriyi kullanmayı tercih edebiliriz
            throw new Error("Gelir uyuşmazlığı"); 
        }

        console.log("JSON doğrulama başarılı.");

      } catch (parseError: any) {
        console.error("JSON parse veya doğrulama hatası:", parseError.message);
        console.log("Fallback: Manuel veriler ve basit öneriler kullanılacak.");
;
      }

      console.log("8. Son yanıt hazırlanıyor ve gönderiliyor...");
      const sonYanit = {
        kategori_analizi: analiz.kategori_analizi, 
        durum: "başarılı",
      };
      console.log("Gönderilen yanıt:", JSON.stringify(sonYanit, null, 2));
      console.log("=== YENİ KATEGORİK GELİR ANALİZİ (v2) TAMAMLANDI ===\n");

      res.json(sonYanit);

      await logIslem(
        "Kategori Gelir Analizi (v2)",
        "Kategori gelir analizi (v2) yapıldı",
        undefined
      );

    } catch (err: any) {
      console.error("\n❌ KATEGORİ GELİR ANALİZİ (v2) HATASI:", err?.message || "Bilinmeyen hata");
      console.error("Hata detayları:", err);
      res.status(500).json({ error: "Kategori gelir analizi (v2) yapılırken bir hata oluştu" });
    }
  }
);


async function logIslem(islemTipi: string, aciklama: string, urunId?: number) {
  try {
    await prismaClient.islemLog.create({
      data: {
        islemTipi,
        aciklama,
        urunId
      }
    });
  } catch (error) {
    console.error("Log kaydı oluşturulurken hata:", error);
  }
}


app.get("/son-islemler", async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 6;
    const skip = (page - 1) * limit;

    const total = await prismaClient.islemLog.count();

    const logs = await prismaClient.islemLog.findMany({
      include: {
        urun: {
          select: {
            urun_modeli: true
          }
        }
      },
      orderBy: {
        tarih: 'desc'
      },
      skip,
      take: limit
    });
    
    const totalPages = Math.ceil(total / limit);

    res.json({
      islemler: logs,
      currentPage: page,
      totalPages,
      totalItems: total,
      itemsPerPage: limit
    });
  } catch (error) {
    console.error("Son işlemler alınırken hata:", error);
    res.status(500).json({ error: "Son işlemler alınamadı" });
  }
});

app.post(
  "/en-cok-satan-urunler",
  async (req: Request, res: Response): Promise<void> => {
    try {
      console.log("\n=== en çok satan ürünler ANALİZİ BAŞLIYOR ===");

      const urunler = await prismaClient.urun.findMany({
        select: {
          id: true,
          urun_modeli: true,
          normal_fiyat: true,
          indirimli_fiyat: true,
          normal_satis_adedi: true,
          indirim_satis_adedi: true,
          stok_adedi: true,
        },
      });

      const enCokSatanUrunlerHesaplamalari = urunler.map((urun) => {
        const toplamSatis = urun.normal_satis_adedi + urun.indirim_satis_adedi;

        return {
          ...urun,
          toplamSatis: toplamSatis,
        };
      });

      const enCokSatanUrunler = enCokSatanUrunlerHesaplamalari
        .sort((a, b) => b.toplamSatis - a.toplamSatis)
        .slice(0, 5);

      const detayliAnalizler = [];

      for (const urun of enCokSatanUrunler) {
        const prompt = `You are a JSON API. Analyze the product data below and evaluate its profitability status.
ONLY respond in JSON format. DO NOT write anything else.
After analyzing the product data, make a separate analysis for each product.
Let your reply be in Turkish.
Respond in this format:

{
  "analysis": {
    "product_model": string,
    "tahmini_satis_adedi": number,
    "risk_factor": "artışta" | "azalışta" | "stabil"
  }
}

Product data to analyze:
${JSON.stringify(urun, null, 2)}`;

        const response = await axios.post(
          "http://localhost:11434/api/generate",
          {
            model: "qwen2.5",
            prompt: prompt,
            stream: false,
            temperature: 0.1,
            max_tokens: 1000,
            format: "json",
          }
        );

        const cleanResponse = response.data.response
          .replace(/<[^>]*>/g, "")
          .replace(/```json\s*|\s*```/g, "")
          .replace(/^[^{]*/, "")
          .replace(/}[^}]*$/, "}")
          .trim();

        try {
          const analiz = JSON.parse(cleanResponse);
          detayliAnalizler.push(analiz.analysis);
        } catch (parseError) {
          console.error(
            `${urun.urun_modeli} için JSON parse hatası:`,
            parseError
          );
        }
      }

      const yanit = {
        detayli_analizler: detayliAnalizler,
        durum: "başarılı"
      };
      console.log("AI yanıtı:", yanit);
      console.log("\n=== ANALİZ TAMAMLANDI ===");
      res.json(yanit);

      await logIslem(
        "En Çok Satan Ürünler Analizi",
        "En çok satan ürünlerin analizi yapıldı",
        undefined
      );
    } catch (err: any) {
      console.error(
        "\n❌ EN ÇOK SATAN ÜRÜNLER ANALİZİ HATASI:",
        err?.message || "Bilinmeyen hata"
      );
      res
        .status(500)
        .json({ error: "En çok satan ürünlerin analizi yapılırken bir hata oluştu" });
    }
  }
);


async function startServer() {
  try {

    await prismaClient.$connect();
    app.listen(3000, () => {
      console.log("Server is running on port 3000");
    });
  } catch (error) {
    console.error("Veritabanı bağlantı hatası:", error);
    await prismaClient.$disconnect();
  }
}

startServer();
