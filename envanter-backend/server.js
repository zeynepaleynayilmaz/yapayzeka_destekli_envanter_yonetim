const express = require("express");
const cors = require("cors");

var mysql = require("mysql");
var connection = mysql.createConnection({
  host: "localhost",
  user: "localhost",
  database: "stokprojesi",
});

const sql = require("mssql");

const app = express();
const port = 5000; // API için port numarası
const OLLAMA_URL = "http://localhost:11434";

// CORS ayarları
app.use(cors());
app.use(express.json()); // JSON gövdesini işlemek için

// SQL Server bağlantı ayarları
const config = {
  server: "localhost", // SQL Server adresi
  database: "stokveritabani", // Bağlanmak istediğiniz veritabanı adı
  user: "stokAdmin",
  password: "Bb123456Bb",
  options: {
    trustedConnection: true, // Windows Authentication kullanımı
    trustServerCertificate: true, // Geliştirme ortamı için
    encrypt: false,
    integratedSecurity: true,
  },
};

app.post("/chat", async (req, res) => {

    try {
        const { message, model = 'deepseek-r1:7b' } = req.body;
        if (!message) {
            return res.status(400).json({ error: 'Message is required' });
        }
        const response = await fetch(`${OLLAMA_URL}/api/generate`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model,
            prompt: message,
            stream: false,
          }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Ollama error response:', errorText);
        throw new Error(`Ollama error: ${response.status} - ${errorText}` );
      }

  } catch (error) {
    console.error('Detailed chat error:', error);
    res.status(500).json({ 
      error: 'Failed to get response from ollama' ,
      details: error.message
    });
  }
});

// API endpoint - Ürünler
app.get("/api/urunler", async (req, res) => {
  try {
    const { urun_turu } = req.query; // Dışarıdan urun_turu'yi parametre olarak al
    await sql.connect(config);

    if (!urun_turu) {
      return res.status(400).send("urun_turu parameter is required");
    }

    // urun_turu'leri virgülle ayırarak diziye çevir
    const urunTuruList = Array.isArray(urun_turu)
      ? urun_turu
      : urun_turu.split(",").map((item) => item.trim());

    // SQL sorgusu oluştur
    const query = `
      SELECT DISTINCT * 
      FROM dbo.urun 
      WHERE urun_turu IN (${urunTuruList
        .map((_, index) => `@urun_turu${index}`)
        .join(", ")})
    `;

    const request = new sql.Request(); // SQL request nesnesi oluştur

    // Her bir urunTuru için parametre ekle
    urunTuruList.forEach((item, index) => {
      request.input(`urun_turu${index}`, sql.NVarChar, item); // urun_turu'leri sayısal olarak tanımla
    });

    const result = await request.query(query);
    res.json(result.recordset); // Ürün verisini döndür
  } catch (err) {
    console.error(err);
    res.status(500).send(err.message); // Hata mesajı döndür
  }
});

// API endpoint - Ana Kategoriler
app.get("/api/anakategoriler", async (req, res) => {
  try {
    await sql.connect(config);
    const result = await sql.query(
      "SELECT id, kategori_adi FROM dbo.ana_kategori"
    ); // Ana kategorileri al
    res.json(result.recordset); // Ana kategori verisini döndür
  } catch (err) {
    console.error(err);
    res.status(500).send(err.message); // Hata mesajı döndür
  }
});

// API endpoint - Alt Kategoriler
app.get("/api/altkategoriler", async (req, res) => {
  try {
    const { anaKategoriName } = req.query; // Ana kategori name'yi parametre olarak al
    await sql.connect(config);

    // Ana kategori adlarını virgülle ayırarak diziye çevir
    const kategoriNames = Array.isArray(anaKategoriName)
      ? anaKategoriName
      : anaKategoriName.split(",").map((name) => name.trim());

    // SQL sorgusu oluştur
    const query = `
      SELECT alt.id, alt.alt_kategori_adi 
      FROM dbo.alt_kategori alt
      INNER JOIN dbo.ana_kategori ana ON alt.ana_kategori_id = ana.id
      WHERE ana.kategori_adi IN (${kategoriNames
        .map((_, index) => `@anaKategoriName${index}`)
        .join(", ")})
    `;

    const request = new sql.Request(); // SQL request nesnesi oluştur

    // Her bir kategori ismi için parametre ekle
    kategoriNames.forEach((name, index) => {
      request.input(`anaKategoriName${index}`, sql.NVarChar, name);
    });

    const result = await request.query(query);
    res.json(result.recordset); // Alt kategori verisini döndür
  } catch (err) {
    console.error(err);
    res.status(500).send(err.message); // Hata mesajı döndür
  }
});

// API endpoint - Ürün Türleri
app.get("/api/urunturleri", async (req, res) => {
  try {
    const { altKategoriName } = req.query; // Alt kategori name'yi parametre olarak al
    await sql.connect(config);

    // Alt kategori adlarını virgülle ayırarak diziye çevir
    const kategoriNames = Array.isArray(altKategoriName)
      ? altKategoriName
      : altKategoriName.split(",").map((name) => name.trim());

    // Tek bir değer varsa onu diziye çevir
    if (kategoriNames.length === 1 && !altKategoriName.includes(",")) {
      kategoriNames.push(altKategoriName);
    }

    // SQL sorgusu oluştur
    const query = `
      SELECT DISTINCT ur.urun_turu 
      FROM dbo.urun ur
      INNER JOIN dbo.alt_kategori alt ON alt.id = ur.alt_kategori_id
      WHERE alt.alt_kategori_adi IN (${kategoriNames
        .map((_, index) => `@altKategoriName${index}`)
        .join(", ")});
    `; // Alt kategoriye göre ürün türlerini al

    const request = new sql.Request(); // SQL request nesnesi oluştur

    // Her bir kategori ismi için parametre ekle
    kategoriNames.forEach((name, index) => {
      request.input(`altKategoriName${index}`, sql.NVarChar, name);
    });

    const result = await request.query(query);
    res.json(result.recordset); // Ürün türü verisini döndür
  } catch (err) {
    console.error(err);
    res.status(500).send(err.message); // Hata mesajı döndür
  }
});

// API endpoint - Ürün Ekleme
app.post("/api/urunler/urunekle", async (req, res) => {
  try {
    await sql.connect(config);
    const { urun_adi, urun_turu, fiyat, stok_miktari } = req.body;

    if (!urun_adi || !urun_turu || !fiyat || !stok_miktari) {
      return res.status(400).send("Ürün bilgileri eksik!");
    }

    const query = `
      INSERT INTO dbo.urun (urun_adi, urun_turu, fiyat, stok_miktari)
      VALUES (@urun_adi, @urun_turu, @fiyat, @stok_miktari);
    `;

    const request = new sql.Request();
    request.input("urun_adi", sql.NVarChar, urun_adi);
    request.input("urun_turu", sql.NVarChar, urun_turu);
    request.input("fiyat", sql.Decimal, fiyat);
    request.input("stok_miktari", sql.Int, stok_miktari);

    await request.query(query);
    res.status(201).send("Ürün başarıyla eklendi.");
  } catch (err) {
    console.error(err);
    res.status(500).send(err.message);
  }
});

// API endpoint - Ürün Silme
app.delete("/api/urunler/urunsil", async (req, res) => {
  try {
    const { urun_turu } = req.body; // Artık req.body'den alıyoruz
    await sql.connect(config);

    if (!urun_turu) {
      return res.status(400).send("urun_turu parameter is required");
    }

    const urunTuruList = Array.isArray(urun_turu)
      ? urun_turu
      : urun_turu.split(",").map((item) => item.trim());

    const deleteQuery = `
      DELETE FROM dbo.urun
      WHERE urun_turu IN (${urunTuruList
        .map((_, index) => `@urun_turu${index}`)
        .join(", ")});
    `;

    const request = new sql.Request();
    urunTuruList.forEach((item, index) => {
      request.input(`urun_turu${index}`, sql.NVarChar, item);
    });

    await request.query(deleteQuery);
    res.status(200).send("Ürün başarıyla silindi.");
  } catch (err) {
    console.error(err);
    res.status(500).send(err.message);
  }
});

// Sunucu başlatma
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
