import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../../context/AuthContext";
import "./DetailedMis.css";
import Endpoints from "../../api/endpoint";
import { ChevronDown, ChevronUp, Search, X } from "lucide-react";

const DetailedMis = () => {
  const { userData } = useContext(AuthContext);

  // Helper function to get today's date formatted as YYYY-MM-DD in IST
  const formatDateIST = (dateObj) => {
    const options = {
      timeZone: "Asia/Kolkata",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    };
    return new Intl.DateTimeFormat("en-CA", options).format(dateObj);
  };

  const getTodayIST = () => formatDateIST(new Date());

  // Client Data dropdown states
  const [clientList, setClientList] = useState([]);
  const [clientSearch, setClientSearch] = useState("");
  const [selectedClient, setSelectedClient] = useState("");
  const [showClientDropdown, setShowClientDropdown] = useState(false);

  // Filter Form States
  const [fromDate, setFromDate] = useState(getTodayIST());
  const [toDate, setToDate] = useState("");

  // Max selectable date (Today IST) to prevent future date selection
  const todayIST = getTodayIST();
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

  // Helper: Calculate +7 Days from selected From Date
const calculateToDate = (selectedFromDate) => {
  if (!selectedFromDate) return "";

  const from = new Date(selectedFromDate);
  from.setDate(from.getDate() + 7);

  const calculatedTo = formatDateIST(from);

  // Freeze future dates: if calculated +7 days exceeds today, cap at todayIST
  return calculatedTo > todayIST ? todayIST : calculatedTo;
};

const handleFromDateChange = (e) => {
  const newFromDate = e.target.value;
  setFromDate(newFromDate);

  if (newFromDate) {
    const autoToDate = calculateToDate(newFromDate);
    setToDate(autoToDate);
  } else {
    setToDate("");
  }
};

  // Pagination Calculations
  const totalRecords = reportData.length;
  const totalPages = Math.ceil(totalRecords / rowsPerPage) || 1;
  const indexOfLastRow = currentPage * rowsPerPage;
  const indexOfFirstRow = indexOfLastRow - rowsPerPage;
  const currentRows = reportData.slice(indexOfFirstRow, indexOfLastRow);

  // Truncated Pagination Logic (e.g. 1 2 3 ... 10 or 1 ... 4 5 6 ... 10)
const getPageNumbers = () => {
  const pages = [];
  const maxVisiblePages = 5;

  if (totalPages <= maxVisiblePages) {
    for (let i = 1; i <= totalPages; i++) {
      pages.push(i);
    }
  } else {
    if (currentPage <= 3) {
      pages.push(1, 2, 3, "...", totalPages);
    } else if (currentPage >= totalPages - 2) {
      pages.push(1, "...", totalPages - 2, totalPages - 1, totalPages);
    } else {
      pages.push(1, "...", currentPage - 1, currentPage, currentPage + 1, "...", totalPages);
    }
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
            <div className="detailed-mis-field user-client-field">
            <label>
              User Name / Client Name <span>*</span>
            </label>

            <div 
              className={`detailed-mis-select custom-dropdown-trigger ${showClientDropdown ? 'active' : ''}`}
              onClick={() => setShowClientDropdown((prev) => !prev)}
            >
              <span className={`select-value-text ${!selectedClient ? 'placeholder' : ''}`}>
                {selectedClient || "Select User / Client..."}
              </span>

              <div className="trigger-actions" onClick={(e) => e.stopPropagation()}>
                {/* Clear Cross Icon */}
                {selectedClient && (
                  <button
                    type="button"
                    className="clear-selection-btn"
                    onClick={() => {
                      setSelectedClient("");
                      setClientSearch("");
                    }}
                  >
                    <X size={16} />
                  </button>
                )}

                {/* Dropdown Toggle Chevron */}
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
            </div>

            {/* Searchable Dropdown Popup */}
            {showClientDropdown && (
              <div className="userClient-dropdown ">
                {/* Sticky Search Field inside Dropdown Menu */}
                <div className="dropdown-search-wrapper">
                  <input
                    type="text"
                    value={clientSearch}
                    onChange={(e) => setClientSearch(e.target.value)}
                    placeholder="Search user / client..."
                    className="dropdown-inner-search-input"
                    autoFocus
                  />
                </div>

                {/* Options List */}
                <div className="dropdown-options-list">
                  {filteredClients.length > 0 ? (
                    filteredClients.map((client, index) => (
                      <div
                        key={`${client}-${index}`}
                        className={`userClient-dropdown-option ${selectedClient === client ? 'selected' : ''}`}
                        onClick={() => {
                          handleClientSelect(client);
                          setShowClientDropdown(false);
                        }}
                      >
                        {client}
                      </div>
                    ))
                  ) : (
                    <div className="userClient-dropdown-no-result">
                      No clients found
                    </div>
                  )}
                </div>
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
                  max={todayIST}
                  onChange={handleFromDateChange}
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
                  max={todayIST}
                  disabled={!fromDate}
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
      {/* Dedicated horizontal scroll container for the table only */}
      <div className="detailed-mis-table-scroll">
        <table className="detailed-mis-table">
        <thead>
          <tr>
            <th>RECEIVE DATE</th>
            <th>SENT DATE</th>
            <th>MESSAGE ID</th>
            <th>MOBILE NO</th>
            <th>SENDER ID</th>
            <th>MESSAGE TEXT</th>
            <th>MSG COUNT</th>
            <th>TEMPLATE ID</th>
            <th>DELIVERY STATUS</th>
            <th>DELIVERY ERROR CODE</th>
            <th>ERROR CODE DESC</th>
            <th>DELIVERY DATE TIME</th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr>
              {/* Adjusted colSpan from 10 to 12 for the new columns */}
              <td colSpan={12}>
                <div className="table-loader">
                  <div className="spinner"></div>
                  <p>Loading Detailed MIS Report...</p>
                </div>
              </td>
            </tr>
          ) : (
            currentRows.map((row, index) => {
              const message = row.messageText || row.message || "-";
              const status = (row.deliveryStatus || "").toLowerCase();

              return (
                <tr key={index}>
                  <td>{row.receiveDate || row.receive_date || "-"}</td>
                  <td>{row.sentDate || row.sent_date || row.sendDate || "-"}</td>
                  <td>{row.messageId || row.message_id || "-"}</td>
                  <td>{row.mobileNumber || row.mobileNo || "-"}</td>
                  <td>{row.senderId || row.sender_id || "-"}</td>
                  
                  {/* Message Text with Hover Tooltip */}
                  <td className="message-content-cell">
                    <div className="tooltip-container">
                      <span className="text-truncate">{message}</span>
                      {message !== "-" && (
                        <div className="custom-tooltip">{message}</div>
                      )}
                    </div>
                  </td>

                  <td>{row.messageCount || row.message_count || "-"}</td>

                  {/* Template ID */}
                  <td>{row.templateId || row.template_id || "-"}</td>

                  {/* Delivery Status Badge */}
                  <td>
                    <span
                      className={`status-badge ${
                        status.includes("delivered")
                          ? "delivered"
                          : status.includes("failed") || status.includes("rejected")
                          ? "failed"
                          : status.includes("awaited")
                          ? "awaited"
                          : "submitted"
                      }`}
                    >
                      {row.deliveryStatus || "-"}
                    </span>
                  </td>

                  <td>{row.deliveryErrorCode || "-"}</td>

                  {/* Error Code Description */}
                  <td className="message-content-cell">
                  <div className="tooltip-container">
                    <span className="text-truncate">
                      {row.errorCodeDesc || row.error_code_desc || "-"}
                    </span>
                    {(row.errorCodeDesc || row.error_code_desc) && (
                      <div className="custom-tooltip">
                        {row.errorCodeDesc || row.error_code_desc}
                      </div>
                    )}
                  </div>
                </td>

                  <td>{row.deliveryDateTime || "-"}</td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
      </div>

        {/* Pagination stays fixed inside card wrapper below the table scroll */}
      </div>
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
              {Math.min(indexOfLastRow, totalRecords)} of {totalRecords} entries
            </div>

            <div className="mis-pagination-buttons">
              <button
                className="mis-page-arrow"
                onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                disabled={currentPage === 1}
              >
                ‹
              </button>
              {getPageNumbers().map((item, index) =>
                item === "..." ? (
                  <span key={`dots-${index}`} className="mis-pagination-dots">
                    ...
                  </span>
                ) : (
                  <button
                    key={item}
                    className={`mis-page-btn ${
                      currentPage === item ? "active" : ""
                    }`}
                    onClick={() => setCurrentPage(Number(item))}
                  >
                    {item}
                  </button>
                )
              )}
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
      )}
    </div>
  );
};

export default DetailedMis;