import React, { useEffect, useState } from "react";
import { Radar } from "react-chartjs-2";
import axios from "axios";
import KategoriSec from "./envanter-ekranlari/anakategorisec"; // KategoriSec bileşenini içeri aktarın

export const CategoryRadarChart = () => {
  const [chartData, setChartData] = useState(null); // Ana kategori grafiği için veri
  const [modalDurumu, setModalDurumu] = useState(false); // Modalın açık/kapalı durumu
  const [selectedCategory, setSelectedCategory] = useState(null); // Seçilen ana kategori
  const [selectedSubcategoryData, setSelectedSubcategoryData] = useState(null); // Seçilen alt kategori verisi

  // Ana kategorilere ait ürün sayısını çek
  useEffect(() => {
    async function fetchCategoryData() {
      try {
        const response = await axios.get(
          "http://localhost:3000/category-product-count"
        );
        const categories = response.data;

        setChartData({
          labels: categories.map((cat) => cat.kategoriAdi),
          datasets: [
            {
              label: "Ana Kategorilere Göre Ürün Sayısı",
              data: categories.map((cat) => cat.urunSayisi),
              backgroundColor: "rgba(54, 162, 235, 0.2)",
              borderColor: "rgba(54, 162, 235, 1)",
              borderWidth: 2,
            },
          ],
        });
      } catch (error) {
        console.error("Radar Chart verileri alınırken hata:", error);
      }
    }

    fetchCategoryData();
  }, []);

  const handleCategorySelection = async (selected) => {
    setSelectedCategory(selected);

    // Seçilen alt kategoriye ait ürün sayısını çek
    if (selected?.altKategori) {
      try {
        const response = await axios.get(
          `http://localhost:3000/subcategory-product-count/${selected.anaKategori.id}`
        );
        const subcategories = response.data;

        const selectedSubcategory = subcategories.find(
          (sub) => sub.altKategoriAdi === selected.altKategori.kategori_adi
        );

        if (selectedSubcategory) {
          setSelectedSubcategoryData({
            label: `${selected.altKategori.kategori_adi} Ürün Sayısı`,
            data: [selectedSubcategory.urunSayisi],
            backgroundColor: "rgba(255, 99, 132, 0.2)",
            borderColor: "rgba(255, 99, 132, 1)",
            borderWidth: 2,
          });
        }
      } catch (error) {
        console.error("Alt kategori ürün sayısı alınırken hata:", error);
      }
    }
  };

  return (
    <div style={{ width: "600px", height: "600px", margin: "0 auto" }}>
      {/* Başlığa tıklandığında modal açılır */}
      <h2
        className="text-gray-800 text-2xl font-medium cursor-pointer mb-4"
        onClick={() => setModalDurumu(true)}
      >
        Kategori ve Alt Kategori Radar Grafiği
      </h2>

      {/* Radar Chart */}
      {chartData ? (
        <Radar
          data={{
            labels: chartData.labels.concat(
              selectedSubcategoryData ? [selectedSubcategoryData.label] : []
            ), // Ana kategori + Alt kategori
            datasets: [
              chartData.datasets[0], // Mevcut ana kategori verisi
              ...(selectedSubcategoryData ? [selectedSubcategoryData] : []), // Seçilen alt kategori verisi
            ],
          }}
          options={{
            responsive: true,
            maintainAspectRatio: false,
            scales: {
              r: {
                ticks: {
                  beginAtZero: true,
                },
              },
            },
          }}
        />
      ) : (
        <div>Yükleniyor...</div>
      )}

      {/* KategoriSec Modalı */}
      <KategoriSec
        modalDurumu={modalDurumu}
        setModalDurumu={setModalDurumu}
        onSelect={handleCategorySelection}
      />
    </div>
  );
};

export default CategoryRadarChart;
