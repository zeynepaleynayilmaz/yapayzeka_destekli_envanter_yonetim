import { useEffect, useState } from "react";
import { Line } from "react-chartjs-2";
import "chart.js/auto";
import { UrunSec } from "./envanter-ekranlari/urunsecmodal";

const FiyatTrendleri = () => {
  const [modalDurumu, setModalDurumu] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [trendData, setTrendData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!selectedProduct) {
      setLoading(false);
      return;
    }

    const fetchTrendData = async () => {
      try {
        const response = await fetch(
          `http://localhost:3000/fiyat-trendleri?urunId=${selectedProduct.id}`
        );

        if (!response.ok) {
          throw new Error("Veri çekilirken bir hata oluştu");
        }

        const data = await response.json();
        setTrendData(data);
        setError(null);
      } catch (error) {
        setTrendData([]);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchTrendData();
  }, [selectedProduct]);

  if (loading) return <p>Yükleniyor...</p>;

  const chartData = {
    labels: trendData.map((item) => `ID: ${item.id}`),
    datasets: [
      {
        label: "Normal Fiyat",
        data: trendData.map((item) => item.normal_fiyat),
        borderColor: "rgba(75, 192, 192, 1)",
        backgroundColor: "rgba(75, 192, 192, 0.2)",
        fill: true,
        tension: 0.4,
      },
      {
        label: "İndirimli Fiyat",
        data: trendData.map((item) => item.indirimli_fiyat),
        borderColor: "rgba(255, 99, 132, 1)",
        backgroundColor: "rgba(255, 99, 132, 0.2)",
        fill: true,
        tension: 0.4,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: "top",
      },
    },
    scales: {
      x: {
        title: {
          display: true,
          text: "Fiyat Değişim ID",
        },
      },
      y: {
        title: {
          display: true,
          text: "Fiyat (TL)",
        },
        beginAtZero: true,
      },
    },
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-gray-800 text-2xl font-medium">Fiyat Trendleri</h2>
        <button
          onClick={() => setModalDurumu(true)}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors"
        >
          Ürün Seç
        </button>
      </div>

      {selectedProduct && (
        <div className="mb-4 p-3 bg-gray-50 rounded-lg">
          <p className="text-gray-700">
            Seçili Ürün:{" "}
            <span className="font-medium">{selectedProduct.urun_modeli}</span>
          </p>
        </div>
      )}

      <div className="relative">
        {!loading && <Line data={chartData} options={options} />}

        {error && (
          <div className="absolute inset-0 flex items-center justify-center backdrop-blur-sm bg-white/30">
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
              <strong className="font-bold">Hata!</strong>
              <span className="block sm:inline"> {error}</span>
            </div>
          </div>
        )}
      </div>

      <UrunSec
        modalDurumu={modalDurumu}
        setModalDurumu={setModalDurumu}
        setSelectedProduct={setSelectedProduct}
      />
    </div>
  );
};

export default FiyatTrendleri;
