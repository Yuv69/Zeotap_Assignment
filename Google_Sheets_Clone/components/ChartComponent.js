import React from "react";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from "chart.js";

// ✅ Register scales and components properly
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const ChartComponent = ({ data }) => {
  const chartData = {
    labels: data.map((_, index) => `Row ${index + 1}`),
    datasets: [
      {
        label: "Spreadsheet Data",
        data: data.map(row => parseFloat(row[0]?.value) || 0),
        backgroundColor: "rgba(75, 192, 192, 0.6)",
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { position: "top" },
      title: { display: true, text: "Spreadsheet Chart" },
    },
  };

  return <Bar data={chartData} options={chartOptions} />;
};

export default ChartComponent;


