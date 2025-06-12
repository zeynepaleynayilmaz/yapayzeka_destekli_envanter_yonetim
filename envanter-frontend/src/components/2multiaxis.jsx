import { useEffect, useRef, useState } from "react";
import { Chart, registerables } from "chart.js";
import Enyavas from "./enyavassatilan"; // Eğer default export kullanıyorsanız

Chart.register(...registerables);

export const FastestSellingProductsChart = () => {
  const [products, setProducts] = useState([]);
  const [year, setYear] = useState(2024);
  const [month, setMonth] = useState(new Date().getMonth() ); // Aylar 1'den başlar
  const chartRef = useRef(null);
  const chartInstanceRef = useRef(null);
  const [showEnyavas, setShowEnyavas] = useState(false); // Enyavas gösterme state'i

  const handleClick = () => {
    setShowEnyavas((prevState) => !prevState); // Başlık tıklandığında Enyavas'ı göster/gizle
  };

  // Veri çekme fonksiyonu
  const fetchData = (selectedYear, selectedMonth) => {
    fetch(
      `http://localhost:3000/top10-fastest-selling?year=${selectedYear}&month=${selectedMonth}`
    )
      .then((response) => response.json())
      .then((data) => {
        setProducts(data); // Filtrelenmiş ürünleri state'e kaydediyoruz
      })
      .catch((error) => {
        console.error("Veri çekme hatası:", error);
      });
  };

  // Yıl ve ay değiştiğinde veriyi çek
  useEffect(() => {
    if (!showEnyavas) {
      fetchData(year, month);
    }
  }, [year, month, showEnyavas]);

  // Grafik çizimi
  useEffect(() => {
    if (chartInstanceRef.current) {
      chartInstanceRef.current.destroy(); // Önceki grafik silinir
      chartInstanceRef.current = null;
    }

    if (products.length > 0 && !showEnyavas) {
      const chartInstance = new Chart(chartRef.current, {
        type: "bar",
        data: {
          labels: products.map((item) => item.urun_modeli),
          datasets: [
            {
              label: "Satış Süresi (Gün)",
              data: products.map((item) => item.satis_suresi),
              backgroundColor: [
                "rgba(255, 99, 132, 0.2)",
                "rgba(255, 159, 64, 0.2)",
                "rgba(255, 205, 86, 0.2)",
                "rgba(75, 192, 192, 0.2)",
                "rgba(54, 162, 235, 0.2)",
                "rgba(153, 102, 255, 0.2)",
                "rgba(201, 203, 207, 0.2)",
              ],
              borderColor: [
                "rgb(255, 99, 132)",
                "rgb(255, 159, 64)",
                "rgb(255, 205, 86)",
                "rgb(75, 192, 192)",
                "rgb(54, 162, 235)",
                "rgb(153, 102, 255)",
                "rgb(201, 203, 207)",
              ],
              borderWidth: 1,
            },
          ],
        },
        options: {
          responsive: true,
          scales: {
            y: {
              beginAtZero: true,
              title: {
                display: true,
                text: "Satış Süresi (Gün)",
              },
            },
          },
        },
      });

      chartInstanceRef.current = chartInstance;
    }

    return () => {
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy(); // Grafiği temizle
      }
    };
  }, [products, showEnyavas]); // 'products' ve 'showEnyavas' state'leri değiştiğinde grafik güncellenir

  if (showEnyavas) {
    return <Enyavas />;
  }

  return (
    <div className="p-6">
      <>
        <h2
          onClick={handleClick}
          className="text-gray-800 text-2xl font-medium ml-16 mb-70 cursor-pointer"
        >
          En Hızlı Satılan 10 Ürün
        </h2>

        {/* Yıl ve Ay Seçimi */}
        <div className="flex space-x-4 mb-4">
          <div className="flex flex-col">
            <label htmlFor="year" className="text-gray-600 ml-16 text-xs">
              Yıl
            </label>
            <select
              id="year"
              value={year}
              onChange={(e) => setYear(parseInt(e.target.value))}
              className="mt-1 p-2 border border-gray-300 rounded-lg text-sm ml-16 focus:outline-none focus:ring-2 focus:ring-indigo-500"
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

        <div className="">
          <canvas ref={chartRef}></canvas>
        </div>
      </>
    </div>
  );
};

export default FastestSellingProductsChart;
