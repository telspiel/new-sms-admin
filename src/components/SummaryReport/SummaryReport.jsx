import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../../context/AuthContext";
import "./SummaryReport.css";
import Endpoints from "../../api/endpoint";
import { Search } from "lucide-react";

const SummaryReport = () => {

  const { userData } = useContext(AuthContext);

  // Helper function to get today's date formatted as YYYY-MM-DD in Asia/Kolkata (IST)
  const getTodayIST = () => {
    const options = { timeZone: "Asia/Kolkata", year: "numeric", month: "2-digit", day: "2-digit" };
    const formatter = new Intl.DateTimeFormat("en-CA", options);
    return formatter.format(new Date());
  };

  // Filter States
  const [selectedUser, setSelectedUser] = useState("");
  const [selectedSenderId, setSelectedSenderId] = useState("");
  const [fromDate, setFromDate] = useState(getTodayIST());
  const [toDate, setToDate] = useState(getTodayIST());

  // Options populated dynamically from senderIdSummaryReport
  const [userList, setUserList] = useState([]);
  const [senderList, setSenderList] = useState([]);

  // Data & Pagination States
  const [gridData, setGridData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Dynamic Column Visibility based on dropdown selections
  const showUserColumn = Boolean(selectedUser);
  const showSenderColumn = Boolean(selectedSenderId);

  // Fetch Summary Report Data
  const fetchSummaryReport = async () => {
    setLoading(true);
    try {
      const payload = {
        loggedInUserName: userData.username,
        fromDate,
        toDate,
        userName: selectedUser || undefined,
        senderId: selectedSenderId || undefined,
      };

      const response = await Endpoints.post(
        "senderIdSummaryReport",
        payload,
        userData.authJwtToken
      );

      if (response?.code === 14000) {
        const rawGrid = response.data?.grid || [];
        setGridData(rawGrid);

        const uniqueUsers = [
          ...new Set(rawGrid.map((item) => item.username).filter(Boolean)),
        ];
        const uniqueSenders = [
          ...new Set(rawGrid.map((item) => item.senderId).filter(Boolean)),
        ];

        if (!selectedUser && !selectedSenderId) {
          setUserList(uniqueUsers);
          setSenderList(uniqueSenders);
        }
      } else {
        alert(response?.message || "Failed to fetch summary report");
        setGridData([]);
      }
    } catch (error) {
      console.error("Error fetching summary report:", error);
      setGridData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userData?.username) {
      fetchSummaryReport();
    }
  }, [userData]);

  const handleSearch = () => {
    setCurrentPage(1);
    fetchSummaryReport();
  };

  const handleReset = () => {
    const today = getTodayIST();
    setSelectedUser("");
    setSelectedSenderId("");
    setFromDate(today);
    setToDate(today);
   fetchSummaryReport();
  };

  // Percentage Helper (Calculated against Total Submit)
  const calculatePercentage = (val, submitVal) => {
    const num = Number(val) || 0;
    const sub = Number(submitVal) || 0;
    if (sub === 0) return "0.0%";
    return `${((num / sub) * 100).toFixed(1)}%`;
  };

  // Totals Calculation for Footer
  const totals = gridData.reduce(
    (acc, row) => {
      acc.totalRequest += Number(row.totalRequest || 0);
      acc.totalRejected += Number(row.totalRejected || 0);
      acc.totalSubmit += Number(row.totalSubmit || 0);
      acc.totalDelivered += Number(row.totalDelivered || 0);
      acc.totalFailed += Number(row.totalFailed || 0);
      acc.totalAwaited += Number(row.totalAwaited || 0);
      return acc;
    },
    {
      totalRequest: 0,
      totalRejected: 0,
      totalSubmit: 0,
      totalDelivered: 0,
      totalFailed: 0,
      totalAwaited: 0,
    }
  );

  // Pagination Logic
  const totalRecords = gridData.length;
  const totalPages = Math.ceil(totalRecords / rowsPerPage) || 1;
  const indexOfLastRow = currentPage * rowsPerPage;
  const indexOfFirstRow = indexOfLastRow - rowsPerPage;
  const currentRows = gridData.slice(indexOfFirstRow, indexOfLastRow);

  const getPageNumbers = () => {
    const pages = [];
    for (let i = 1; i <= totalPages; i++) {
      pages.push(i);
    }
    return pages;
  };

  const activeExtraColumnsCount =
    (showUserColumn ? 1 : 0) + (showSenderColumn ? 1 : 0);
  const totalColumns = 7 + activeExtraColumnsCount;

  
  return (
    <div className="summary-report">
      <div className="summary-report-header">
        <h1>Summary Report</h1>
        <p>
          Home / Reports / Summary Report · Per-user, per-day delivery summary
        </p>
      </div>

      <div className="summary-filter-card">
        <div className="summary-filter-field user-field">
          <label>User Name / Client Name</label>
          <div className="summary-select">
            <select
              value={selectedUser}
              onChange={(e) => setSelectedUser(e.target.value)}
            >
              <option value="">All Users</option>
              {userList.map((user, idx) => (
                <option key={idx} value={user}>
                  {user}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="summary-filter-field sender-field">
          <label>Sender ID</label>
          <div className="summary-select">
            <select
              value={selectedSenderId}
              onChange={(e) => setSelectedSenderId(e.target.value)}
            >
              <option value="">All Sender IDs</option>
              {senderList.map((sender, idx) => (
                <option key={idx} value={sender}>
                  {sender}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="summary-filter-field date-field">
          <label>
            From <span>*</span>
          </label>
          <div className="summary-date-input">
            <input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
            />
          </div>
        </div>

        <div className="summary-filter-field date-field">
          <label>
            To <span>*</span>
          </label>
          <div className="summary-date-input">
            <input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
            />
          </div>
        </div>

        <div className="summary-filter-actions">
          <button className="summary-search-btn" onClick={handleSearch}>
            Search
          </button>
          <button className="summary-reset-btn" onClick={handleReset}>
            Reset
          </button>
        </div>
      </div>

      {!loading && gridData.length === 0 ? (
      <div className="no-records-card">
        <div className="no-records-icon-wrapper">
          <Search className="no-records-icon" size={28} />
        </div>
        <h3 className="no-records-title">No records found</h3>
        <p className="no-records-subtext">
          No summary data in this date range. Try widening the range.
        </p>
      </div>
    ) : (
      <>
        <div className="summary-record-count">
          {totalRecords} {totalRecords === 1 ? "record" : "records"}
        </div>

        <div className="summary-table-wrapper">
          <table className="summary-table">
            <thead>
              <tr>
                <th>SUMMARY DATE</th>
                {showUserColumn && <th>CLIENT NAME</th>}
                {showSenderColumn && <th>SENDER ID</th>}
                <th>TOTAL REQUEST</th>
                <th>TOTAL REJECTED</th>
                <th>TOTAL SUBMIT</th>
                <th>TOTAL DELIVERED</th>
                <th>TOTAL FAILED</th>
                <th>TOTAL AWAITED</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={totalColumns}>
                    <div className="table-loader">
                      <div className="spinner"></div>
                      <p>Loading Summary Report...</p>
                    </div>
                  </td>
                </tr>
              ) : (
                currentRows.map((row, index) => (
                  <tr key={index}>
                    <td>{row.summaryDate}</td>
                    {showUserColumn && <td>{row.username || "-"}</td>}
                    {showSenderColumn && <td>{row.senderId || "-"}</td>}

                    <td className="summary-number">
                      {Number(row.totalRequest).toLocaleString()}
                    </td>
                    <td className="summary-number">
                      {Number(row.totalRejected).toLocaleString()}
                    </td>
                    <td className="summary-number">
                      {Number(row.totalSubmit).toLocaleString()}
                    </td>

                    <td className="summary-delivered-cell">
                      <strong>
                        {Number(row.totalDelivered).toLocaleString()}
                      </strong>
                      <span>
                        {calculatePercentage(
                          row.totalDelivered,
                          row.totalSubmit
                        )}
                      </span>
                    </td>

                    <td className="summary-failed-cell">
                      <strong>{Number(row.totalFailed).toLocaleString()}</strong>
                      <span>
                        {calculatePercentage(row.totalFailed, row.totalSubmit)}
                      </span>
                    </td>

                    <td className="summary-awaited-cell">
                      <strong>
                        {Number(row.totalAwaited).toLocaleString()}
                      </strong>
                      <span>
                        {calculatePercentage(row.totalAwaited, row.totalSubmit)}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>

            {!loading && gridData.length > 0 && (
              <tfoot>
                <tr>
                  <td
                    className="summary-footer-label"
                    colSpan={1 + activeExtraColumnsCount}
                  >
                    Total ({totalRecords}{" "}
                    {totalRecords === 1 ? "record" : "records"})
                  </td>

                  <td className="summary-footer-number">
                    {totals.totalRequest.toLocaleString()}
                  </td>
                  <td className="summary-footer-number">
                    {totals.totalRejected.toLocaleString()}
                  </td>
                  <td className="summary-footer-number">
                    {totals.totalSubmit.toLocaleString()}
                  </td>

                  <td className="summary-delivered-cell">
                    <strong>{totals.totalDelivered.toLocaleString()}</strong>
                    <span>
                      {calculatePercentage(
                        totals.totalDelivered,
                        totals.totalSubmit
                      )}
                    </span>
                  </td>

                  <td className="summary-failed-cell">
                    <strong>{totals.totalFailed.toLocaleString()}</strong>
                    <span>
                      {calculatePercentage(
                        totals.totalFailed,
                        totals.totalSubmit
                      )}
                    </span>
                  </td>

                  <td className="summary-awaited-cell">
                    <strong>{totals.totalAwaited.toLocaleString()}</strong>
                    <span>
                      {calculatePercentage(
                        totals.totalAwaited,
                        totals.totalSubmit
                      )}
                    </span>
                  </td>
                </tr>
              </tfoot>
            )}
          </table>

          {/* Pagination */}
          <div className="summary-pagination">
            <div className="summary-rows-per-page">
              <span>Rows per page</span>
              <select
                value={rowsPerPage}
                onChange={(e) => {
                  setRowsPerPage(Number(e.target.value));
                  setCurrentPage(1);
                }}
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
            </div>

            <div className="summary-pagination-buttons">
              <button
                className={`summary-page-arrow ${
                  currentPage === 1 ? "disabled" : ""
                }`}
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              >
                ‹
              </button>

              {getPageNumbers().map((page) => (
                <button
                  key={page}
                  className={`summary-page ${
                    currentPage === page ? "active" : ""
                  }`}
                  onClick={() => setCurrentPage(page)}
                >
                  {page}
                </button>
              ))}

              <button
                className={`summary-page-arrow ${
                  currentPage === totalPages || totalPages === 0 ? "disabled" : ""
                }`}
                disabled={currentPage === totalPages || totalPages === 0}
                onClick={() =>
                  setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                }
              >
                ›
              </button>
            </div>
          </div>
        </div>
      </>
    )}
    </div>
  );
};

export default SummaryReport;