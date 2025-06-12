import React, { useEffect, useRef, useState } from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Modal from "@mui/material/Modal";
import TextField from "@mui/material/TextField";
import CameraAltIcon from "@mui/icons-material/CameraAlt";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import axios from "axios";


export function KameraEkleEkran({ modalDurumu, setModalDurumu }) {
  const [adim, setAdim] = useState(1);
  const [kategoriBilgileri, setKategoriBilgileri] = useState({
    anaKategori: "",
    altKategori: "",
    urunTuru: "",
  });
  const modalKapat = () => {
    setModalDurumu(false);
  };

    const today = new Date().toISOString().split("T")[0];


  return (
    <Modal open={modalDurumu} onClose={modalKapat}>
      <>
        {adim === 1 && (
          <KameraAdim1
            setAdim={setAdim}
            setKategoriBilgileri={setKategoriBilgileri}
          />
        )}
        {adim === 2 && (
          <KameraAdim2
            kategoriBilgileri={kategoriBilgileri}
            today={today}
            modalKapat={modalKapat}
          />
        )}
      </>
    </Modal>
  );
}

function KameraAdim1({ setAdim, setKategoriBilgileri }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [mediaStream, setMediaStream] = useState(null);

  useEffect(() => {
    async function startCamera() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.onloadedmetadata = () => {
            videoRef.current.play().catch((err) => {
              console.error("Video oynatılamadı:", err);
            });
          };
          setMediaStream(stream); // Kamera akışını state'e kaydediyoruz
        }
      } catch (err) {
        console.error("Kamera açılırken hata oluştu:", err);
      }
    }
    startCamera();

    return () => {
      stopCamera();
    };
  }, []);

  // Kamera akışını durdurma fonksiyonu
  const stopCamera = () => {
    if (mediaStream) {
      mediaStream.getTracks().forEach((track) => {
        track.stop(); // Kamera akışını durdurur
      });
      console.log("Kamera akışı durduruldu.");
    }
  };

  async function fotoCek() {
    const video = videoRef.current;
    const canvas = canvasRef.current;

    if (!canvas || !video) {
      console.error("Canvas veya video referansı bulunamadı.");
      return;
    }

    const context = canvas.getContext("2d");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    canvas.toBlob(async (blob) => {
      if (!blob) {
        console.error("Blob verisi alınamadı.");
        return;
      }

      // Blob'u sunucuya gönder
      const formData = new FormData();
      formData.append("image", blob, "image.jpeg");

      try {
        const response = await axios.post(
          "http://localhost:3000/gemini",
          formData,
          {
            headers: { "Content-Type": "multipart/form-data" },
          }
        );
        const { anaKategori, altKategori, urunTuru } = response.data;
        if (!anaKategori || !altKategori || !urunTuru) {
          alert("Tahmin edilen kategori bilgileri alınamadı.");
          return;
        }
        setKategoriBilgileri({ anaKategori, altKategori, urunTuru });
        setAdim(2);

        // Kamera akışını durdur
        stopCamera();
      } catch (error) {
        console.error("Gemini API çağrısında hata:", error);
      }
    });
  }

  return (
    <Box
      sx={{
        position: "absolute",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        width: 800,
        bgcolor: "background.paper",
        borderRadius: 2,
        boxShadow: 24,
        p: 4,
        display: "flex",
        flexDirection: "column",
        gap: 2,
      }}
    >
      <Typography variant="h6" component="h2">
        <CameraAltIcon sx={{ mr: 1 }} /> Kamera ile ürün ekle
      </Typography>
      <Box sx={{ display: "none" }}>
        <canvas ref={canvasRef}></canvas>
      </Box>
      <video
        ref={videoRef}
        style={{ width: "100%", height: "auto", borderRadius: "8px" }}
      />
      <Button
        variant="contained"
        color="primary"
        fullWidth
        startIcon={<CameraAltIcon />}
        onClick={fotoCek}
      >
        Fotoğraf Çek
      </Button>
    </Box>
  );
}

 function KameraAdim2({ kategoriBilgileri, today ,modalKapat}) {
    const [urunModeli, setUrunModeli] = useState("");
    const [fiyat, setFiyat] = useState("");
    const [indirimliFiyat, setIndirimliFiyat] = useState("");
    const [stok, setStok] = useState("");
    const [stokGirisTarihi, setStokGirisTarihi] = useState(today);
    const [stokCikisTarihi, setStokCikisTarihi] = useState("");
    const [indirimSatisAdedi, setIndirimSatisAdedi] = useState("");
    const [normalSatisAdedi, setNormalSatisAdedi] = useState("");
    const[anaKategori,setAnaKategori] = useState(""); 
    const[altKategori,setAltKategori] = useState("");
    const [urunTuru, setUrunTuru] = useState("");

    const kategoriListesi = [
      {
        id: 1,
        kategori_adi: "Dış Giyim",
        anaKategoriId: 1,
      },
      {
        id: 2,
        kategori_adi: "Ayakkabı",
        anaKategoriId: 1,
      },
      {
        id: 3,
        kategori_adi: "Çocuk Giyim",
        anaKategoriId: 1,
      },
      {
        id: 4,
        kategori_adi: "Üst Giyim",
        anaKategoriId: 1,
      },
      {
        id: 5,
        kategori_adi: "Alt Giyim",
        anaKategoriId: 1,
      },
      {
        id: 6,
        kategori_adi: "Aksesuar",
        anaKategoriId: 1,
      },
      {
        id: 7,
        kategori_adi: "Makyaj",
        anaKategoriId: 2,
      },
      {
        id: 8,
        kategori_adi: "Kişisel Bakım",
        anaKategoriId: 2,
      },
      {
        id: 9,
        kategori_adi: "Küçük Ev Aletleri",
        anaKategoriId: 3,
      },
      {
        id: 10,
        kategori_adi: "Giyilebilir Teknoloji",
        anaKategoriId: 3,
      },
      {
        id: 11,
        kategori_adi: "Telefon",
        anaKategoriId: 3,
      },
      {
        id: 12,
        kategori_adi: "Beyaz Eşya",
        anaKategoriId: 3,
      },
      {
        id: 13,
        kategori_adi: "Televizyon",
        anaKategoriId: 3,
      },
      {
        id: 14,
        kategori_adi: "Kamera",
        anaKategoriId: 3,
      },
      {
        id: 15,
        kategori_adi: "Aksesuarlar",
        anaKategoriId: 3,
      },
      {
        id: 16,
        kategori_adi: "Sofra & Mutfak",
        anaKategoriId: 4,
      },
      {
        id: 17,
        kategori_adi: "Ev Gereçleri",
        anaKategoriId: 4,
      },
      {
        id: 18,
        kategori_adi: "Ev Tekstili",
        anaKategoriId: 4,
      },
      {
        id: 19,
        kategori_adi: "Ev Dekorasyon",
        anaKategoriId: 4,
      },
      {
        id: 20,
        kategori_adi: "Ev Aydınlatma",
        anaKategoriId: 4,
      },
      {
        id: 21,
        kategori_adi: "Mobilya",
        anaKategoriId: 4,
      },
    ];
    // Ürün ekleme fonksiyonu
    const yeniUrun = async () => {
      try {
        // altKategori adıyla eşleşen kategori ID'sini bul
        const eslesenKategori = kategoriListesi.find(
          (kategori) => kategori.kategori_adi === kategoriBilgileri.altKategori
        );

        const altKategoriId = eslesenKategori ? eslesenKategori.id : null;

        if (!altKategoriId) {
          alert("Alt kategori ID bulunamadı!");
          return;
        }

        const response = await axios.post(
          "http://localhost:3000/urun-kamera-ekle",
          {
            urun_turu: kategoriBilgileri.urunTuru ?? "Bilinmiyor",
            urun_modeli: urunModeli ?? "Bilinmiyor",
            normal_fiyat: parseFloat(fiyat) || 0,
            indirimli_fiyat: parseFloat(indirimliFiyat) || 0,
            stok_adedi: parseInt(stok) || 0,
            stok_giris_tarihi: stokGirisTarihi || null,
            stok_cikis_tarihi: stokCikisTarihi || null,
            indirim_satis_adedi: parseInt(indirimSatisAdedi) || 0,
            normal_satis_adedi: parseInt(normalSatisAdedi) || 0,
            altKategoriId: altKategoriId, // Doğru kategori ID'si gönderiliyor
          }
        );
            alert("Ürün başarıyla eklendi: " + response.data);
        console.log("Ürün başarıyla eklendi:", response.data);
        modalKapat();
      } catch (error) {
        console.error("Ürün ekleme başarısız oldu:", error);
      }
    };

    return (
      <Box
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: 800,
          bgcolor: "background.paper",
          borderRadius: 2,
          boxShadow: 24,
          p: 4,
          display: "flex",
          flexDirection: "column",
          gap: 2,
        }}
      >
        <Typography variant="h6" component="h2">
          <CameraAltIcon sx={{ mr: 1 }} /> Kamera ile Ürün Ekle
        </Typography>

        <TextField
          label="Ana Kategori"
          value={kategoriBilgileri.anaKategori}
          onChange={(e) => setAnaKategori(e.target.value)}
          fullWidth
          margin="normal"
          disabled
        />
        <TextField
          label="Alt Kategori"
          value={kategoriBilgileri.altKategori}
          onChange={(e) => setAltKategori(e.target.value)}
          fullWidth
          margin="normal"
          disabled
        />
        <TextField
          label="Ürün Türü"
          value={kategoriBilgileri.urunTuru}
          onChange={(e) => setUrunTuru(e.target.value)}
          fullWidth
          margin="normal"
          disabled
        />

        <TextField
          label="Ürün Modeli"
          value={urunModeli}
          onChange={(e) => setUrunModeli(e.target.value)}
          fullWidth
        />
        <TextField
          label="Fiyat"
          type="number"
          value={fiyat}
          onChange={(e) => setFiyat(e.target.value)}
          fullWidth
        />
        <TextField
          label="İndirimli Fiyat"
          type="number"
          value={indirimliFiyat}
          onChange={(e) => setIndirimliFiyat(e.target.value)}
          fullWidth
        />

        <TextField
          label="Stok"
          type="number"
          value={stok}
          onChange={(e) => setStok(e.target.value)}
          fullWidth
        />

        <TextField
          label="Stok Giriş Tarihi"
          type="date"
          fullWidth
          value={stokGirisTarihi} // Set to today's date
          disabled // Prevent modification
          InputLabelProps={{
            shrink: true, // Ensure the label is properly displayed
          }}
        />

        <Button
          variant="contained"
          color="primary"
          fullWidth
          onClick={yeniUrun}
        >
          Ekle
        </Button>
      </Box>
    );}