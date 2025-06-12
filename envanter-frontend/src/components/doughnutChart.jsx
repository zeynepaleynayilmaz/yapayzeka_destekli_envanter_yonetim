import React, { useEffect, useState } from "react";
import { Doughnut } from "react-chartjs-2";

const DoughnutChart = () => {
  const [chartData, setChartData] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(
          "http://localhost:3000/payment-methods-percentage"
        );
        const data = await response.json();

        const labels = data.map((item) => item.paymentMethod);
        const percentages = data.map((item) => item.percentage);

        setChartData({
          labels,
          datasets: [
            {
              label: "Ödeme Yöntemi %",
              data: percentages,
              backgroundColor: ["#FF6384", "#36A2EB", "#FFCE56", "#4BC0C0"],
              hoverOffset: 4,
            },
          ],
        });
      } catch (error) {
        console.error("Error fetching chart data:", error);
      }
    };

    fetchData();
  }, []);

  if (!chartData) return <div>Loading...</div>;

  return (
    <div style={{ width: "50%", margin: "auto" }}>
      <h2
        className="text-gray-800 text-2xl font-medium cursor-pointer mb-4"
        style={{ cursor: "pointer" }}
      >
        Ödeme Yöntemi Dağılımı
      </h2>
      <Doughnut
        data={chartData}
        options={{
          animation: {
            duration: 1500,
            easing: "easeInOutBounce",
          },
        }}
      />
    </div>
  );
};

export default DoughnutChart;
