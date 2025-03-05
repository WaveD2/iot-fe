import React from 'react';
import { Chart as ChartJS, CategoryScale, LinearScale, LineElement, PointElement, Title, Tooltip, Legend } from 'chart.js';
import { Line } from 'react-chartjs-2';
import { useNavigate } from 'react-router-dom';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend
);

// Types
interface HealthData {
  timestamp: number;
  value: number;
}

interface DashboardProps {
  email: string;
  heartRateData: HealthData[];
  bodyTempData: HealthData[];
}

const HealthChart: React.FC<{ 
  data: HealthData[]; 
  label: string; 
  color: string 
}> = React.memo(({ data, label, color }) => {
  const chartData = {
    labels: data.map((_, index) => `Point ${index + 1}`),
    datasets: [{
      label,
      data: data.map(item => item.value),
      borderColor: color,
      backgroundColor: `${color}40`,
      tension: 0.4
    }]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      }
    }
  };

  return (
    <div className="w-full h-48 p-2 bg-white rounded-lg shadow-md">
      <Line data={chartData} options={chartOptions} />
    </div>
  );
});

const HealthMonitorDashboard: React.FC<DashboardProps> = ({
  email,
  heartRateData,
  bodyTempData
}) => {
  const navigate = useNavigate();
  const averageHeartRate = 60;
  return (
    <div className="space-y-6">
      {/* User Email */}
      <div className="flex justify-between items-center">
        <span className="text-gray-600">{email}</span>
        <button className="px-4 py-2 bg-red-500 text-white cursor-pointer rounded hover:bg-red-600" onClick={() => {
          localStorage.removeItem("user");
          navigate('/auth')
        }}>
          Đăng xuất
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <h2 className="text-lg font-semibold text-gray-700">Nhịp tim trung bình</h2>
          <div className='w-full my-4 py-2 text-center rounded bg-blue-600'>
            <p className={`${averageHeartRate > 50 ? "text-red-400" : "text-gray-200"} text-3xl`}>{averageHeartRate}
            <span> bpm</span>
            </p> 
          </div>
          
          <HealthChart 
            data={heartRateData} 
            label="Heart Rate" 
            color="#3B82F6" 
          />
        </div>

        <div className="space-y-2">
          <h2 className="text-lg font-semibold text-gray-700">Nhiệt độ cơ thể trung bình</h2>
          <div className='w-full my-4 py-2 text-center rounded bg-blue-600'>
            <p className={`${averageHeartRate > 50 ? "text-red-400" : "text-gray-200"} text-3xl`}>{averageHeartRate}
            <span> °C</span>
            </p> 
          </div>
          <HealthChart 
            data={bodyTempData} 
            label="Body Temperature" 
            color="#10B981" 
          />
        </div>
      </div>
    </div>
  );
};

export default HealthMonitorDashboard;