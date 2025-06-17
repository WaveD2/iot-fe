import { useState, useEffect, useCallback } from "react";
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
import { useNavigate } from "react-router-dom";
import { listenToUserChannel } from "../websocket";
import {
  HeartData,
  HeartRateChart,
  TemperatureChart,
  TemperatureData,
  PPMData,
  PPMChart,
} from "./ChartUI";

ChartJS.register(
  CategoryScale,
  LinearScale,
  TimeScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
  LineController,
  Title
);

export type MessHeartT = {
  avgHeartRate: number;
  avgSpO2: number;
  heartRateNoti: string;
  spO2Noti: string;
};

export type MessPPMT = {
  ppmRate: number;
  ppmNoti: string;
};

export type MessTempT = {
  noti: string;
  temperature: number;
};

interface ApiResponse<T> {
  data: {
    data: T[];
    average: any;
  };
  type?: any;
}

const Dashboard = () => {
  const navigate = useNavigate();

  const [startDate, setStartDate] = useState<string>(
    new Date(new Date().setDate(new Date().getDate() - 7)).toISOString().split("T")[0]
  );
  const [endDate, setEndDate] = useState<string>(new Date().toISOString().split("T")[0]);

  const [heartData, setHeartData] = useState<HeartData[]>([]);
  const [statsHeart, setStatsHeart] = useState<MessHeartT>({
    avgHeartRate: 0,
    avgSpO2: 0,
    heartRateNoti: "Chưa có dữ liệu",
    spO2Noti: "Chưa có dữ liệu",
  });
  const [temperatureData, setTemperatureData] = useState<TemperatureData[]>([]);
  const [statsTemperature, setStatsTemperature] = useState<MessTempT>({
    noti: "Chưa có dữ liệu",
    temperature: 0,
  });
  const [ppmData, setPpmData] = useState<PPMData[]>([]);
  const [statsPpm, setStatsPpm] = useState<MessPPMT>({
    ppmNoti: "Chưa có dữ liệu",
    ppmRate: 0,
  });

  const [activeTab, setActiveTab] = useState<"heart" | "temperature" | "ppm">("heart");
  const [showHeartRate, setShowHeartRate] = useState(true);
  const [showSpO2, setShowSpO2] = useState(true);
  const [showSetting, setShowSetting] = useState(false);
  const [saving, setSaving] = useState(false);

  const [settings, setSettings] = useState({
    minTemperature: "",
    maxTemperature: "",
    maxHeartRate: "",
    minHeartRate: "",
    minSp02: "",
    maxSp02: "",
    minPPM: "",
    maxPPM: "",
    minHZ: "",
    maxHZ: "",
  });

  const accessToken = localStorage.getItem("accessToken")
    ? JSON.parse(localStorage.getItem("accessToken") || "")
    : "";
  const user = localStorage.getItem("user")
    ? JSON.parse(localStorage.getItem("user") || "")
    : "";

  // Fetch functions
  const fetchHeartData = useCallback(async () => {
    try {
      const response = await fetch(
        `https://smashing-valid-jawfish.ngrok-free.app/api/heart?startDate=${startDate}&endDate=${endDate}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
            "ngrok-skip-browser-warning": "69420",
          },
        }
      );
      const data: ApiResponse<HeartData> = await response.json();
      if (data?.type === "login") {
        navigate("/auth");
      }
      setHeartData(data?.data?.data);
      setStatsHeart(data?.data?.average);
    } catch (error) {
      console.log("error:: fetchHeartData", error);
    }
  }, [startDate, endDate, accessToken, navigate]);

  const fetchTemperatureData = useCallback(async () => {
    try {
      const response = await fetch(
        `https://smashing-valid-jawfish.ngrok-free.app/api/heart/temperature?startDate=${startDate}&endDate=${endDate}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
            "ngrok-skip-browser-warning": "69420",
          },
        }
      );
      const data: ApiResponse<TemperatureData> = await response.json();
      setTemperatureData(data?.data?.data);
      setStatsTemperature(data?.data?.average);
    } catch (error) {
      console.log("error:: fetchTemperatureData", error);
    }
  }, [startDate, endDate, accessToken]);

  const fetchPPMData = useCallback(async () => {
    try {
      const response = await fetch(
        `https://smashing-valid-jawfish.ngrok-free.app/api/heart/ppm?startDate=${startDate}&endDate=${endDate}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
            "ngrok-skip-browser-warning": "69420",
          },
        }
      );
      const data: ApiResponse<PPMData> = await response.json();
      setPpmData(data?.data?.data);
      setStatsPpm(data?.data?.average);
    } catch (error) {
      console.log("error:: fetchPPMData", error);
    }
  }, [startDate, endDate, accessToken]);

  const fetchSettings = async () => {
    const setting = localStorage.getItem("setting");
    if (setting) {
      setSettings(JSON.parse(setting));
      return;
    }
    try {
      const response = await fetch(
        "https://smashing-valid-jawfish.ngrok-free.app/api/setting",
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
            "ngrok-skip-browser-warning": "69420",
          },
        }
      );
      const data = await response.json();
      localStorage.setItem("setting", JSON.stringify(data));
      setSettings(data);
    } catch (error) {
      console.error("Failed to fetch settings", error);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const response = await fetch(
        "https://smashing-valid-jawfish.ngrok-free.app/api/setting",
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
            "ngrok-skip-browser-warning": "69420",
          },
          body: JSON.stringify(settings),
        }
      );
      const data = await response.json();
      setSettings(data.data);
      localStorage.setItem("setting", JSON.stringify(data.data));
      setShowSetting(false);
    } catch (error) {
      console.error("Failed to save settings", error);
      alert("Cập nhật thất bại!");
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setSettings((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handlerLogout = async () => {
    try {
      const response = await fetch(
        "https://smashing-valid-jawfish.ngrok-free.app/api/user/logout",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
            "ngrok-skip-browser-warning": "69420",
          },
        }
      );
      const data = await response.json();
      if (data.status !== 200) alert("Đăng xuất thất bại");
      navigate("/auth");
      localStorage.removeItem("accessToken");
      localStorage.removeItem("user");
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  useEffect(() => {
    if (!accessToken) return;
    if (activeTab === "heart") fetchHeartData();
    else if (activeTab === "temperature") fetchTemperatureData();
    else if (activeTab === "ppm") fetchPPMData();
  }, [activeTab, fetchHeartData, fetchTemperatureData, fetchPPMData, accessToken]);

  useEffect(() => {
    listenToUserChannel((data) => {
      if (data.type === "web" && data.title === "heartRate") {
        if (activeTab === "heart") fetchHeartData();
      } else if (data.type === "web" && data.title === "temperature") {
        if (activeTab === "temperature") fetchTemperatureData();
      } else if (data.type === "web" && data.title === "ppmRate") {
        if (activeTab === "ppm") fetchPPMData();
      }
    });
  }, [activeTab, fetchHeartData, fetchTemperatureData, fetchPPMData]);

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8 bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center space-x-4">
            <div className="flex items-center bg-gradient-to-r from-red-500 to-red-600 text-white px-4 py-2 rounded-lg shadow hover:shadow-md transition">
              <svg
                className="w-5 h-5 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
              <span className="font-medium">{user?.email}</span>
            </div>
          </div>
          <div className="flex space-x-4">
            <button
              className="flex items-center bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition disabled:bg-blue-300 disabled:cursor-not-allowed"
              onClick={() => {
                setShowSetting(true);
                fetchSettings();
              }}
            >
              <svg
                className="w-5 h-5 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37 1 .64 2.99-.232 3.35 0z"
                />
              </svg>
              Cài đặt
            </button>
            <button
              className="flex items-center bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition disabled:bg-red-300 disabled:cursor-not-allowed"
              onClick={handlerLogout}
            >
              <svg
                className="w-5 h-5 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                />
              </svg>
              Đăng xuất
            </button>
          </div>
        </div>

        {/* Settings Modal */}
        {showSetting && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
            <div className="bg-white p-8 rounded-2xl w-full max-w-2xl shadow-2xl">
              <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">
                Cài Đặt Ngưỡng An Toàn
              </h2>
              <div className="space-y-6">
                {/* Temperature */}
                <div className="h-full">
                  <h3 className="text-md font-semibold mb-3 text-gray-700">Nhiệt độ (°C)</h3>
                  <div className="flex space-x-3">
                    <div className="relative w-1/2">
                      <input
                        type="number"
                        name="minTemperature"
                        value={settings.minTemperature}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Min (ví dụ 36)"
                      />
                      <svg
                        className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M13 10V3L4 14h7v7l9-11h-7z"
                        />
                      </svg>
                    </div>
                    <div className="relative w-1/2">
                      <input
                        type="number"
                        name="maxTemperature"
                        value={settings.maxTemperature}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Max (ví dụ 39)"
                      />
                      <svg
                        className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M13 10V3L4 14h7v7l9-11h-7z"
                        />
                      </svg>
                    </div>
                  </div>
                </div>
                {/* Heart Rate */}
                <div>
                  <h3 className="text-md font-semibold mb-3 text-gray-700">Nhịp tim (bpm)</h3>
                  <div className="flex space-x-3">
                    <div className="relative w-1/2">
                      <input
                        type="number"
                        name="minHeartRate"
                        value={settings.minHeartRate}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Min (ví dụ 60)"
                      />
                      <svg
                        className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                        />
                      </svg>
                    </div>
                    <div className="relative w-1/2">
                      <input
                        type="number"
                        name="maxHeartRate"
                        value={settings.maxHeartRate}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Max (ví dụ 120)"
                      />
                      <svg
                        className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                        />
                      </svg>
                    </div>
                  </div>
                </div>
                {/* SpO2 */}
                <div>
                  <h3 className="text-md font-semibold mb-3 text-gray-700">SpO₂ (%)</h3>
                  <div className="flex space-x-3">
                    <div className="relative w-1/2">
                      <input
                        type="number"
                        name="minSp02"
                        value={settings.minSp02}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Min (ví dụ 94)"
                      />
                      <svg
                        className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M13 10V3L4 14h7v7l9-11h-7z"
                        />
                      </svg>
                    </div>
                    <div className="relative w-1/2">
                      <input
                        type="number"
                        name="maxSp02"
                        value={settings.maxSp02}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Max (ví dụ 100)"
                      />
                      <svg
                        className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M13 10V3L4 14h7v7l9-11h-7z"
                        />
                      </svg>
                    </div>
                  </div>
                </div>
                {/* PPM */}
                <div>
                  <h3 className="text-md font-semibold mb-3 text-gray-700">Chất lượng khí (ppm)</h3>
                  <div className="flex space-x-3">
                    <div className="relative w-1/2">
                      <input
                        type="number"
                        name="minPPM"
                        value={settings.minPPM}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Min (ví dụ 400)"
                      />
                      <svg
                        className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M13 10V3L4 14h7v7l9-11h-7z"
                        />
                      </svg>
                    </div>
                    <div className="relative w-1/2">
                      <input
                        type="number"
                        name="maxPPM"
                        value={settings.maxPPM}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Max (ví dụ 1000)"
                      />
                      <svg
                        className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M13 10V3L4 14h7v7l9-11h-7z"
                        />
                      </svg>
                    </div>
                  </div>
                </div>
                {/* Hz */}
                <div>
                  <h3 className="text-md font-semibold mb-3 text-gray-700">Âm thanh (hz)</h3>
                  <div className="flex space-x-3">
                    <div className="relative w-1/2">
                      <input
                        type="number"
                        name="minHZ"
                        value={settings.minHZ}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Min (ví dụ 20)"
                      />
                      <svg
                        className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M13 10V3L4 14h7v7l9-11h-7z"
                        />
                      </svg>
                    </div>
                    <div className="relative w-1/2">
                      <input
                        type="number"
                        name="maxHZ"
                        value={settings.maxHZ}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Max (ví dụ 20000)"
                      />
                      <svg
                        className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M13 10V3L4 14h7v7l9-11h-7z"
                        />
                      </svg>
                    </div>
                  </div>
                </div>
                {/* Actions */}
                <div className="flex justify-end space-x-4 mt-8">
                  <button
                    className="px-5 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition"
                    onClick={() => setShowSetting(false)}
                    disabled={saving}
                  >
                    Hủy
                  </button>
                  <button
                    className="px-5 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-green-300 disabled:cursor-not-allowed transition"
                    onClick={handleSave}
                    disabled={saving}
                  >
                    {saving ? (
                      <span className="flex items-center">
                        <svg
                          className="animate-spin h-5 w-5 mr-2 text-white"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                            fill="none"
                          />
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8v8h8a8 8 0 01-8 8 8 8 0 01-8-8z"
                          />
                        </svg>
                        Đang lưu...
                      </span>
                    ) : (
                      "Lưu"
                    )}
                  </button>
                </div>
              </div>
              <button
                onClick={() => setShowSetting(false)}
                className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 transition"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex border-b border-gray-200">
            <button
              className={`px-4 py-2 font-medium text-sm transition-colors ${
                activeTab === "heart"
                  ? "border-b-2 border-indigo-500 text-indigo-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
              onClick={() => setActiveTab("heart")}
            >
              Nhịp tim & SpO2
            </button>
            <button
              className={`px-4 py-2 font-medium text-sm transition-colors ${
                activeTab === "temperature"
                  ? "border-b-2 border-indigo-500 text-indigo-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
              onClick={() => setActiveTab("temperature")}
            >
              Nhiệt độ
            </button>
            <button
              className={`px-4 py-2 font-medium text-sm transition-colors ${
                activeTab === "ppm"
                  ? "border-b-2 border-indigo-500 text-indigo-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
              onClick={() => setActiveTab("ppm")}
            >
              Chất lượng khí (PPM)
            </button>
          </div>

          {/* Date Range Selector */}
          <div className="mt-6 flex space-x-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700">Ngày bắt đầu</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700">Ngày kết thúc</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Tab Content */}
          <div className="mt-6">
            {activeTab === "heart" && (
              <div>
                <div className="flex space-x-2 mb-4">
                  <button
                    onClick={() => setShowHeartRate(!showHeartRate)}
                    className={`px-3 py-1 rounded-md text-sm font-medium ${
                      showHeartRate ? "bg-indigo-500 text-white" : "bg-gray-200 text-gray-700"
                    } hover:bg-indigo-600 hover:text-white transition`}
                  >
                    Nhịp tim
                  </button>
                  <button
                    onClick={() => setShowSpO2(!showSpO2)}
                    className={`px-3 py-1 rounded-md text-sm font-medium ${
                      showSpO2 ? "bg-indigo-500 text-white" : "bg-gray-200 text-gray-700"
                    } hover:bg-indigo-600 hover:text-white transition`}
                  >
                    SpO2
                  </button>
                </div>
                <div className="h-full">
                  <HeartRateChart
                    stats={statsHeart}
                    heartData={heartData}
                    showHeartRate={showHeartRate}
                    showSpO2={showSpO2}
                  />
                </div>
              </div>
            )}
            {activeTab === "temperature" && (
              <div className="h-full">
                <TemperatureChart temperatureData={temperatureData} stats={statsTemperature} />
              </div>
            )}
            {activeTab === "ppm" && (
              <div className="h-full">
                <PPMChart ppmData={ppmData} stats={statsPpm} />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;