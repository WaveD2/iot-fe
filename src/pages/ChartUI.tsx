import {Line} from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import {useMemo} from "react";
import {useHelper} from "../hook/useHelper";
import {MessHeartT, MessTempT} from "./Chart";

// Đăng ký các thành phần ChartJS cần thiết
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

// Định nghĩa các màu chủ đạo cho biểu đồ
const CHART_COLORS = {
  heartRate: {
    border: "rgb(255, 99, 132)",
    background: "rgba(255, 99, 132, 0.2)",
  },
  spO2: {
    border: "rgb(53, 162, 235)",
    background: "rgba(53, 162, 235, 0.2)",
  },
  temperature: {
    border: "rgb(75, 192, 192)",
    background: "rgba(75, 192, 192, 0.2)",
  },
};

// Hàm tạo các tùy chọn cho biểu đồ với trục X là số lượng mẫu
const createChartOptions = (
  data: any[],
  title: string,
  yAxisLabel: string,
  yMin?: number,
  yMax?: number
) => {
  // Xác định số lượng mẫu và khoảng cách thích hợp cho trục X
  const sampleCount = data.length;
  const stepSize = Math.max(1, Math.floor(sampleCount / 10)); // Chia khoảng 10 điểm trên trục X

  return {
    responsive: true,
    maintainAspectRatio: false,
    animation: {
      duration: 800, // Thêm hiệu ứng animation cho biểu đồ
    },
    scales: {
      x: {
        type: "linear", // Sử dụng trục tuyến tính thay vì trục thời gian
        title: {
          display: true,
          text: "Số lượng mẫu đo",
          font: {
            size: 14,
            weight: "bold",
          },
        },
        grid: {
          display: true,
          color: "rgba(0, 0, 0, 0.05)",
        },
        ticks: {
          stepSize: stepSize,
          callback: function (value: number) {
            if (
              value % stepSize === 0 ||
              value === 0 ||
              value === sampleCount - 1
            ) {
              return value + 1; // +1 để hiển thị số thứ tự bắt đầu từ 1
            }
            return "";
          },
          font: {
            size: 10,
          },
          maxTicksLimit: 15,
        },
        min: 0,
        max: sampleCount - 1,
      },
      y: {
        beginAtZero: false,
        suggestedMin:
          yMin !== undefined
            ? yMin
            : Math.min(
                ...data.map((d: any) => d.temperature || d.heartRate || d.sp02)
              ) - 5,
        suggestedMax:
          yMax !== undefined
            ? yMax
            : Math.max(
                ...data.map((d: any) => d.temperature || d.heartRate || d.sp02)
              ) + 5,
        grid: {
          display: true,
          color: "rgba(0, 0, 0, 0.05)",
        },
        ticks: {
          font: {
            size: 10,
          },
          maxTicksLimit: 8,
        },
        title: {
          display: true,
          text: yAxisLabel,
          font: {
            size: 14,
            weight: "bold",
          },
        },
      },
    },
    plugins: {
      legend: {
        position: "top",
        labels: {
          boxWidth: 12,
          padding: 15,
          font: {
            size: 12,
          },
        },
      },
      title: {
        display: true,
        text: title,
        font: {
          size: 16,
          weight: "bold",
        },
        padding: {
          top: 10,
          bottom: 20,
        },
      },
      tooltip: {
        backgroundColor: "rgba(0, 0, 0, 0.7)",
        titleFont: {
          size: 12,
        },
        bodyFont: {
          size: 12,
        },
        padding: 10,
        cornerRadius: 4,
        callbacks: {
          title: (context: any) => {
            // Hiển thị số thứ tự mẫu và thời gian
            const index = context[0].dataIndex;
            const sample = `Mẫu #${index + 1}`;
            const time = new Date(context[0].raw.createdAt).toLocaleTimeString(
              [],
              {
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",
              }
            );
            const date = new Date(
              context[0].raw.createdAt
            ).toLocaleDateString();
            return `${sample} - ${date} ${time}`;
          },
          label: (context: any) => {
            const label = context.dataset.label;
            const value = context.raw.y.toFixed(1);
            return `${label}: ${value}`;
          },
        },
      },
    },
    elements: {
      line: {
        tension: 0.3, // Làm đường cong mượt hơn
        borderWidth: 2, // Đường viền mỏng hơn
      },
      point: {
        radius: (ctx: any) => {
          // Chỉ hiển thị một số điểm quan trọng khi có nhiều dữ liệu
          const dataLength = ctx.chart.data.datasets[0].data.length;
          if (dataLength > 50) {
            const index = ctx.dataIndex;
            // Hiển thị điểm đầu, cuối và các điểm chia khoảng
            if (
              index === 0 ||
              index === dataLength - 1 ||
              index % stepSize === 0
            ) {
              return 4;
            }
            // Hiển thị điểm min/max
            const dataArray = ctx.chart.data.datasets[
              ctx.datasetIndex
            ].data.map((p: any) => p.y);
            const maxValue = Math.max(...dataArray);
            const minValue = Math.min(...dataArray);
            if (ctx.raw.y === maxValue || ctx.raw.y === minValue) {
              return 4;
            }
            return 0;
          }
          return 3;
        },
        hoverRadius: 6,
        hitRadius: 10,
        borderWidth: 2,
      },
    },
    layout: {
      padding: {
        left: 10,
        right: 20,
        top: 20,
        bottom: 10,
      },
    },
  };
};

export interface HeartData {
  _id: string;
  heartRate: number;
  sp02: number;
  createdAt: string;
}

export interface TemperatureData {
  _id: string;
  temperature: number;
  createdAt: string;
}

const processDataForIndexedDisplay = (data: any[], key: string) => {
  return data.map((item, index) => {
    return {
      x: index, // Sử dụng index làm giá trị X
      y: item[key],
      createdAt: item.createdAt,
      toFixed: function (digits: number) {
        return this.y.toFixed(digits);
      },
    };
  });
};

const HeartRateChart = ({
  heartData,
  showHeartRate,
  showSpO2,
  stats,
}: {
  heartData: HeartData[];
  showHeartRate: boolean;
  showSpO2: boolean;
  stats: MessHeartT;
}) => {
  const chartHeight = 400;

  const processedHeartData = useMemo(
    () =>
      heartData.length > 100 ? useHelper.groupByMinute(heartData) : heartData,
    [heartData]
  );

  const heartChartData = useMemo(() => {
    const datasets = [];

    if (showHeartRate) {
      datasets.push({
        label: "Nhịp tim (BPM)",
        data: processDataForIndexedDisplay(processedHeartData, "heartRate"),
        borderColor: CHART_COLORS.heartRate.border,
        backgroundColor: CHART_COLORS.heartRate.background,
        fill: false,
        yAxisID: "y",
        pointBackgroundColor: CHART_COLORS.heartRate.border,
        borderWidth: 2,
        pointBorderColor: "#fff",
        pointHoverBackgroundColor: "#fff",
        pointHoverBorderColor: CHART_COLORS.heartRate.border,
        pointHoverBorderWidth: 2,
        order: 1, // Hiển thị đầu tiên
      });
    }

    if (showSpO2) {
      datasets.push({
        label: "SpO2 (%)",
        data: processDataForIndexedDisplay(processedHeartData, "sp02"),
        borderColor: CHART_COLORS.spO2.border,
        backgroundColor: CHART_COLORS.spO2.background,
        fill: false,
        yAxisID: "y",
        pointBackgroundColor: CHART_COLORS.spO2.border,
        borderWidth: 2,
        pointBorderColor: "#fff",
        pointHoverBackgroundColor: "#fff",
        pointHoverBorderColor: CHART_COLORS.spO2.border,
        pointHoverBorderWidth: 2,
        order: 2,
      });
    }

    return {datasets};
  }, [processedHeartData, showHeartRate, showSpO2]);

  // Tạo các tùy chọn biểu đồ
  const options = useMemo(() => {
    return createChartOptions(
      processedHeartData,
      "Biểu đồ theo dõi nhịp tim và SpO2",
      "Giá trị",
      showSpO2 ? 85 : 40, // SpO2 thường từ 85-100%, nhịp tim có thể từ 40-180
      showSpO2 ? 100 : 180
    );
  }, [processedHeartData, showSpO2]);

  return (
    <div
      style={{
        height: chartHeight,
        marginBottom: "2rem",
        boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
        borderRadius: "8px",
        padding: "10px",
      }}>
      <div className='flex items-center justify-around px-4'>
        <div className='w-full mx-auto text-xl'>
          <p>
            <span className='font-semibold underline'>Nhịp tim trung bình</span>{" "}
            :{" "}
            <span
              style={{
                color:
                  stats?.avgHeartRate > 85 ? "red" : "var(--color-blue-500)",
              }}>
              {stats?.avgHeartRate || 0}{" "}
            </span>
          </p>
          <p>
            {" "}
            <span className='font-semibold underline'>Thông báo </span> :
            <span
              style={{
                color:
                  stats?.avgHeartRate > 120 || stats?.avgSpO2 < 50
                    ? "red"
                    : "black",
              }}>
              {stats?.heartRateNoti || "có lỗi xảy ra"}
            </span>
          </p>
        </div>
        <div className='w-full mx-auto text-xl'>
          <p>
            <span className='font-semibold underline'>sp02 trung bình :</span>
            <span
              style={{
                color:
                  stats?.avgHeartRate < 90 ? "var(--color-blue-500)" : "red",
              }}>
              {stats?.avgSpO2 || 0}
            </span>
          </p>
          <p>
            <span className='font-semibold underline'>Thông báo : </span>
            <span style={{color: stats?.avgSpO2 > 99 ? "red" : "black"}}>
              {stats?.heartRateNoti || "có lỗi xảy ra"}
            </span>
          </p>
        </div>
      </div>
      {/* @ts-ignore */}
      <Line data={heartChartData} options={options} />
    </div>
  );
};

const TemperatureChart = ({
  temperatureData,
  stats,
}: {
  temperatureData: TemperatureData[];
  stats: MessTempT;
}) => {
  const processedTemperatureData = useMemo(
    () =>
      temperatureData.length > 100
        ? useHelper.groupByMinute(temperatureData)
        : temperatureData,
    [temperatureData]
  );

  // Xử lý dữ liệu nhiệt độ
  const temperatureChartData = useMemo(
    () => ({
      datasets: [
        {
          label: "Nhiệt độ (°C)",
          data: processDataForIndexedDisplay(
            processedTemperatureData,
            "temperature"
          ),
          borderColor: CHART_COLORS.temperature.border,
          backgroundColor: CHART_COLORS.temperature.background,
          fill: true,
          pointBackgroundColor: CHART_COLORS.temperature.border,
          borderWidth: 2,
          pointBorderColor: "#fff",
          pointHoverBackgroundColor: "#fff",
          pointHoverBorderColor: CHART_COLORS.temperature.border,
          pointHoverBorderWidth: 2,
        },
      ],
    }),
    [processedTemperatureData]
  );

  // Tạo các tùy chọn biểu đồ nhiệt độ
  const options = useMemo(() => {
    return createChartOptions(
      processedTemperatureData,
      "Biểu đồ theo dõi nhiệt độ",
      "Nhiệt độ (°C)",
      34.5, // Nhiệt độ thấp
      42 // Nhiệt độ cao
    );
  }, [processedTemperatureData]);

  return (
    <div
      style={{
        height: 400,
        marginBottom: "2rem",
        boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
        borderRadius: "8px",
        padding: "10px",
      }}>
      <div>
        <p>
          <span className='font-semibold underline'>Nhịp tim trung bình</span> :{" "}
          <span
            style={{
              color:
                stats?.temperature > 38 || stats?.temperature < 35
                  ? "red"
                  : "var(--color-blue-500)",
            }}>
            {stats?.temperature || 0}{" "}
          </span>
          <p>
            <span className='font-semibold underline'>Thông báo : </span>
            <span
              style={{
                color:
                  stats?.temperature > 38 || stats?.temperature < 35
                    ? "red"
                    : "black",
              }}>
              {stats?.noti || "có lỗi xảy ra"}
            </span>
          </p>
        </p>
      </div>
      {/* @ts-ignore */}
      <Line data={temperatureChartData} options={options} />
    </div>
  );
};

export {HeartRateChart, TemperatureChart};
