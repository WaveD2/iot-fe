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
    if(!accessToken) return;
    fetchTemperatureData();
  }, [fetchTemperatureData]);

  useEffect(() => {
    if(!accessToken) return;
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



  const [showSetting, setShowSetting] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState({
    minTemperature: '',
    maxTemperature: '',
    maxHeartRate: '',
    minHeartRate: '',
    minSp02: '',
    maxSp02: '',
  });

  const fetchSettings = async () => {
    const setting = localStorage.getItem("setting")
    if(setting){
      setSettings(JSON.parse(setting))
      return;
    }
    setLoading(true);
     try {
      const response = await fetch("https://smashing-valid-jawfish.ngrok-free.app/api/setting", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${accessToken}`,
          "ngrok-skip-browser-warning": "69420",
        },
     });
      const data = await response.json();
      console.log("datadatadata setting::", data);
      localStorage.setItem("setting", JSON.stringify(data))
      setSettings(data)
      setShowSetting(true);
    } catch (error) {
      console.error('Failed to fetch settings', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const response = await fetch("https://smashing-valid-jawfish.ngrok-free.app/api/setting", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${accessToken}`,
          "ngrok-skip-browser-warning": "69420",
        },
        body: JSON.stringify(settings),
     });
      const data = await response.json();
      console.log("data::",data);
      
      setSettings(data.data)
      localStorage.setItem("setting", JSON.stringify(data.data))
      setShowSetting(false);
    } catch (error) {
      console.error('Failed to save settings', error);
      alert('Cập nhật thất bại!');
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setSettings(prev => ({
      ...prev,
      [name]: value
    }));
  };


  return (
    <div className='h-full p-8'>
      <div className='flex justify-between items-center'>
      <div className="flex items-center gap-4">
      <div className="ml-5 w-max p-4 bg-red-400 rounded-md">
        <span className="text-white font-semibold">{user?.email}</span>
      </div>

      <button
        className="px-4 py-2 bg-blue-500 text-white cursor-pointer rounded hover:bg-blue-600"
        onClick={() => { setShowSetting(true); fetchSettings(); }}>
        Cài đặt
      </button>

      <button
        className="px-4 py-2 bg-red-500 text-white cursor-pointer rounded hover:bg-red-600"
        onClick={handlerLogout}>
        Đăng xuất
      </button>

      {/* Popup Settings */}
      {showSetting && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-[90%] max-w-md relative">
            <h2 className="text-xl font-bold mb-4 text-center">Cài đặt ngưỡng an toàn</h2>

            {loading ? (
              <div className="text-center py-10">Đang tải dữ liệu...</div>
            ) : (
              <div className="flex flex-col gap-4">
                {/* Temperature */}
                <div>
                  <h3 className="text-md font-semibold mb-2">Nhiệt độ (°C)</h3>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      name="minTemperature"
                      value={settings.minTemperature}
                      onChange={handleChange}
                      className="w-1/2 border rounded p-2"
                      placeholder="Min (ví dụ 36)"
                    />
                    <input
                      type="number"
                      name="maxTemperature"
                      value={settings.maxTemperature}
                      onChange={handleChange}
                      className="w-1/2 border rounded p-2"
                      placeholder="Max (ví dụ 39)"
                    />
                  </div>
                </div>

                {/* Heart Rate */}
                <div>
                  <h3 className="text-md font-semibold mb-2">Nhịp tim (bpm)</h3>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      name="minHeart"
                      value={settings.minHeartRate}
                      onChange={handleChange}
                      className="w-1/2 border rounded p-2"
                      placeholder="Min (ví dụ 60)"
                    />
                    <input
                      type="number"
                      name="maxHeart"
                      value={settings.maxHeartRate}
                      onChange={handleChange}
                      className="w-1/2 border rounded p-2"
                      placeholder="Max (ví dụ 120)"
                    />
                  </div>
                </div>

                {/* SpO2 */}
                <div>
                  <h3 className="text-md font-semibold mb-2">SpO₂ (%)</h3>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      name="minSp02"
                      value={settings.minSp02}
                      onChange={handleChange}
                      className="w-1/2 border rounded p-2"
                      placeholder="Min (ví dụ 94)"
                    />
                    <input
                      type="number"
                      name="maxSp02"
                      value={settings.maxSp02}
                      onChange={handleChange}
                      className="w-1/2 border rounded p-2"
                      placeholder="Max (ví dụ 100)"
                    />
                  </div>
                </div>

                {/* Actions */}
                <div className="flex justify-end gap-3 mt-6">
                  <button
                    className="px-4 py-2 bg-gray-400 text-white rounded hover:bg-gray-500"
                    onClick={() => setShowSetting(false)}
                    disabled={saving}
                  >
                    Hủy
                  </button>
                  <button
                    className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                    onClick={handleSave}
                    disabled={saving}
                  >
                    {saving ? 'Đang lưu...' : 'Lưu'}
                  </button>
                </div>
              </div>
            )}

            <button
              onClick={() => setShowSetting(false)}
              className="absolute top-2 right-2 text-gray-500 hover:text-black"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
        
      </div>
      <div className='max-w-7xl h-full mx-auto space-y-44'>
        <div className='w-full p-4 mb-6'>
          <div className='bg-white p-4 mb-4 rounded-lg shadow-sm'>
          <h2 className='text-xl font-semibold underline text-indigo-500 my-3'>Theo dõi nhịp tim & SpO2</h2>
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

        <div className='w-full h-full p-4 mt-36'>
          <div className='bg-white p-4 mb-4 rounded-lg shadow-sm'>
          <h2 className='text-xl font-semibold mt-4 mb-2 block underline text-indigo-500'>Theo dõi nhiệt độ</h2>
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
