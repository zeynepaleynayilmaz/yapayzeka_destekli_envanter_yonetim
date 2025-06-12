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
import { useEffect, useState } from "react";
import axios from "axios";

// dışarıdan modalDurumu, setModalDurumu ve modaliKapat fonksiyonlarını alıyoruz
export function SilEkran({ modalDurumu, setModalDurumu }) {
  const [anaKategoriler, setAnaKategoriler] = useState([]);
  const [secilmisAnaKategori, setSecilmisAnaKategori] = useState(null);
  const [secilmisAltKategori, setSecilmisAltKategori] = useState(null);
  const [altKategoriyeAitUrunTurleri, setAltKategoriyeAitUrunTurleri] = useState([]);
  const [secilmisUrunTuru, setSecilmisUrunTuru] = useState(null);
  const [urunModelleri, setUrunModelleri] = useState([]);
  const [secilmisUrunModeli, setSecilmisUrunModeli] = useState(null);

  const urunSil = async () => {
    try {
      const response = await axios.delete("http://localhost:3000/urunsil", {
        data: {
          id: secilmisUrunModeli.id,
        },
      });
      modaliKapat();
    } catch (error) {
      console.error("Ürün silinirken hata oluştu:", error);
    }
  };

  function modaliKapat() {
    setModalDurumu(false);
  }

  // Veritabanından ana kategorileri çekiyoruz
  useEffect(() => {
    axios.get("http://localhost:3000/anakategoriler").then((response) => {
      setAnaKategoriler(response.data);
    });
  }, []);

  // Seçilmiş Ürün Türüne ve Alt Kategoriye ait ürün modellerini çekiyoruz
  useEffect(() => {
    if (secilmisUrunTuru && secilmisAltKategori) {
      axios
        .get("http://localhost:3000/urun-modelleri", {
          params: {
            altKategoriId: secilmisAltKategori.id,
            urun_turu: secilmisUrunTuru,
          },
        })
        .then((response) => {
          setUrunModelleri(response.data); // kullanmak için değişkene atıyoruz
        });
    }
  }, [secilmisUrunTuru, secilmisAltKategori]);

  // Seçilen alt kategoriye ait ürün türlerini çekiyoruz
  useEffect(() => {
    if (secilmisAltKategori) {
      axios
        .get("http://localhost:3000/urun-turleri", {
          params: {
            altKategoriId: secilmisAltKategori.id,
          },
        })
        .then((response) => {
          setAltKategoriyeAitUrunTurleri(response.data);
        });
    }
  }, [secilmisAltKategori]);

  return (
    <Modal
      open={modalDurumu}
      onClose={() => {
        setModalDurumu(false);
      }}
    >
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
          <CameraAltIcon sx={{ mr: 1 }} /> Ürün Sil
        </Typography>
        <TextField label="Ürün ID" defaultValue="XXXX" fullWidth />

        <FormControl fullWidth>
          <InputLabel>Ana Kategori</InputLabel>
          <Select
            value={secilmisAnaKategori}
            onChange={(event) => setSecilmisAnaKategori(event.target.value)}
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
            value={secilmisAltKategori}
            onChange={(event) => setSecilmisAltKategori(event.target.value)}
            label="Alt Kategori"
          >
            {secilmisAnaKategori &&
              secilmisAnaKategori.AltKategori.map((altKategori) => (
                <MenuItem key={altKategori} value={altKategori}>
                  {altKategori.kategori_adi}
                </MenuItem>
              ))}
          </Select>
        </FormControl>

        <FormControl fullWidth>
          <InputLabel>Ürün Türü</InputLabel>
          <Select
            value={secilmisUrunTuru}
            onChange={(event) => setSecilmisUrunTuru(event.target.value)}
            label="Ürün Türü"
          >
            {altKategoriyeAitUrunTurleri.map((urunTuru) => (
              <MenuItem key={urunTuru.id} value={urunTuru.urun_turu}>
                {urunTuru.urun_turu}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl fullWidth>
          <InputLabel>Ürün Modeli</InputLabel>
          <Select
            value={secilmisUrunModeli}
            onChange={(event) => setSecilmisUrunModeli(event.target.value)}
            label="Ürün Modeli"
          >
            {urunModelleri.map((urunModeli) => (
              <MenuItem key={urunModeli.id} value={urunModeli}>
                {urunModeli.urun_modeli}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <Button variant="contained" color="primary" fullWidth onClick={urunSil}>
          Urun Çıkışı Yap
        </Button>
      </Box>
    </Modal>
  );
}
