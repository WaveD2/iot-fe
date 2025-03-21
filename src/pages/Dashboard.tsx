import React, { useEffect } from 'react';
import HealthMonitorDashboard from '../components/HealthMonitorDashboard';
import { listenToUserChannel } from '../websocket';

export const DashboardPage: React.FC = () => {
  // Simulated user data
  const user = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user') || "") : "";
  const accessToken = localStorage.getItem('accessToken') ?JSON.parse(localStorage.getItem('accessToken') || "") : "";
  
  
  useEffect(() => {
  
    const getHeath = async () => {
      const response = await fetch(`${"https://iot-waved.vercel.app"}/api/heart?days=2`, {
         method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${accessToken}`,
        },
      });

      console.log("response:::", response)
    }
    getHeath()
    listenToUserChannel((data) => {
           console.log("data by socket::", data);
    });
  }, []);

  const userData = {
    heartRateData: [
      { timestamp: 1614556800000, value: 65 },
      { timestamp: 1614643200000, value: 70 },
      { timestamp: 1614729600000, value: 72 },
      { timestamp: 1614816000000, value: 68 },
      { timestamp: 1614902400000, value: 75 }
    ],
    bodyTempData: [
      { timestamp: 1614556800000, value: 36.5 },
      { timestamp: 1614643200000, value: 36.7 },
      { timestamp: 1614729600000, value: 36.6 },
      { timestamp: 1614816000000, value: 36.8 },
      { timestamp: 1614902400000, value: 36.9 }
    ]
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="container mx-auto px-4 py-8">
        <HealthMonitorDashboard 
          email={user?.email || "test@gmail.com"}
          heartRateData={userData.heartRateData}
          bodyTempData={userData.bodyTempData}
        />
      </div>
    </div>
  );
};
