import React, { useState, useContext, useEffect } from "react";
import "./DRSummary.css";
import Endpoints from "../../api/endpoint";
import { AuthContext } from "../../context/AuthContext";

const DRSummary = () => {
  const { userData } = useContext(AuthContext);
  const [search, setSearch] = useState("");

  const getTodayIST = () => {
  return new Date().toLocaleDateString("en-CA", {
    timeZone: "Asia/Kolkata",
   });
 };

  const [fromDate, setFromDate] = useState(getTodayIST());
  const [toDate, setToDate] = useState(getTodayIST());
  const today = getTodayIST();

  const [tableData, setTableData] = useState([]);
  const [loading, setLoading] = useState(false);

  const [selectedUsername, setSelectedUsername] = useState("All Username");

  const loadDRSummary = async () => {
    setLoading(true);
  try {
    const response = await fetch(
    `${Endpoints.get("drSummaryApi")}?fromDate=${fromDate}&toDate=${toDate}`,
    {
        method: "GET",
        headers: {
        Authorization: `${userData.authJwtToken}`,
        "Content-Type": "application/json",
        },
    }
    );

    if (!response.ok) {
      throw new Error(`HTTP Error: ${response.status}`);
    }

    const data = await response.json();

    setTableData(data);
  } catch (error) {
    console.error("Failed to fetch DR Summary", error);
    setTableData([]);
  } finally {
    setLoading(false);
  }
};

useEffect(() => {
  loadDRSummary();
}, []);

const usernames = [
  "All Username",
  ...new Set(tableData.map((item) => item.userName)),
];

const filteredData = tableData.filter((item) => {
  const matchesSearch = item.userName
    .toLowerCase()
    .includes(search.toLowerCase());

  const matchesUsername =
    selectedUsername === "All Username" ||
    item.userName === selectedUsername;

  return matchesSearch && matchesUsername;
});

 const total = filteredData.reduce(
   (sum, item) => sum + item.submitCount,
    0
 );

 const handleReset = () => {
  const today = getTodayIST();

  setFromDate(today);
  setToDate(today);
  setSearch("");

  setTimeout(() => {
    loadDRSummary();
  }, 0);
};

  return (
    <div className="dr-summary">
      <div className="dr-summary-header">
        <h1>DR Summary</h1>
        <p>Home / DR Summary · Daily delivery-request count by username</p>
      </div>

      {/* Filter Card */}

      <div className="filter-card">
        <div className="filter-left">
        <div className="filter-group">
        <label>FROM</label>
        <input
            type="date"
            value={fromDate}
            max={today}
            onChange={(e) => setFromDate(e.target.value)}
        />
        </div>

        <div className="filter-group">
        <label>TO</label>
        <input
            type="date"
            value={toDate}
            max={today}
            onChange={(e) => setToDate(e.target.value)}
        />
        </div>

          <div className="filter-group">
            <label>USERNAME</label>

            <select
                value={selectedUsername}
                onChange={(e) => setSelectedUsername(e.target.value)}
            >
                {usernames.map((username) => (
                <option key={username} value={username}>
                    {username}
                </option>
                ))}
            </select>
            </div>

        </div>

        <div className="filter-buttons">
          <button className="reset-btn"
            onClick={handleReset}
          >
            Reset
          </button>
          <button
            className="submit-btn"
            onClick={loadDRSummary}
            >
            Submit
            </button>
        </div>

      </div>

      {/* Table Card */}

      <div className="table-card">

        <div className="table-top">

          <input
            className="search-box"
            placeholder="Search username..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <span>{filteredData.length} of {tableData.length} rows</span>

        </div>

        <table className="dr-summary-table">

          <thead>

            <tr>
              <th>DATE</th>
              <th>USERNAME</th>
              <th style={{ textAlign: "right" }}>COUNT</th>
            </tr>

          </thead>

          <tbody>
            {loading ? (
                <tr>
                <td colSpan="3">
                    <div className="table-loader">
                    <div className="spinner"></div>
                    <p>Loading DR summary...</p>
                    </div>
                </td>
                </tr>
            ) : filteredData.length > 0 ? (
                <>
                {filteredData.map((item, index) => (
                    <tr key={index}>
                    <td>{item.date}</td>

                    <td className="user-cell">
                        <div className="avatar">
                        {item.userName.charAt(0).toUpperCase()}
                        </div>

                        {item.userName}
                    </td>

                    <td className="count-cell">
                        {item.submitCount.toLocaleString()}
                    </td>
                    </tr>
                ))}

                <tr className="total-row">
                    <td>Total</td>
                    <td></td>
                    <td className="count-cell">
                    {total.toLocaleString()}
                    </td>
                </tr>
                </>
            ) : (
                <tr>
                <td colSpan="3" className="empty-state-cell">
                    <div className="empty-state">
                    <div className="empty-icon">
                        <i className="fa-solid fa-chart-line"></i>
                    </div>
                    <h3>No data for this range</h3>
                    <p>
                        There's no DR activity between the selected dates.
                        <br />
                        Try selecting a wider date range.
                    </p>
                    </div>
                </td>
                </tr>
            )}
            </tbody>

        </table>

      </div>

    </div>
  );
};

export default DRSummary;