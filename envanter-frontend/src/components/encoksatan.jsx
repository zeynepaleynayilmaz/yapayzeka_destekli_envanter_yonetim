import { useEffect, useState, useRef } from "react";
import { Chart, registerables } from "chart.js";
import EnAzSatanChart from "./enazsatan";

Chart.register(...registerables);

export const EnCokSatanChart = () => {
  const [products, setProducts] = useState([]);
  const [year, setYear] = useState(2024);
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const chartRef = useRef(null);
  const chartInstanceRef = useRef(null);
  const [showEnAzSatan, setShowEnAzSatan] = useState(false);

  const handleClick = () => {
    setShowEnAzSatan((prev) => !prev);
  };

  // Veri çekme fonksiyonu
  const fetchData = (selectedYear, selectedMonth) => {
    fetch(
      `http://localhost:3000/encok-satan?year=${selectedYear}&month=${selectedMonth}`
    )
      .then((response) => response.json())
      .then((data) => {
        setProducts(data);
      })
      .catch((error) => {
        console.error("Veri çekme hatası:", error);
      });
  };

  // Yıl ve ay değiştiğinde veriyi çek
  useEffect(() => {
    if (!showEnAzSatan) {
      fetchData(year, month);
    }
  }, [year, month, showEnAzSatan]);

  // Grafik çizimi
  useEffect(() => {
    if (chartInstanceRef.current) {
      chartInstanceRef.current.destroy();
      chartInstanceRef.current = null;
    }

    if (products.length > 0 && !showEnAzSatan) {
      const labels = products.map((item) => item.urun_modeli);
      const salesData = products.map((item) => item.toplam_satis);

      chartInstanceRef.current = new Chart(chartRef.current, {
        type: "bar",
        data: {
          labels: labels,
          datasets: [
            {
              label: "Toplam Satış Adedi",
              data: salesData,
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
          responsive: true,
          animation: {
            duration: 1000,
            easing: "easeInOutBounce",
          },
          scales: {
            y: {
              beginAtZero: true,
              ticks: {
                font: {
                  size: 14,
                },
              },
            },
          },
        },
      });
    }
  }, [products, showEnAzSatan]);

  if (showEnAzSatan) {
    return <EnAzSatanChart />;
  }

  return (
    <div className="p-6">
      <h2 
        onClick={handleClick}
        className="text-gray-800 text-2xl font-medium ml-12 mb-70 cursor-pointer hover:text-indigo-600 transition-colors"
      >
        En Çok Satan 10 Ürün
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

export default EnCokSatanChart;
