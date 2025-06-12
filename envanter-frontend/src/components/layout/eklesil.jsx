import React, { useState } from "react";
import Box from "@mui/material/Box";
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { CikisYap } from "../envanter-ekranlari/cikis-yap";
import { EkleEkran } from "../envanter-ekranlari/ekle-ekran";
import {KameraEkleEkran} from "../envanter-ekranlari/kamera-ekle-ekran";

export function Eklesil() {
  const [isAddExpanded, setIsAddExpanded] = useState(false);
  const [isRemoveExpanded, setIsRemoveExpanded] = useState(false);
  const handleAddAccordionChange = () => {
    setIsAddExpanded((prev) => !prev);
    setIsRemoveExpanded(false);
  };
  const handleRemoveAccordionChange = () => {
    setIsRemoveExpanded((prev) => !prev);
    setIsAddExpanded(false);
  };

  // Ürün silme
  const [uruncikisyapModalAcik, setUruncikisyapModalAcik] = useState(false);
  // Ürün ekleme
  const [urunEkleModalDurum, setUrunEkleModalDurum] = useState(false);
  // Kamera ile ürün ekleme
  const [kameraUrunEkleModalDurum, setKameraUrunEkleModalDurum] = useState(false);

  return (
    <div className="mt-6">
      <Box sx={{ minWidth: 275, marginBottom: 2 }}>
        <Accordion expanded={isAddExpanded} onChange={handleAddAccordionChange}>
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            aria-controls="panel1a-content"
            id="panel1a-header"
          >
            <Typography variant="h6">Ürün Ekle</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography>
              <ul className="flex flex-col items-center">
                <li className="flex justify-center w-full">
                  <Button
                    onClick={() => {
                      setUrunEkleModalDurum(true); // Manuel ürün ekleme ekranını aç
                    }}
                    style={{
                      backgroundColor: "#2d3748",
                      color: "white",
                      padding: "8px 30px",
                    }}
                  >
                    Manuel Ürün Ekle
                  </Button>
                </li>
                <li
                  className="flex justify-center w-full"
                  style={{ marginTop: "8px" }}
                >
                  <Button
                    onClick={() => {
                      setKameraUrunEkleModalDurum(true); // Kamera ile ürün ekleme ekranını aç
                    }}
                    style={{
                      backgroundColor: "#2d3748",
                      color: "white",
                      padding: "9px 15px",
                    }}
                  >
                    Kamera ile Ürün Ekle
                  </Button>
                </li>
              </ul>
            </Typography>
          </AccordionDetails>
        </Accordion>
      </Box>

      <Box sx={{ minWidth: 275 }}>
        <Accordion
          expanded={isRemoveExpanded}
          onChange={handleRemoveAccordionChange}
        >
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            aria-controls="panel2a-content"
            id="panel2a-header"
          >
            <Typography variant="h6">Ürün Çıkışı </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography>
              <ul className="flex flex-col items-center">
                <li className="flex justify-center w-full">
                  <Button
                    onClick={() => {
                      setUruncikisyapModalAcik(true); // Ürün  ekranını aç
                    }}
                    style={{
                      backgroundColor: "#2d3748",
                      color: "white",
                      padding: "9px 30px",
                    }}
                  >
                    Ürün Çıkışı Yap
                  </Button>
                </li>
              </ul>
            </Typography>
          </AccordionDetails>
        </Accordion>
      </Box>

      <KameraEkleEkran
        modalDurumu={kameraUrunEkleModalDurum}
        setModalDurumu={setKameraUrunEkleModalDurum}
      />

      <EkleEkran
        modalDurumu={urunEkleModalDurum}
        setModalDurumu={setUrunEkleModalDurum}
      />

      <CikisYap
        modalDurumu={uruncikisyapModalAcik}
        setModalDurumu={setUruncikisyapModalAcik}
      />
    </div>
  );
}
