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
  export function GuncelleEkran({ modalDurumu, setModalDurumu, seciliUrun,refreshData}) {
    const [fiyat, setFiyat] = useState("");
    const [indirimliFiyat, setIndirimliFiyat] = useState("");
    const [stokAdedi, setStokAdedi] = useState("");
    const [normalSatisAdedi, setNormalSatisAdedi] = useState("");
    const [indirimSatisAdedi, setIndirimSatisAdedi] = useState("");
    const [odemeYontemi, setOdemeYontemi] = useState("");
    function modalKapat() {
      setModalDurumu(false); // Close the modal when the user clicks outside or presses the escape key
    }
    const urunGuncelle = async () => {
      console.log("seciliUrun",seciliUrun);
      const urunId = seciliUrun.id;
          if (Number(indirimliFiyat) > Number(fiyat)) {
            alert("İndirimli fiyat normal fiyattan daha yüksek olamaz.");
            return; // Eğer indirimli fiyat büyükse işlemi durdur
          }
      try {
        const response = await axios.put("http://localhost:3000/urunguncelle", {
          id: urunId,
          normal_fiyat: Number(fiyat),
          indirimli_fiyat: Number(indirimliFiyat),
          stok_adedi: Number(stokAdedi),
          indirim_satis_adedi: Number(indirimSatisAdedi),
          normal_satis_adedi: Number(normalSatisAdedi),
          odeme_yontemi: String(odemeYontemi),
        });

        if (response.status === 200) {
          alert("Ürün başarıyla güncellendi.");
          refreshData();
        } else {
          alert("Ürün güncellenirken bir hata oluştu.");
        }
        modaliKapat();
      } catch (error) {
        console.error("Ürün güncellenirken hata oluştu:", error);
        alert("Ürün güncellenirken bir hata oluştu. Lütfen tekrar deneyin.");
      }
    };

    // Modal açık olduğunda, seçilen ürünün fiyat bilgilerini modalda göstermek
    useEffect(() => {
      if (seciliUrun) {
        setFiyat(seciliUrun.normal_fiyat);
        setIndirimliFiyat(seciliUrun.indirimli_fiyat);
        setStokAdedi(seciliUrun.stok_adedi);
        setNormalSatisAdedi(seciliUrun.normal_satis_adedi);
        setIndirimSatisAdedi(seciliUrun.indirim_satis_adedi);
        setOdemeYontemi(seciliUrun.odeme_yontemi);
      }
    }, [seciliUrun]);

    function modaliKapat() {
      setModalDurumu(false);
    }

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
            <CameraAltIcon sx={{ mr: 1 }} /> Ürün Güncelle
          </Typography>

          {/* Editable Fields for Prices */}
          <TextField
            value={stokAdedi}
            onChange={(e) => setStokAdedi(e.target.value)}
            label="Stok Adedi"
            type="number"
            fullWidth
          />

          <TextField
            value={indirimSatisAdedi}
            onChange={(e) => setIndirimSatisAdedi(e.target.value)}
            label="İndirimli Satis Adedi"
            type="number"
            fullWidth
          />

          <TextField
            value={normalSatisAdedi}
            onChange={(e) => setNormalSatisAdedi(e.target.value)}
            label="Normal Satis Adedi"
            type="number"
            fullWidth
          />

          <TextField
            value={fiyat}
            onChange={(e) => setFiyat(e.target.value)}
            label="Normal Fiyat"
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

<FormControl fullWidth>
  <InputLabel>Ödeme Yöntemi</InputLabel>
  <Select
    value={odemeYontemi}
    onChange={(e) => setOdemeYontemi(e.target.value)}
    label="Ödeme Yöntemi"
  >
    <MenuItem value="Nakit">Nakit</MenuItem>
    <MenuItem value="Kredi Kartı">Kredi Kartı</MenuItem>
    <MenuItem value="Havale/EFT">Havale/EFT</MenuItem>
    <MenuItem value="Diğer">Diğer</MenuItem>
  </Select>
</FormControl>


          {/* Update Button */}
          <Button
            variant="contained"
            color="primary"
            fullWidth
            onClick={urunGuncelle}
          >
            Güncelle
          </Button>
        </Box>
      </Modal>
    );
  }
