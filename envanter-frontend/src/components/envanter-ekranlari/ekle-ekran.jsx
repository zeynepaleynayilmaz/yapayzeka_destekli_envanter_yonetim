import axios from "axios";
import React, { useEffect, useState } from "react";
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

export function EkleEkran({ modalDurumu, setModalDurumu, refreshData }) {
  const [urunTuru, setUrunTuru] = useState("");
  const [urunModeli, setUrunModeli] = useState("");
  const [fiyat, setFiyat] = useState("");
  const [indirimliFiyat, setIndirimliFiyat] = useState("");
  const [stok, setStok] = useState("");
  const [stokGirisTarihi, setStokGirisTarihi] = useState("");
  const [stokCikisTarihi, setStokCikisTarihi] = useState("");
  const [indirimSatisAdedi, setIndirimSatisAdedi] = useState("");
  const [normalSatisAdedi, setNormalSatisAdedi] = useState("");

  const [anaKategoriler, setAnaKategoriler] = useState([]);
  const [secilmisAnaKategori, setSecilmisAnaKategori] = useState(null);
  const [altKategori, setAltKategori] = useState(null);

  const today = new Date().toISOString().split("T")[0];
  useEffect(() => {
    // Form açıldığında stok giriş tarihini sistem tarihine ayarla
    setStokGirisTarihi(today);
  }, [modalDurumu]);

  // Ürün ekleme fonksiyonu
  const urunEkle = async () => {
    if (Number(indirimliFiyat) > Number(fiyat)) {
      alert("İndirimli fiyat normal fiyattan daha yüksek olamaz.");
      return; // Eğer indirimli fiyat büyükse işlemi durdur
    }
    try {
      const response = await axios.post("http://localhost:3000/urun-ekle", {
        urun_turu: urunTuru,
        urun_modeli: urunModeli,
        normal_fiyat: Number(fiyat),
        indirimli_fiyat: Number(indirimliFiyat),
        stok_adedi: Number(stok),
        stok_cikis_tarihi: new Date(stokCikisTarihi),
        indirim_satis_adedi: Number(indirimSatisAdedi),
        normal_satis_adedi: Number(normalSatisAdedi),
        stok_giris_tarihi: new Date(stokGirisTarihi),
        altKategoriId: altKategori.id,
      });
      alert("Ürün başarıyla eklendi: " + response.data);
      
      refreshData(); // Eklenen ürünü güncelleme
    } catch (error) {
      console.error("Ürün eklenirken hata oluştu:", error);
    modalKapat();
  }
  };

  function modalKapat() {
    setModalDurumu(false);
  }

  useEffect(() => {
    axios.get("http://localhost:3000/anakategoriler").then((response) => {
      setAnaKategoriler(response.data);
    });
  }, []);

  return (
    <Modal open={modalDurumu} onClose={modalKapat}>
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
          <CameraAltIcon sx={{ mr: 1 }} /> Manuel Ürün Ekle
        </Typography>
        <FormControl fullWidth>
          <InputLabel>Ana Kategori</InputLabel>
          <Select
            value={secilmisAnaKategori}
            onChange={(v) => {
              setSecilmisAnaKategori(v.target.value);
            }}
            label="Ana Kategori"
          >
            {anaKategoriler.map((kategori) => (
              <MenuItem key={kategori.id} value={kategori}>
                {kategori.kategori_adi}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl fullWidth>
          <InputLabel>Alt Kategori</InputLabel>
          <Select
            value={altKategori}
            onChange={(event) => setAltKategori(event.target.value)}
            label="Alt Kategori"
          >
            {secilmisAnaKategori?.AltKategori.map((subcategory) => (
              <MenuItem key={subcategory} value={subcategory}>
                {subcategory.kategori_adi}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <TextField
          value={urunTuru}
          onChange={(e) => setUrunTuru(e.target.value)}
          label="Ürün Türü"
          type="text"
          fullWidth
        />
        <TextField
          value={urunModeli}
          onChange={(e) => setUrunModeli(e.target.value)}
          label="Ürün Modeli"
          type="text"
          fullWidth
        />
        <TextField
          value={fiyat}
          onChange={(e) => setFiyat(e.target.value)}
          label="Fiyat"
          type="number"
          fullWidth
        />
        <TextField
          value={indirimliFiyat}
          onChange={(e) => setIndirimliFiyat(e.target.value)}
          label="İndirimli Fiyat"
          type="number"
          fullWidth
        />
        <TextField
          value={stok}
          onChange={(e) => setStok(e.target.value)}
          label="Stok"
          type="number"
          fullWidth
        />
        <TextField
          label="Stok Giriş Tarihi"
          type="date"
          fullWidth
          value={today} // Değer sistem tarihini alır
          disabled // Kullanıcının değişiklik yapmasını engeller
          InputLabelProps={{
            shrink: true, // Tarihi düzgün şekilde göstermesi için
          }}
        />
        <Button
          variant="contained"
          color="primary"
          fullWidth
          onClick={urunEkle}
        >
          Ekle
        </Button>
      </Box>
    </Modal>
  );
}
