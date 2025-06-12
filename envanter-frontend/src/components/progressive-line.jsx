import React, { useEffect, useState } from "react";
import { Pie, Bar } from "react-chartjs-2";
import Button from "@mui/material/Button";
import UrunSec from "./envanter-ekranlari/urunsecmodal";
import axios from "axios";

const Gelirdagilimi = () => {
  const [kategoriData, setKategoriData] = useState(null);
  const [urunData, setUrunData] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  // Kategori gelir dağılımını al
  useEffect(() => {
    axios
      .get("http://localhost:3000/kategori-gelir-dagilimi")
      .then((response) => {
        const labels = response.data.map((item) => item.kategoriAdi);
        const data = response.data.map((item) => item.toplamGelir);
        setKategoriData({
          labels,
          datasets: [
            {
              data,
              backgroundColor: ["#FF6384", "#36A2EB", "#FFCE56", "#AACA86"],
              hoverBackgroundColor: [
                "#FF4364",
                "#2592DB",
                "#FFAE36",
                "#9ABB76",
              ],
              hoverOffset: 4,
            },
          ],
        });
      });
  }, []);

  // Seçilen ürün için gelir grafiğini al
  useEffect(() => {
    if (selectedProduct) {
      axios
        .get("http://localhost:3000/sales-data2", {
          params: { urunId: selectedProduct.id },
        })
        .then((response) => {
          const data = response.data;
          setUrunData({
            labels: ["Gelir"],
            datasets: [
              {
                label: `${selectedProduct.urun_modeli} Gelir`,
                data: [data.gelir],
                backgroundColor: ["#36A2EB"],
                hoverBackgroundColor: ["#2592DB"],
                hoverBorderWidth: 3,
              },
            ],
          });
        });
    }
  }, [selectedProduct]);

  return (
    <div>
      <h2
        className="text-gray-800 text-2xl font-medium cursor-pointer mb-4"
        onClick={() => setModalOpen(true)}
        style={{ cursor: "pointer" }}
      >
        Kategoriye Göre Gelir Dağılımı
      </h2>

      {/* Grafik alanı */}
      <div style={{ 
        width: "90%", 
        height: "500px", 
        margin: "auto", 
        display: "flex", 
        alignItems: "center",
        justifyContent: "center" 
      }}>
        {!selectedProduct && kategoriData && (
          <div style={{ 
            position: "relative", 
            width: "80%", 
            maxWidth: "500px" 
          }}>
            <Pie
              data={kategoriData}
              options={{
                responsive: true,
                maintainAspectRatio: true,
                animation: {
                  duration: 1000,
                  easing: "easeInOutQuart",
                },
              }}
            />
          </div>
        )}
        {selectedProduct && urunData && (
          <div style={{ 
            position: "relative", 
            width: "80%",
            maxWidth: "500px" 
          }}>
            <Bar
              data={urunData}
              options={{
                responsive: true,
                maintainAspectRatio: true,
                animation: {
                  duration: 1000,
                  easing: "easeInOutQuart",
                },
                scales: {
                  y: {
                    beginAtZero: true,
                    ticks: {
                      stepSize: 50,
                    },
                  },
                },
              }}
            />
          </div>
        )}
      </div>

      {/* UrunSec modalı */}
      <UrunSec
        modalDurumu={modalOpen}
        setModalDurumu={setModalOpen}
        setSelectedProduct={setSelectedProduct}
      />
    </div>
  );
};

export default Gelirdagilimi;
