import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Bar, Doughnut, Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const defaultOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { position: 'bottom' },
  },
};

export function BarChart({ data, options = {}, height = 280 }) {
  return (
    <div style={{ height }}>
      <Bar data={data} options={{ ...defaultOptions, ...options }} />
    </div>
  );
}

export function DoughnutChart({ data, options = {}, height = 280 }) {
  return (
    <div style={{ height }}>
      <Doughnut data={data} options={{ ...defaultOptions, ...options }} />
    </div>
  );
}

export function LineChart({ data, options = {}, height = 280 }) {
  return (
    <div style={{ height }}>
      <Line data={data} options={{ ...defaultOptions, ...options }} />
    </div>
  );
}
