import { Chart, registerables } from "chart.js";
import { useEffect, useRef, useState } from "react";
import * as Utils from "../lib/Utils";

Chart.register(...registerables);

export function Multi3() {
  const ref = useRef(null);
  const [isModalOpen, setModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  useEffect(() => {
    if (!ref.current) return;

    const DATA_COUNT = 12;
    const NUMBER_CFG = { count: DATA_COUNT, min: -100, max: 100 };
    const labels = Utils.months({ count: DATA_COUNT });

    const data = {
      labels: labels,
      datasets: [
        {
          label: "Stok Verisi",
          data: Utils.numbers(NUMBER_CFG),
          borderColor: "black",
          backgroundColor: "rgba(255, 100, 132, 0.5)",
          borderRadius: Number.MAX_VALUE,
        },
      ],
    };

    const config = {
      type: "bar",
      data: data,
      options: {
        responsive: true,
        onClick: (event, elements) => {
          if (elements.length === 0) {
            setModalOpen(true);
          }
        },
        scales: {
          y: {
            type: "linear",
            position: "left",
          },
          y1: {
            type: "linear",
            position: "right",
            grid: {
              drawOnChartArea: false,
            },
          },
        },
        plugins: {
          legend: {
            position: "top",
          },
          title: {
            display: true,
            text: "Ürün Stok Seviyesi",
          },
        },
      },
    };

    const chartInstance = new Chart(ref.current, config);

    return () => {
      chartInstance.destroy();
    };
  }, []);

  const handleProductSelect = (product) => {
    setSelectedProduct(product);
    setModalOpen(false);
    console.log("Seçilen ürün:", product);
  };

  return (
    <>
      <canvas ref={ref}></canvas>

      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 shadow-lg w-80 text-center">
            <h3 className="text-xl font-semibold mb-4">Ürün Seçimi</h3>
            <ul className="space-y-2">
              <li
                className="cursor-pointer p-2 hover:bg-gray-100 rounded transition"
                onClick={() => handleProductSelect("Ürün 1")}
              >
                Ürün 1
              </li>
              <li
                className="cursor-pointer p-2 hover:bg-gray-100 rounded transition"
                onClick={() => handleProductSelect("Ürün 2")}
              >
                Ürün 2
              </li>
              <li
                className="cursor-pointer p-2 hover:bg-gray-100 rounded transition"
                onClick={() => handleProductSelect("Ürün 3")}
              >
                Ürün 3
              </li>
            </ul>
            <button
              onClick={() => setModalOpen(false)}
              className="mt-6 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition"
            >
              Kapat
            </button>
          </div>
        </div>
      )}
    </>
  );
}
