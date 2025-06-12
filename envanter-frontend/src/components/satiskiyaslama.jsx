import { useEffect, useState } from "react";
import { Bar } from "react-chartjs-2";
import "chart.js/auto";
import UrunSec from "./envanter-ekranlari/urunsecmodal";

export function SatisKiyasla() {
  const [modalDurumu, setModalDurumu] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState({
    urun_modeli: "Mont Modeli 1",
    indirimli: 0,
    normal: 0,
  });

  useEffect(() => {
    fetch(
      `http://localhost:3000/sales-data?category=Giyim&subcategory=DisGiyim&productType=Mont&productModel=MontModeli1`
    )
      .then((response) => {
        if (!response.ok) {
          throw new Error("API'den veri alınamadı");
        }
        return response.json();
      })
      .then((data) => {
        const randomIndirimli = Math.floor(Math.random() * 100);
        const randomNormal = Math.floor(Math.random() * 100);
        
        setSelectedProduct({
          urun_modeli: data.urun_modeli || "Mont Modeli 1",
          indirimli: randomIndirimli,
          normal: randomNormal,
        });
      })
      .catch((error) => {
        console.error("Veri alınamadı:", error);
      });
  }, []);

  // Chart.js için verileri hazırla
  const chartData = {
    labels: [selectedProduct.urun_modeli],
    datasets: [
      {
        label: "İndirimli Satış Adedi",
        data: [selectedProduct.indirimli],
        backgroundColor: "rgba(54, 162, 235, 0.7)",
      },
      {
        label: "Normal Satış Adedi",
        data: [selectedProduct.normal],
        backgroundColor: "rgba(255, 99, 132, 0.7)",
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
      x: { stacked: true },
      y: { stacked: true, beginAtZero: true },
    },
  };


  return (
    <div>
      <h2
        className="text-gray-800 text-2xl font-medium cursor-pointer mb-4"
        onClick={() => setModalDurumu(true)}
        style={{ cursor: "pointer" }}
      >
        İndirimli ve Normal Satış Adedi Karşılaştırması
      </h2>
      <Bar data={chartData} options={options} />
      <UrunSec
        modalDurumu={modalDurumu}
        setModalDurumu={setModalDurumu}
        setSelectedProduct={(urun) => {
          const formattedProduct = {
            urun_modeli: urun.urun_modeli,
            indirimli: urun.indirim_satis_adedi || 0,
            normal: urun.normal_satis_adedi || 0,
          };
          setSelectedProduct(formattedProduct);
        }}
      />
    </div>
  );
}

export default SatisKiyasla;
