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

    const [dashboardData, setDashboardData] = useState({
    totalSmsToday: 0,
    totalSmsMonth: 0,
    availableCredits: 0,
    });

    const getDashboard = async () => {
    try {
        const payload = {
        username: userData.username,
        };

        const response = await Endpoints.post(
        "dashboard",
        payload,
        userData.authJwtToken
        );

        console.log(response);

        if (response.code === 1000) {
        setDashboardData(response.data);
        } else {
        alert(response.message);
        }
    } catch (error) {
        console.error(error);
    }
    };

    const [hourlyGrid, setHourlyGrid] = useState([]);

    const getHourlyReport = async () => {
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
        alert(response.message);
        }
    } catch (error) {
        console.error(error);
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
        alert(response.message || "Unable to fetch Summary Report");
        }
    } catch (error) {
        console.error("Summary Report Error:", error);
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
      backgroundColor: [
        "#ffcc29",
        "#7c5cff",
        "#5c6575",
        "#44a67e",
        "#ff6b6b",
        "#f8b84e",
      ],
      borderRadius: 8,
      maxBarThickness: 40,
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
    let start = 0;

    const increment = value / (duration / 16);

    const timer = setInterval(() => {
      start += increment;

      if (start >= value) {
        setCount(value);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 16);

    return () => clearInterval(timer);
  }, [value, duration]);

  return <>{count.toLocaleString()}</>;
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
        <div className="stat-card">
          <div className="stat-icon yellow">
            <i className="fa-regular fa-clock"></i>
          </div>

          <div className="stat-info">
            <h4>SMS Count Today</h4>
            <h2>
            <AnimatedNumber value={dashboardData.totalSmsToday ?? 0} />
            </h2>
            <span className="success-text">
              ▲ live today
            </span>
          </div>
        </div>

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
              June 2026
            </span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon yellow">
            <i className="fa-solid fa-wallet"></i>
          </div>

          <div className="stat-info">
            <h4>Available Credits</h4>
            <h2>
            <AnimatedNumber value={dashboardData.availableCredits ?? 0} />
            </h2>
            <span className="success-text">
              Balance remaining
            </span>
          </div>
        </div>
      </div>

      {/* Charts */}

      <div className="charts-grid">

        <div className="chart-card">
          <div className="chart-header">
            <h3>Today Summary Report</h3>
            <p>Today</p>
          </div>
          {hasSummaryData ? (
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

        <div className="chart-card">
          <div className="chart-header">
            <h3>Hourly Report</h3>
            <p>Last 24h</p>
          </div>
        {hasHourlyData ? (
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