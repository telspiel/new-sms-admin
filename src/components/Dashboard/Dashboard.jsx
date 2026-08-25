import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../../context/AuthContext";
import "./Dashboard.css";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";

import { Bar, Line } from "react-chartjs-2";
import Endpoints from "../../api/endpoint";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

function Dashboard() { 

  const { userData } = useContext(AuthContext);
  const [loading, setLoading] = useState(true);
  const [isSummaryLoading, setIsSummaryLoading] = useState(true);
  const [isHourlyLoading, setIsHourlyLoading] = useState(true);

    const [dashboardData, setDashboardData] = useState({
    totalSmsToday: 0,
    totalSmsMonth: 0,
    availableCredits: 0,
    });

  const getDashboard = async () => {
    setLoading(true);
    try {
      const payload = {
        username: userData.username,
      };

      const response = await Endpoints.post(
        "dashboard",
        payload,
        userData.authJwtToken
      );

      if (response.code === 1000) {
        setDashboardData(response.data);
      } else {
        console.log(response.message);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const [hourlyGrid, setHourlyGrid] = useState([]);

    const getHourlyReport = async () => {
      setIsHourlyLoading(true);
    try {
        const payload = {
        loggedInUserName: userData.username,
        };

        const response = await Endpoints.post(
        "getHourlyReport",
        payload
        );

        if (response.code === 14000) {
        setHourlyGrid(response.data.grid || []);
        } else {
        console.log(response.message || "Unable to fetch hourly report data");
        }
    } catch (error) {
        console.error(error);
    } finally {
    setIsHourlyLoading(false);
  }
    };

  const hourlyData = {
  labels: hourlyGrid.map((item) => `${item.summaryHour}:00`),

  datasets: [
    {
      label: "Total Delivered",
      data: hourlyGrid.map((item) =>
        Number(item.totalDelivered)
      ),
      borderColor: "#ffcc29",
      backgroundColor: "#ffcc29",
      fill: false,
      tension: 0.4,
      pointRadius: 4,
      pointHoverRadius: 6,
    },

    {
      label: "Total Submit",
      data: hourlyGrid.map((item) =>
        Number(item.totalSubmit)
      ),
      borderColor: "#5c6575",
      backgroundColor: "#5c6575",
      fill: false,
      tension: 0.4,
      pointRadius: 4,
      pointHoverRadius: 6,
    },
  ],
};

const hasHourlyData = hourlyGrid.some(
  (item) =>
    Number(item.totalDelivered) > 0 ||
    Number(item.totalSubmit) > 0
);


    const getTodayIST = () => {
    const date = new Date();

    const istDate = new Date(
    date.toLocaleString("en-US", {
      timeZone: "Asia/Kolkata",
    })
  );

    const year = istDate.getFullYear();
    const month = istDate.getMonth() + 1;
    const day = istDate.getDate();

    return `${year}-${month}-${day}`;
    };

    const [summaryReportData, setSummaryReportData] = useState(null);

    const getSummaryReport = async () => {
      setIsSummaryLoading(true);
    try {
        const today = getTodayIST();

        const payload = {
        loggedInUserName: userData.username,
        fromDate: today,
        toDate: today,
        };

        const response = await Endpoints.post(
        "summaryReport",
        payload,
        userData.authJwtToken
        );

        console.log("Summary Report:", response);

        if (response.code === 14000) {
        setSummaryReportData(response.data);
        } else {
        console.log(response.message || "Unable to fetch Summary Report");
        }
    } catch (error) {
        console.error("Summary Report Error:", error);
    } finally {
    setIsSummaryLoading(false);
  }
  };

const summary = summaryReportData?.grid?.[0];

const chartValues = [
  Number(summary?.totalRequest || 0),
  Number(summary?.totalRejected || 0),
  Number(summary?.totalSubmit || 0),
  Number(summary?.totalDelivered || 0),
  Number(summary?.totalFailed || 0),
  Number(summary?.totalAwaited || 0),
];

const hasSummaryData = chartValues.some(value => value > 0);

const summaryColors = [
  "#ffcc29", // Request
  "#7c5cff", // Rejected
  "#5c6575", // Submit
  "#44a67e", // Delivered
  "#ff6b6b", // Failed
  "#f8b84e", // Awaited
];

const summaryData = {
  labels: [
    "Request",
    "Rejected",
    "Submit",
    "Delivered",
    "Failed",
    "Awaited",
  ],

  datasets: [
    {
      data: chartValues,

      backgroundColor: (context) => {
        const chart = context.chart;
        const { ctx, chartArea } = chart;

        if (!chartArea) {
          return summaryColors[context.dataIndex];
        }

        const color = summaryColors[context.dataIndex];

        const gradient = ctx.createLinearGradient(
          0,
          chartArea.top,
          0,
          chartArea.bottom
        );

        gradient.addColorStop(0, color);

        gradient.addColorStop(0.35, `${color}CC`);

        gradient.addColorStop(0.7, `${color}55`);

        gradient.addColorStop(1, `${color}15`);

        return gradient;
      },

      borderRadius: 10,
      borderSkipped: false,
      maxBarThickness: 55,
    },
  ],
};

   useEffect(() => {
    if (userData) {
        getDashboard();
        getSummaryReport();
        getHourlyReport();
    }
}, [userData]);

//Animated number display
const AnimatedNumber = ({ value, duration = 1200 }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    // Parse to ensure numeric value
    const numericValue = typeof value === "number" ? value : Number(String(value).replace(/,/g, "")) || 0;
    
    let start = 0;
    const increment = numericValue / (duration / 16);

    if (numericValue <= 0 || isNaN(numericValue)) {
      setCount(0);
      return;
    }

    const timer = setInterval(() => {
      start += increment;

      if (start >= numericValue) {
        setCount(numericValue);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 16);

    return () => clearInterval(timer);
  }, [value, duration]);

  // Format to Indian system (en-IN) on render
  return <>{count.toLocaleString("en-IN")}</>;
};

const formatIndianNumber = (num) => {
  if (num === null || num === undefined || isNaN(Number(num))) return "0";
  return Number(num).toLocaleString("en-IN");
};

  return (
    <div className="dashboard">

      <div className="dashboard-header">
        <h1>Dashboard</h1>

        <p>
          Home / Dashboard · Overview of your messaging
          activity
        </p>
      </div>

      {/* Top Cards */}
      <div className="stats-grid">
        {loading ? (
          <>
            {/* Shimmer Card 1 */}
            <div className="stat-card skeleton-card">
              <div className="skeleton-icon"></div>
              <div className="skeleton-info">
                <div className="skeleton-line title"></div>
                <div className="skeleton-line value"></div>
                <div className="skeleton-line sub"></div>
              </div>
            </div>

            {/* Shimmer Card 2 */}
            <div className="stat-card skeleton-card">
              <div className="skeleton-icon"></div>
              <div className="skeleton-info">
                <div className="skeleton-line title"></div>
                <div className="skeleton-line value"></div>
                <div className="skeleton-line sub"></div>
              </div>
            </div>

            {/* Shimmer Card 3 (Yellow Variant) */}
            <div className="stat-card skeleton-card yellow-skeleton">
              <div className="skeleton-icon"></div>
              <div className="skeleton-info">
                <div className="skeleton-line title"></div>
                <div className="skeleton-line value"></div>
                <div className="skeleton-line sub"></div>
              </div>
            </div>
          </>
        ) : (
          <>
            {/* Card 1 */}
            <div className="stat-card">
              <div className="stat-icon yellow">
                <i className="fa-regular fa-clock"></i>
              </div>
              <div className="stat-info">
                <h4>SMS Count Today</h4>
                <h2>
                  <AnimatedNumber value={dashboardData.totalSmsToday ?? 0} />
                </h2>
                <span className="success-text">▲ live today</span>
              </div>
            </div>

            {/* Card 2 */}
            <div className="stat-card">
              <div className="stat-icon blue">
                <i className="fa-regular fa-calendar"></i>
              </div>
              <div className="stat-info">
                <h4>SMS Count Current Month</h4>
                <h2>
                  <AnimatedNumber value={dashboardData.totalSmsMonth ?? 0} />
                </h2>
                <span className="success-text">
                  {new Date().toLocaleDateString("en-US", {
                    month: "long",
                    year: "numeric",
                  })}
                </span>
              </div>
            </div>

            {/* Card 3 */}
            <div
              className={`stat-card available-credits ${
                Number(dashboardData.availableCredits ?? 0) === 0
                  ? "credits-zero"
                  : ""
              }`}
            >
              <div className="stat-icon yellow">
                <i className="fa-solid fa-wallet"></i>
              </div>
              <div className="stat-info">
                <h4>Available Credits</h4>
                <h2>
                  <AnimatedNumber value={dashboardData.availableCredits ?? 0} />
                </h2>
                <span className="success-text">Balance remaining</span>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Charts */}

      <div className="charts-grid">
  {/* Today Summary Report Card */}
  <div className="chart-card">
    <div className="chart-header">
      <h3>Today Summary Report</h3>
      <p>Today</p>
    </div>

    {isSummaryLoading ? (
      <div className="chart-loading-state">
        <div className="chart-spinner"></div>
        <span>Loading report...</span>
      </div>
    ) : hasSummaryData ? (
      <Bar
        data={summaryData}
        options={{
          responsive: true,
          plugins: {
            legend: {
              display: false,
            },
          },
          scales: {
            y: {
              beginAtZero: true,
            },
          },
        }}
      />
    ) : (
      <div className="no-chart-data">
        <div className="no-chart-icon">
          <i className="fa-solid fa-chart-line"></i>
        </div>
        <h3>No activity yet</h3>
        <p>
          No messages have been sent today.
          <br />
          Data will appear once traffic starts.
        </p>
      </div>
    )}
  </div>

  {/* Hourly Report Card */}
  <div className="chart-card">
    <div className="chart-header">
      <h3>Hourly Report</h3>
      <p>Last 24h</p>
    </div>

    {isHourlyLoading ? (
      <div className="chart-loading-state">
        <div className="chart-spinner"></div>
        <span>Loading report...</span>
      </div>
    ) : hasHourlyData ? (
      <Line
        data={hourlyData}
        options={{
          responsive: true,
          plugins: {
            legend: {
              position: "bottom",
              labels: {
                usePointStyle: true,
                pointStyle: "circle",
                padding: 20,
                boxWidth: 10,
                boxHeight: 10,
              },
            },
          },
          scales: {
            x: {
              grid: {
                display: false,
              },
            },
            y: {
              beginAtZero: true,
            },
          },
        }}
      />
    ) : (
      <div className="no-chart-data">
        <div className="no-chart-icon">
          <i className="fa-solid fa-chart-line"></i>
        </div>
        <h3>No activity yet</h3>
        <p>
          No messages have been sent today.
          <br />
          Data will appear once traffic starts.
        </p>
      </div>
    )}
  </div>
</div>

    </div>
  );
}

export default Dashboard;