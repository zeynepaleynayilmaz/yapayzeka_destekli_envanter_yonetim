import React, { useEffect, useState, useRef } from "react";
import { Chart, registerables } from "chart.js";
Chart.register(...registerables);

export const Top10StockChart = () => {
  const [products, setProducts] = useState([]);
  const [year, setYear] = useState(2024);
  const [month, setMonth] = useState(new Date().getMonth()); // Aylar 1'den başlar.
  const chartRef = useRef(null);
  const chartInstanceRef = useRef(null);

  // Veri çekme fonksiyonu
  const fetchData = (selectedYear, selectedMonth) => {
    fetch(
      `http://localhost:3000/top10-stok?year=${selectedYear}&month=${selectedMonth}`
    )
      .then((response) => response.json())
      .then((data) => {
        setProducts(data); // Filtrelenmiş ürünleri state'e kaydediyoruz
      })
      .catch((error) => {
      });
  };

  // Yıl ve ay değiştiğinde veriyi çek
  useEffect(() => {
    fetchData(year, month);
  }, [year, month]);

  // Grafik çizimi
  useEffect(() => {
    if (chartInstanceRef.current) {
      chartInstanceRef.current.destroy(); // Önceki grafik silinir
      chartInstanceRef.current = null;
    }

    if (products.length > 0) {
      // Grafik için doğru veri işleme
      const labels = products.map((item) => item.urun_modeli); // Ürün adlarını etiket olarak al
      const stockData = products.map((item) => item.stok_adedi); // Stok adetlerini veri olarak al

      // Grafik oluşturma
      chartInstanceRef.current = new Chart(chartRef.current, {
        type: "bar", // Bar tipi grafik
        data: {
          labels: labels,
          datasets: [
            {
              label: "Stok Adedi",
              data: stockData,
              backgroundColor: [
                "rgba(255, 182, 193, 0.3)", // Pastel Pembe
                "rgba(173, 216, 230, 0.3)", // Pastel Mavi
                "rgba(144, 238, 144, 0.3)", // Pastel Yeşil
                "rgba(255, 228, 181, 0.3)", // Pastel Sarı
                "rgba(221, 160, 221, 0.3)", // Pastel Mor
                "rgba(255, 239, 184, 0.3)", // Pastel Krema
                "rgba(240, 128, 128, 0.3)", // Pastel Mercan
              ],
              borderColor: [
                "rgb(255, 182, 193)", // Pastel Pembe
                "rgb(173, 216, 230)", // Pastel Mavi
                "rgb(144, 238, 144)", // Pastel Yeşil
                "rgb(255, 228, 181)", // Pastel Sarı
                "rgb(221, 160, 221)", // Pastel Mor
                "rgb(255, 239, 184)", // Pastel Krema
                "rgb(240, 128, 128)", // Pastel Mercan
              ],
              borderWidth: 1,
            },
          ],
        },
        options: {
          responsive: true, // Ekrana duyarlı grafik
          animation: {
            duration: 1000, // Animasyon süresi
            easing: "easeInOutBounce", // Animasyon türü
          },
          scales: {
            y: {
              beginAtZero: true, // Y ekseninin sıfırdan başlaması
              ticks: {
                font: {
                  size: 14, // Y eksenindeki etiketlerin yazı boyutu
                },
              },
            },
          },
        },
      });
    }
  }, [products]);
  return (
    <div className="p-6">
      <h2
        className="text-gray-800 text-2xl font-medium ml-12 mb-70"
      >
        En Çok Stoğu Olan 10 Ürün
      </h2>

      {/* Yıl ve Ay Seçimi */}
      <div className="flex space-x-4 mb-4">
        <div className="flex flex-col">
          <label htmlFor="year" className="text-gray-600 ml-12 text-xs">
            Yıl
          </label>
          <select
            id="year"
            value={year}
            onChange={(e) => setYear(parseInt(e.target.value))}
            className="mt-1 p-2 border border-gray-300 rounded-lg text-sm ml-12 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value={2022}>2022</option>
            <option value={2023}>2023</option>
            <option value={2024}>2024</option>
          </select>
        </div>

        <div className="flex flex-col">
          <label htmlFor="month" className="text-gray-600 text-xs">
            Ay
          </label>
          <select
            id="month"
            value={month}
            onChange={(e) => setMonth(parseInt(e.target.value))}
            className="mt-1 p-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value={1}>Ocak</option>
            <option value={2}>Şubat</option>
            <option value={3}>Mart</option>
            <option value={4}>Nisan</option>
            <option value={5}>Mayıs</option>
            <option value={6}>Haziran</option>
            <option value={7}>Temmuz</option>
            <option value={8}>Ağustos</option>
            <option value={9}>Eylül</option>
            <option value={10}>Ekim</option>
            <option value={11}>Kasım</option>
            <option value={12}>Aralık</option>
          </select>
        </div>
      </div>
      <div>
        <canvas ref={chartRef}></canvas>
      </div>
    </div>
  );
};

export default Top10StockChart;
