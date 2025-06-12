import React, { useState, useEffect } from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Modal from "@mui/material/Modal";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import axios from "axios";

export function KategoriSec({ modalDurumu, setModalDurumu, onSelect }) {
  const [anaKategoriler, setAnaKategoriler] = useState([]);
  const [secilmisAnaKategori, setSecilmisAnaKategori] = useState(null);
  const [secilmisAltKategori, setSecilmisAltKategori] = useState(null);

  useEffect(() => {
    axios.get("http://localhost:3000/anakategoriler").then((response) => {
      setAnaKategoriler(response.data);
    });
  }, []);

  const kategoriyiSec = () => {
    if (secilmisAnaKategori && secilmisAltKategori) {
      onSelect({
        anaKategori: secilmisAnaKategori,
        altKategori: secilmisAltKategori,
      });
      setModalDurumu(false);
    } else {
      alert("Lütfen hem ana kategori hem de alt kategori seçiniz!");
    }
  };

  return (
    <Modal open={modalDurumu} onClose={() => setModalDurumu(false)}>
      <Box
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: 400,
          bgcolor: "background.paper",
          borderRadius: 2,
          boxShadow: 24,
          p: 4,
          display: "flex",
          flexDirection: "column",
          gap: 2,
          zIndex: 5,
        }}
      >
        <Typography variant="h6" sx={{ textAlign: "center" }}>
          Kategori Seç
        </Typography>
        <FormControl fullWidth>
          <InputLabel>Ana Kategori</InputLabel>
          <Select
            value={secilmisAnaKategori}
            onChange={(event) => setSecilmisAnaKategori(event.target.value)}
          >
            {anaKategoriler.map((kategori) => (
              <MenuItem key={kategori.id} value={kategori}>
                {kategori.kategori_adi}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl fullWidth disabled={!secilmisAnaKategori}>
          <InputLabel>Alt Kategori</InputLabel>
          <Select
            value={secilmisAltKategori}
            onChange={(event) => setSecilmisAltKategori(event.target.value)}
          >
            {secilmisAnaKategori?.AltKategori?.map((altKategori) => (
              <MenuItem key={altKategori.id} value={altKategori}>
                {altKategori.kategori_adi}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <Button variant="contained" onClick={kategoriyiSec}>
          Seç
        </Button>
      </Box>
    </Modal>
  );
}

export default KategoriSec;
