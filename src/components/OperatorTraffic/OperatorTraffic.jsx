import React, { useState, useEffect, useContext } from "react";
import "./OperatorTraffic.css";
import Endpoints from "../../api/endpoint";
import { AuthContext } from "../../context/AuthContext";


const OperatorTraffic = () => {
  const [activeTab, setActiveTab] = useState("live");
  const { userData } = useContext(AuthContext);

  const today = new Date().toISOString().split("T")[0];

  const [fromDate, setFromDate] = useState(today);
  const [toDate, setToDate] = useState(today);

  const [liveTraffic, setLiveTraffic] = useState([]);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [secondsAgo, setSecondsAgo] = useState(0);

  const [historyTraffic, setHistoryTraffic] = useState([]);

  const [selectedConnect, setSelectedConnect] = useState("All");

  const [loading, setLoading] = useState(false);

  const connectNames = [
  "All",
  ...new Set(
    historyTraffic.map((item) => item.connectName)
  ),
];

  //Live Traffic
 const getCurrentTelcoSummary = async () => {
  setLoading(true);

  try {
    const response = await fetch(
      Endpoints.get("currentTelcoSummary"),
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: userData?.authJwtToken || "",
        },
      }
    );

    const text = await response.text();

    console.log("Raw Response:", text);

    try {
      const json = JSON.parse(text);

      if (json.code === 14000) {
        setLiveTraffic(json.data || []);
      } else {
        setLiveTraffic([]);
      }
    } catch {
      const matches = [
        ...text.matchAll(
          /summaryDate=(.*?), totalSubmit=(.*?), totalDelivered=(.*?), totalFailed=(.*?), totalAwaited=(.*?), smscId=(.*?)\]/g
        ),
      ];

      const parsedData = matches.map((match) => ({
        summaryDate: match[1].trim(),
        totalSubmit: match[2].trim(),
        totalDelivered: match[3].trim(),
        totalFailed: match[4].trim(),
        totalAwaited: match[5].trim(),
        smscId: match[6].trim(),
      }));

      setLiveTraffic(parsedData);
    }

    // Reset timer whenever API finishes successfully
    setSecondsAgo(0);

  } catch (error) {
    console.error(error);
    setLiveTraffic([]);
  } finally {
    setLoading(false);
  }
};

useEffect(() => {
  if (activeTab !== "live") return;

  // Initial API call
  getCurrentTelcoSummary();

  // Refresh every 4 seconds only while Live Traffic is active
  const interval = setInterval(() => {
    getCurrentTelcoSummary();
  }, 4000);

  return () => clearInterval(interval);
}, [activeTab]);

useEffect(() => {
  const timer = setInterval(() => {
    setSecondsAgo((prev) => prev + 1);
  }, 1000);

  return () => clearInterval(timer);
}, []);

  //Traffic History
const getConnectSummary = async () => {
   setLoading(true);
   try {
    const payload = {
      loggedInUserName: userData.username,
      fromDate,
      toDate,
    };

    const response = await Endpoints.post(
      "connectSummary",
      payload,
      userData.authJwtToken
    );

    console.log("Connect Summary :", response);

    if (response.code === 14000) {
      setHistoryTraffic(response.data.grid || []);
    } else {
      alert(response.message);
    }
  } catch (error) {
    console.error(error);
  } finally {
    setLoading(false);
  }
};

//Total count of live traffic
const totalsLive = liveTraffic.reduce(
  (acc, item) => {
    acc.submit += Number(item.totalSubmit || 0);
    acc.delivered += Number(item.totalDelivered || 0);
    acc.failed += Number(item.totalFailed || 0);
    acc.awaited += Number(item.totalAwaited || 0);

    return acc;
  },
  {
    submit: 0,
    delivered: 0,
    failed: 0,
    awaited: 0,
  }
);

// Total count of traffic history
const totals =
  historyTraffic.length > 0
    ? historyTraffic.reduce(
        (acc, row) => {
          acc.submit += Number(row.totalSubmit || 0);
          acc.delivered += Number(row.totalDelivered || 0);
          acc.failed += Number(row.totalFailed || 0);
          acc.awaited += Number(row.totalAwaited || 0);

          return acc;
        },
        {
          submit: 0,
          delivered: 0,
          failed: 0,
          awaited: 0,
        }
      )
    : null;

  return (
    <div className="operator-traffic">
    {/* {loading && (
        <div className="page-loader">

        <div className="loader-content">

            <div className="spinner"></div>

            <p>Loading traffic history...</p>

        </div>

        </div>
    )} */}

      {/* Heading */}

      <div className="operator-traffic-header">
        <h1>Operator Traffic</h1>

        <p>
          Home / Operator Traffic · Submit, delivery &
          failure counts by operator connect
        </p>
      </div>

      {/* Tabs */}

      <div className="traffic-tabs">

        <button
            className={`tab ${
            activeTab === "live" ? "active" : ""
            }`}
            onClick={() => setActiveTab("live")}
        >
            Live Traffic
        </button>

        <button
            className={`tab ${
            activeTab === "history" ? "active" : ""
            }`}
            onClick={() => setActiveTab("history")}
        >
            Traffic History
        </button>

        </div>

      {/* Summary Cards */}
    {activeTab === "live" && (
      <>
      <div className="traffic-cards">
        <div className="traffic-card">
          <div className="card-icon yellow">
            <i className="fa-regular fa-paper-plane"></i>
          </div>
          <div>
            <span>Total Submit</span>
            <h2>
            {totalsLive.submit
                ? totalsLive.submit.toLocaleString()
                : "-"}
            </h2>
          </div>

        </div>

        <div className="traffic-card">

          <div className="card-icon green">
            <i className="fa-solid fa-check"></i>
          </div>

          <div>
            <span>Total Delivered</span>
            <h2>
            {totalsLive.delivered
                ? totalsLive.delivered.toLocaleString()
                : "-"}
            </h2>
          </div>

        </div>

        <div className="traffic-card">

          <div className="card-icon red">
            <i className="fa-solid fa-xmark"></i>
          </div>

          <div>
            <span>Total Failed</span>
            <h2>
            {totalsLive.failed
                ? totalsLive.failed.toLocaleString()
                : "-"}
            </h2>
          </div>

        </div>

        <div className="traffic-card">

          <div className="card-icon blue">
            <i className="fa-regular fa-clock"></i>
          </div>

          <div>
            <span>Total Awaited</span>
            <h2>
            {totalsLive.awaited
                ? totalsLive.awaited.toLocaleString()
                : "-"}
            </h2>
          </div>
        </div>

      </div>

      <div className="traffic-table-card">
        <div className="table-toolbar">
          <div className="search-box">

            <i className="fa-solid fa-magnifying-glass"></i>

            <input
              type="text"
              placeholder="Search connect..."
            />

          </div>

         <div className="live-status">
            <span className="dot"></span>

            <span className="live-text">
                Live tracking
            </span>

            <span className="updated">
                Updated {secondsAgo}s ago
            </span>
          </div>

          <div className="rows-count">
           {liveTraffic.length} of {liveTraffic.length} connects
          </div>

        </div>

        <table className="operator-traffic-table">

          <thead>
            <tr>
              <th>SUMMARY DATE</th>
              <th>CONNECT NAME</th>
              <th>SUBMIT</th>
              <th>DELIVERED</th>
              <th>FAILED</th>
              <th>AWAITED</th>
            </tr>

          </thead>

          <tbody>
        {loading ? (
            <tr>
            <td colSpan="6">
                <div className="table-loader">
                <div className="spinner"></div>
                <p>Loading live traffic...</p>
                </div>
            </td>
            </tr>
        ) : liveTraffic.length === 0 ? (
            <tr>
            <td colSpan="6">
                <div className="empty-table-state">
                <p>No traffic data found.</p>
                </div>
            </td>
            </tr>
        ) : (
            liveTraffic.map((item, index) => {
            const submit = Number(item.totalSubmit);
            const delivered = Number(item.totalDelivered);
            const failed = Number(item.totalFailed);
            const awaited = Number(item.totalAwaited);

            const deliveredPercent =
                submit === 0 ? "0%" : `${((delivered / submit) * 100).toFixed(1)}%`;

            const failedPercent =
                submit === 0 ? "0%" : `${((failed / submit) * 100).toFixed(1)}%`;

            const awaitedPercent =
                submit === 0 ? "0%" : `${((awaited / submit) * 100).toFixed(1)}%`;

            return (
                <tr key={index}>
                <td>{item.summaryDate}</td>

                <td>
                    <div className="connect-name">
                    <div className="connect-avatar">
                        {item.smscId.charAt(0)}
                    </div>

                    {item.smscId}
                    </div>
                </td>

                <td className="submit">
                    {submit.toLocaleString()}
                    <br />
                    <small>100%</small>
                </td>

                <td>
                    <div className="green-text">
                    {delivered.toLocaleString()}
                    </div>
                    <small>{deliveredPercent}</small>
                </td>

                <td>
                    <div className="red-text">
                    {failed.toLocaleString()}
                    </div>
                    <small>{failedPercent}</small>
                </td>

                <td>
                    <div className="yellow-text">
                    {awaited.toLocaleString()}
                    </div>
                    <small>{awaitedPercent}</small>
                </td>
                </tr>
            );
            })
        )}
        </tbody>
        </table>

      </div>
      </>

      )}
  {/* Filter */}
  {activeTab === "history" && (
  <>
  <div className="history-filter-card">

    <div className="history-filter-group">

      <div className="history-field">

        <label>FROM</label>

       <input
        type="date"
        value={fromDate}
        onChange={(e) => setFromDate(e.target.value)}
        />

      </div>

      <div className="history-field">

        <label>TO</label>

        <input
        type="date"
        value={toDate}
        onChange={(e) => setToDate(e.target.value)}
        />

      </div>

      <div className="history-field">
        <label>CONNECT NAME</label>

        <select
            value={selectedConnect}
            onChange={(e) =>
            setSelectedConnect(e.target.value)
            }
        >
            {connectNames.map((connect) => (
            <option
                key={connect}
                value={connect}
            >
                {connect === "All"
                ? "All Connect Name"
                : connect}
            </option>
            ))}
        </select>
        </div>

      <div className="history-checkbox">

        <input type="checkbox" />

        <span>Group by connect</span>

      </div>

    </div>

    <div className="history-buttons">

      <button className="reset-btn">
        Reset
     </button>

      <button
        className="submit-btn"
        onClick={getConnectSummary}
        >
        Submit
    </button>

    </div>

  </div>


  <div className="traffic-cards">

    <div className="traffic-card">

      <div className="card-icon yellow">
        <i className="fa-regular fa-paper-plane"></i>
      </div>

      <div>
        <span>Total Submit</span>
        <h2>
        {totals
            ? totals.submit.toLocaleString()
            : "-"}
        </h2>
      </div>

    </div>

    <div className="traffic-card">

      <div className="card-icon green">
        <i className="fa-solid fa-check"></i>
      </div>

      <div>
        <span>Total Delivered</span>
        <h2>
        {totals
            ? totals.delivered.toLocaleString()
            : "-"}
        </h2>
      </div>

    </div>

    <div className="traffic-card">

      <div className="card-icon red">
        <i className="fa-solid fa-xmark"></i>
      </div>

      <div>
        <span>Total Failed</span>
        <h2>
        {totals
            ? totals.failed.toLocaleString()
            : "-"}
        </h2>
      </div>

    </div>

    <div className="traffic-card">

      <div className="card-icon blue">
        <i className="fa-regular fa-clock"></i>
      </div>

      <div>
        <span>Total Awaited</span>
        <h2>
        {totals
            ? totals.awaited.toLocaleString()
            : "-"}
        </h2>
      </div>

    </div>

  </div>

  {/* Table */}

  <div className="traffic-table-card">
    <div className="table-toolbar">
      <div className="search-box">

        <i className="fa-solid fa-magnifying-glass"></i>

        <input
          type="text"
          placeholder="Search connect..."
        />

      </div>

      <div className="wrap-buttons">
      <div className="export-buttons">

        <button>
          <i className="fa-solid fa-download"></i>
          CSV
        </button>

        <button>
          <i className="fa-solid fa-download"></i>
          XLSX
        </button>

      </div>

      <div className="rows-count">
         {historyTraffic.length} of {historyTraffic.length} connects
      </div>
      </div>

    </div>

    <table className="operator-traffic-table">

      <thead>

        <tr>
          <th>SUMMARY DATE</th>
          <th>CONNECT NAME</th>
          <th>SUBMIT</th>
          <th>DELIVERED</th>
          <th>FAILED</th>
          <th>AWAITED</th>
        </tr>

      </thead>

      <tbody>
    {loading ? (
        <tr>
        <td colSpan="6">
            <div className="table-loader">
            <div className="spinner"></div>
            <p>Loading traffic history...</p>
            </div>
        </td>
        </tr>
    ) : historyTraffic.length === 0 ? (
        <tr>
        <td colSpan="6">
            <div className="empty-table-state">
            <p>No traffic history found.</p>
            </div>
        </td>
        </tr>
    ) : (
        historyTraffic.map((row, index) => {
        const submit = Number(row.totalSubmit);
        const delivered = Number(row.totalDelivered);
        const failed = Number(row.totalFailed);
        const awaited = Number(row.totalAwaited);

        const deliveredPercent =
            submit === 0
            ? "0%"
            : `${((delivered / submit) * 100).toFixed(1)}%`;

        const failedPercent =
            submit === 0
            ? "0%"
            : `${((failed / submit) * 100).toFixed(1)}%`;

        const awaitedPercent =
            submit === 0
            ? "0%"
            : `${((awaited / submit) * 100).toFixed(1)}%`;

        return (
            <tr key={index}>
            <td>{row.summaryDate}</td>

            <td>
                <div className="connect-name">
                <div className="connect-avatar">
                    {row.connectName.charAt(0)}
                </div>

                {row.connectName}
                </div>
            </td>

            <td className="submit">
                {submit.toLocaleString()}
                <br />
                <small>100%</small>
            </td>

            <td>
                <div className="green-text">
                {delivered.toLocaleString()}
                </div>
                <small>{deliveredPercent}</small>
            </td>

            <td>
                <div className="red-text">
                {failed.toLocaleString()}
                </div>
                <small>{failedPercent}</small>
            </td>

            <td>
                <div className="yellow-text">
                {awaited.toLocaleString()}
                </div>
                <small>{awaitedPercent}</small>
            </td>
            </tr>
        );
        })
      )}
     </tbody>
    </table>

  </div>
</>
)}

    </div>
  );
};

export default OperatorTraffic;