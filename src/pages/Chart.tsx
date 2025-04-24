import {useState, useEffect,  useCallback} from "react";
import {
  Chart as ChartJS,
  LineController,
  LineElement,
  PointElement,
  LinearScale,
  Title,
  CategoryScale,
  TimeScale,
  Tooltip,
  Legend,
} from "chart.js";
import "chartjs-adapter-date-fns";
import {useNavigate} from "react-router-dom";
import {listenToUserChannel} from "../websocket";
import { HeartData, HeartRateChart, TemperatureChart, TemperatureData } from "./ChartUI";

ChartJS.register(CategoryScale, LinearScale, TimeScale, PointElement, LineElement, Tooltip, Legend);

ChartJS.register(
  LineController,
  LineElement,
  PointElement,
  LinearScale,
  Title,
  CategoryScale,
  TimeScale,
  Tooltip,
  Legend
);

export type MessHeartT = {
  avgHeartRate: number
  avgSpO2: number
  heartRateNoti: string
  spO2Noti: string
}

export type MessTempT = {
  noti: string
  temperature: number
}


interface ApiResponse<T> {
  data: {
    data: T[];
    average: any;
  };
  type?:any
}

const Dashboard = () => {
  const navigate = useNavigate();

  const [startDate, setStartDate] = useState<string>(
    new Date(new Date().setDate(new Date().getDate() - 7))
      .toISOString()
      .split("T")[0]
  );
  const [endDate, setEndDate] = useState<string>(
    new Date().toISOString().split("T")[0]
  );
  const [startDateHeart, setStartDateHeart] = useState<string>(
    new Date(new Date().setDate(new Date().getDate() - 7))
      .toISOString()
      .split("T")[0]
  );
  const [endDateHeart, setEndDateHeart] = useState<string>(
    new Date().toISOString().split("T")[0]
  );

  const [heartData, setHeartData] = useState<HeartData[]>([]);
  const [statsHeart, setStatsHeart] = useState<MessHeartT>({
      avgHeartRate: 0,
      avgSpO2: 0,
      heartRateNoti: "Chưa có dự liệu",
      spO2Noti: "Chưa có dự liệu",
  });
  const [temperatureData, setTemperatureData] = useState<TemperatureData[]>([]);

  const [statsTemperature, setStatsTemperature] = useState<MessTempT>({
    noti: "Chưa có dự liệu",
    temperature: 0
  });
  const [showHeartRate, setShowHeartRate] = useState(true);
  const [showSpO2, setShowSpO2] = useState(true);

  const accessToken = localStorage.getItem("accessToken")
    ? JSON.parse(localStorage.getItem("accessToken") || "")
    : "";
  const user = localStorage.getItem("user")
    ? JSON.parse(localStorage.getItem("user") || "")
    : "";

  const fetchHeartData = useCallback(async () => {
    try {
      const response = await fetch(
        `https://smashing-valid-jawfish.ngrok-free.app/api/heart?startDate=${startDateHeart}&endDate=${endDateHeart}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${accessToken}`,
            "ngrok-skip-browser-warning": "69420",
          },
        }
      );

      const data: ApiResponse<HeartData> = await response.json();
      if (data?.type === 'login') {
        navigate("/auth");
      }
      setHeartData(data?.data?.data);
      setStatsHeart(data?.data?.average);
    }catch(error) {
      console.log("error::", error);
    }
    
  }, [startDateHeart, endDateHeart]);

  const fetchTemperatureData = useCallback(async () => {
    try {
      const response = await fetch(
        `https://smashing-valid-jawfish.ngrok-free.app/api/heart/temperature?startDate=${startDate}&endDate=${endDate}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${accessToken}`,
            "ngrok-skip-browser-warning": "69420",
          },
        }
      );

      const data: ApiResponse<TemperatureData> = await response.json();
      setTemperatureData(data?.data?.data);
      setStatsTemperature(data?.data?.average);
    }catch(error) {
      console.log("error:: fetchTemperatureData", error);
    }
  }, [startDate, endDate]);

  useEffect(() => {
    fetchTemperatureData();
  }, [fetchTemperatureData]);

  useEffect(() => {
    fetchHeartData();
  }, [fetchHeartData]);

  useEffect(() => {
    listenToUserChannel((data) => {
        if(data.type === "web" && data.title === "heartRate") {
            fetchHeartData();
        }else if(data.type === "web" && data.title === "temperature") {
            fetchTemperatureData();
        }
    });
  }, []);


  const handlerLogout = async () => {
   const response = await fetch("https://smashing-valid-jawfish.ngrok-free.app/api/user/logout", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${accessToken}`,
        "ngrok-skip-browser-warning": "69420",
      },
   });
    const data = await response.json();
    if (data.status !== 200) alert("Đăng xuất thất bại");
    navigate("/auth");
    localStorage.removeItem("accessToken");
    localStorage.removeItem("user");
  };

  return (
    <div className='h-full p-8'>
      <div className='flex justify-between items-center mb-3'>
        <div className="ml-5 w-max p-4 bg-red-400 rounded-md">
          <span className='text-white font-semibold'>{user?.email}</span>
        </div>
        <button
          className='px-4 py-2 bg-red-500 text-white cursor-pointer rounded hover:bg-red-600'
          onClick={handlerLogout}>
          Đăng xuất
        </button>
      </div>
      <div className='max-w-7xl h-full mx-auto space-y-44'>
        <div className='w-full p-4'>
          <div className='bg-white p-4 mb-4 rounded-lg shadow-sm'>
            <div className='flex gap-4 items-center'>
              <div className='flex-1'>
                <label className='block text-sm font-medium text-gray-700'>
                  Ngày bắt đầu
                </label>
                <input
                  type='date'
                  value={startDateHeart}
                  onChange={(e) => setStartDateHeart(e.target.value)}
                  className='mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500'
                />
              </div>
              <div className='flex-1'>
                <label className='block text-sm font-medium text-gray-700'>
                  Ngày kết thúc
                </label>
                <input
                  type='date'
                  value={endDateHeart}
                  onChange={(e) => setEndDateHeart(e.target.value)}
                  className='mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500'
                />
              </div>
            </div>
          </div>
          <div className='mb-4 flex justify-between items-center'>
            <h2 className='text-xl font-semibold'>Theo dõi nhịp tim & SpO2</h2>
            <div className='flex gap-2'>
              <button
                onClick={() => setShowHeartRate(!showHeartRate)}
                className={`px-3 py-1 rounded ${
                  showHeartRate ? "bg-blue-500 text-white" : "bg-gray-200"
                }`}>
                Nhịp tim
              </button>
              <button
                onClick={() => setShowSpO2(!showSpO2)}
                className={`px-3 py-1 rounded ${
                  showSpO2 ? "bg-blue-500 text-white" : "bg-gray-200"
                }`}>
                SpO2
              </button>
            </div>
          </div>
              <div className='relative h-64'>
                <HeartRateChart
                  stats={statsHeart}
                  heartData={heartData}
                  showHeartRate={showHeartRate}
                  showSpO2={showSpO2}
                />
            </div>
        </div>

        <div className='w-full p-4'>
          <div className='bg-white p-4 mb-4 rounded-lg shadow-sm'>
            <div className='flex gap-4 items-center'>
              <div className='flex-1'>
                <label className='block text-sm font-medium text-gray-700'>
                  Ngày bắt đầu
                </label>
                <input
                  type='date'
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className='mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500'
                />
              </div>
              <div className='flex-1'>
                <label className='block text-sm font-medium text-gray-700'>
                  Ngày kết thúc
                </label>
                <input
                  type='date'
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className='mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500'
                />
              </div>
            </div>
          </div>
 
            <div className='relative h-64'>
              <TemperatureChart temperatureData={temperatureData} stats={statsTemperature} />  
            </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
