import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../../context/AuthContext";
import "./DetailedMis.css";
import Endpoints from "../../api/endpoint";
import { ChevronDown, ChevronUp, Search } from "lucide-react";

const DetailedMis = () => {
  const { userData } = useContext(AuthContext);

  // Helper function to get today's date formatted as YYYY-MM-DD in IST
  const getTodayIST = () => {
    const options = {
      timeZone: "Asia/Kolkata",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    };
    const formatter = new Intl.DateTimeFormat("en-CA", options);
    return formatter.format(new Date());
  };

  // Client Data dropdown states
  const [clientList, setClientList] = useState([]);
  const [clientSearch, setClientSearch] = useState("");
  const [selectedClient, setSelectedClient] = useState("");
  const [showClientDropdown, setShowClientDropdown] = useState(false);

  // Filter Form States
  const [fromDate, setFromDate] = useState(getTodayIST());
  const [toDate, setToDate] = useState(getTodayIST());
  const [mobileNumber, setMobileNumber] = useState("");
  const [senderId, setSenderId] = useState("");
  const [messageId, setMessageId] = useState("");

  // Grid / Report Data States
  const [reportData, setReportData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [summaryInfoText, setSummaryInfoText] = useState("");

  // Pagination States
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Fetch Client List
  const getAllUsers = async () => {
    try {
      const payload = {
        loggedInUserName: userData.username,
      };

      const response = await Endpoints.post(
        "getAllUsers",
        payload,
        userData.authJwtToken
      );

      if (response?.code === 14000 || response?.status === 200) {
        const clients = response.data?.clientList || response.data || [];
        setClientList(Array.isArray(clients) ? clients : []);
      } else {
        alert(response?.message || "Failed to fetch clients");
      }
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  useEffect(() => {
    if (userData?.username) {
      getAllUsers();
    }
  }, [userData?.username]);

  // Filter client list based on search text
  const filteredClients = clientList.filter((client) =>
    client.toLowerCase().includes(clientSearch.toLowerCase())
  );

  // Select client from dropdown
  const handleClientSelect = (client) => {
    setSelectedClient(client);
    setClientSearch(client);
    setShowClientDropdown(false);
  };

  // Fetch Detailed MIS Report Data
  const fetchDetailedMisReport = async () => {
    if (!selectedClient) {
      alert("Please select a User Name / Client Name");
      return;
    }
    if (!fromDate || !toDate) {
      alert("Please select both From and To dates");
      return;
    }

    setLoading(true);
    setHasSearched(true);
    setCurrentPage(1);

    try {
      const payload = {
        loggedInUserName: userData.username,
        clientName: selectedClient,
        fromDate,
        toDate,
        mobileNumber: mobileNumber || "",
        senderId: senderId || "",
        messageId: messageId || "",
      };

      const response = await Endpoints.post(
        "detailedMisReport",
        payload,
        userData.authJwtToken
      );

      // Deep resolve array list anywhere inside the response structure
      const rawGrid =
        (Array.isArray(response) && response) ||
        (Array.isArray(response?.data) && response?.data) ||
        response?.data?.grid ||
        response?.data?.reportList ||
        response?.data?.data?.grid ||
        response?.data?.data ||
        response?.grid ||
        [];

      const grid = Array.isArray(rawGrid) ? rawGrid : [];

      if (grid.length > 0 || response?.code === 14000 || response?.status === 200) {
        setReportData(grid);
        setSummaryInfoText(
          response?.data?.summaryInfo ||
            `${grid.length} records for ${selectedClient}`
        );
      } else {
        alert(response?.message || "Failed to fetch detailed MIS report");
        setReportData([]);
      }
    } catch (error) {
      console.error("Error fetching Detailed MIS report:", error);
      setReportData([]);
    } finally {
      setLoading(false);
    }
  };

  // Reset Form and Results
  const handleReset = () => {
    const today = getTodayIST();
    setSelectedClient("");
    setClientSearch("");
    setFromDate(today);
    setToDate(today);
    setMobileNumber("");
    setSenderId("");
    setMessageId("");
    setReportData([]);
    setHasSearched(false);
    setCurrentPage(1);
  };

  // Pagination Calculations
  const totalRecords = reportData.length;
  const totalPages = Math.ceil(totalRecords / rowsPerPage) || 1;
  const indexOfLastRow = currentPage * rowsPerPage;
  const indexOfFirstRow = indexOfLastRow - rowsPerPage;
  const currentRows = reportData.slice(indexOfFirstRow, indexOfLastRow);

  const getPageNumbers = () => {
    const pages = [];
    for (let i = 1; i <= totalPages; i++) {
      pages.push(i);
    }
    return pages;
  };

  return (
    <div className="detailed-mis">
      {/* Page Header */}
      <div className="detailed-mis-header">
        <h1>Detailed MIS</h1>
        <p>Home / Reports / Detailed MIS · Message-level delivery detail</p>
      </div>

      {/* Search / Filter Section */}
      <div className="detailed-mis-filter-card">
        <div className="detailed-mis-filter-grid">
          <div className="wrap-detailed-mis-input">
            {/* User Name / Client Name */}
            <div className="detailed-mis-field user-client-field">
              <label>
                User Name / Client Name <span>*</span>
              </label>

              <div className="detailed-mis-select">
                <input
                  type="text"
                  value={clientSearch}
                  onChange={(e) => {
                    setClientSearch(e.target.value);
                    setSelectedClient(e.target.value);
                    setShowClientDropdown(true);
                  }}
                  onFocus={() => setShowClientDropdown(true)}
                  placeholder="Type to search..."
                  className="user-client-search-input"
                />

                <button
                  type="button"
                  className="select-arrow"
                  onClick={() => setShowClientDropdown((prev) => !prev)}
                >
                  {showClientDropdown ? (
                    <ChevronUp size={18} />
                  ) : (
                    <ChevronDown size={18} />
                  )}
                </button>
              </div>

              {/* Client Dropdown */}
              {showClientDropdown && (
                <div className="client-dropdown">
                  {filteredClients.length > 0 ? (
                    filteredClients.map((client, index) => (
                      <div
                        key={`${client}-${index}`}
                        className="client-dropdown-option"
                        onClick={() => handleClientSelect(client)}
                      >
                        {client}
                      </div>
                    ))
                  ) : (
                    <div className="client-dropdown-no-result">
                      No clients found
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* From Date */}
            <div className="detailed-mis-field date-field">
              <label>
                From <span>*</span>
              </label>
              <div className="detailed-mis-input date-input">
                <input
                  type="date"
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                  className="date-range-input"
                />
              </div>
            </div>

            {/* To Date */}
            <div className="detailed-mis-field date-field">
              <label>
                To <span>*</span>
              </label>
              <div className="detailed-mis-input date-input">
                <input
                  type="date"
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
                  className="date-range-input"
                />
              </div>
            </div>

            {/* Mobile Number */}
            <div className="detailed-mis-field">
              <label>Mobile Number</label>
              <div className="detailed-mis-input">
                <input
                  type="text"
                  placeholder="Mobile Number"
                  value={mobileNumber}
                  onChange={(e) => setMobileNumber(e.target.value)}
                  className="user-client-search-input"
                />
              </div>
            </div>

            {/* Sender ID */}
            <div className="detailed-mis-field">
              <label>Sender ID</label>
              <div className="detailed-mis-input">
                <input
                  type="text"
                  placeholder="Sender ID"
                  value={senderId}
                  onChange={(e) => setSenderId(e.target.value)}
                  className="user-client-search-input"
                />
              </div>
            </div>

            {/* Message ID */}
            <div className="detailed-mis-field">
              <label>Message ID</label>
              <div className="detailed-mis-input">
                <input
                  type="text"
                  placeholder="Message ID"
                  value={messageId}
                  onChange={(e) => setMessageId(e.target.value)}
                  className="user-client-search-input"
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="detailed-mis-actions">
            <button
              type="button"
              className="detailed-mis-reset-btn"
              onClick={handleReset}
            >
              Reset
            </button>
            <button
              type="button"
              className="detailed-mis-search-btn"
              onClick={fetchDetailedMisReport}
            >
              Search
            </button>
          </div>
        </div>
      </div>

      {/* Initial Empty State */}
      {!hasSearched && (
        <div className="detailed-mis-results-card">
          <div className="detailed-mis-empty-state">
            <div className="detailed-mis-search-icon">
              <div className="search-circle"></div>
              <div className="search-handle"></div>
            </div>
            <h3>Select a date range and User Name / Client Name to search</h3>
            <p>
              Then add at least one of Sender ID, Mobile Number or Message ID to
              narrow it down.
            </p>
          </div>
        </div>
      )}

      {/* No Records State */}
      {hasSearched && !loading && reportData.length === 0 && (
        <div className="no-records-card">
          <div className="no-records-icon-wrapper">
            <Search className="no-records-icon" size={28} />
          </div>
          <h3 className="no-records-title">No records found</h3>
          <p className="no-records-subtext">
            No detailed MIS data found for this range and selection.
          </p>
        </div>
      )}

      {/* Results Data Table */}
      {hasSearched && (loading || reportData.length > 0) && (
        <div className="detailed-mis-report-container">
          <div className="summary-record-count">{summaryInfoText}</div>

          <div className="detailed-mis-table-wrapper">
            <table className="detailed-mis-table">
              <thead>
                <tr>
                  <th>RECEIVE DATE</th>
                  <th>SENT DATE</th>
                  <th>MESSAGE ID</th>
                  <th>MOBILE NO</th>
                  <th>SENDER ID</th>
                  {/* <th>DELIVERY DATE & TIME</th> */}
                  <th>MESSAGE TEXT</th>
                  {/* <th>MESSAGE COUNT</th> */}
                  <th>DELIVERY STATUS</th>
                  <th>ERROR CODE</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={10}>
                      <div className="table-loader">
                        <div className="spinner"></div>
                        <p>Loading Detailed MIS Report...</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  currentRows.map((row, index) => (
                    <tr key={index}>
                      <td>{row.receiveDate || row.receive_date || "-"}</td>
                      <td>{row.sentDate || row.sent_date || row.sendDate || "-"}</td>
                      <td>{row.messageId || row.message_id || "-"}</td>
                      <td>{row.mobileNumber || row.mobileNo || "-"}</td>
                      <td>{row.senderId || row.sender_id || "-"}</td>
                      {/* <td>{row.deliveryDateTime || row.deliveryDate || "-"}</td> */}
                      <td className="message-content-cell">
                        <span className="text-truncate">
                          {row.messageText || row.message || "-"}
                        </span>
                      </td>
                      {/* <td>{row.messageCount || row.message_count || "-"}</td> */}
                      <td>
                        <span
                          className={`status-badge ${
                            (row.deliveryStatus || "")
                              .toLowerCase()
                              .includes("delivered")
                              ? "delivered"
                              : (row.deliveryStatus || "")
                                  .toLowerCase()
                                  .includes("failed") ||
                                (row.deliveryStatus || "")
                                  .toLowerCase()
                                  .includes("rejected")
                              ? "failed"
                              : "submitted"
                          }`}
                        >
                          {row.deliveryStatus || "-"}
                        </span>
                      </td>
                      <td>{row.deliveryErrorCode || row.errorCode || "-"}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>

            {/* Pagination Controls */}
            {!loading && reportData.length > 0 && (
              <div className="detailed-mis-pagination">
                <div className="mis-rows-per-page">
                  <span>Rows per page:</span>
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

                <div className="mis-showing">
                  Showing {indexOfFirstRow + 1} to{" "}
                  {Math.min(indexOfLastRow, totalRecords)} of {totalRecords}{" "}
                  entries
                </div>

                <div className="mis-pagination-buttons">
                  <button
                    className="mis-page-arrow"
                    onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                    disabled={currentPage === 1}
                  >
                    ‹
                  </button>
                  {getPageNumbers().map((pageNum) => (
                    <button
                      key={pageNum}
                      className={`mis-page-btn ${
                        currentPage === pageNum ? "active" : ""
                      }`}
                      onClick={() => setCurrentPage(pageNum)}
                    >
                      {pageNum}
                    </button>
                  ))}
                  <button
                    className="mis-page-arrow"
                    onClick={() =>
                      setCurrentPage((p) => Math.min(p + 1, totalPages))
                    }
                    disabled={currentPage === totalPages}
                  >
                    ›
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default DetailedMis;