import { useContext, useEffect, useState, useRef } from "react";
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
  const todayIST = getTodayIST();

  // Helper function to calculate +7 days cap for API payload
  const calculateToDate = (selectedFromDate) => {
    if (!selectedFromDate) return "";

    const [year, month, day] = selectedFromDate.split("-").map(Number);
    const from = new Date(year, month - 1, day);
    from.setDate(from.getDate() + 7);

    const calculatedTo = formatDateIST(from);
    return calculatedTo > todayIST ? todayIST : calculatedTo;
  };

  // Single Date State (Defaulted to Today IST)
  const [selectedDate, setSelectedDate] = useState(todayIST);

  // Client Data dropdown states
  const [clientList, setClientList] = useState([]);
  const [clientSearch, setClientSearch] = useState("");
  const [selectedClient, setSelectedClient] = useState("");
  const [showClientDropdown, setShowClientDropdown] = useState(false);

  // Search filter inputs
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

  const clientDropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        clientDropdownRef.current &&
        !clientDropdownRef.current.contains(event.target)
      ) {
        setShowClientDropdown(false);
      }
    };

    if (showClientDropdown) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showClientDropdown]);

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
  const fetchDetailedMisReport = async (pageToFetch = 1) => {
    // 1. Mandatory Client Validation
    if (!selectedClient) {
      alert("Please select a User Name / Client Name");
      return;
    }

    // 2. Mandatory Date Validation
    if (!selectedDate) {
      alert("Please select a Date");
      return;
    }

    // 3. Mandatory One-Of Validation (Mobile Number, Sender ID, or Message ID)
    if (!mobileNumber.trim() && !senderId.trim() && !messageId.trim()) {
      alert(
        "Please provide at least one of Mobile Number, Sender ID, or Message ID"
      );
      return;
    }

    setLoading(true);
    setHasSearched(true);
    setCurrentPage(pageToFetch);

    try {
      // Derive fromDate and toDate for API execution
      const fromDate = selectedDate;
      const toDate = calculateToDate(selectedDate);

      const payload = {
        loggedInUserName: userData.username,
        clientName: selectedClient,
        fromDate,
        toDate,
        mobileNumber: mobileNumber.trim() || "",
        senderId: senderId.trim() || "",
        messageId: messageId.trim() || "",
        pageNumber: String(pageToFetch),
      };

      const response = await Endpoints.post(
        "detailedMisReport",
        payload,
        userData.authJwtToken
      );

      // Resolve grid response structure
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

      if (
        grid.length > 0 ||
        response?.code === 14000 ||
        response?.status === 200
      ) {
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

  // Handler for page changes via Pagination
  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > totalPages || newPage === currentPage) return;
    fetchDetailedMisReport(newPage);
  };

  // Reset Form and Results
  const handleReset = () => {
    const today = getTodayIST();
    setSelectedClient("");
    setClientSearch("");
    setSelectedDate(today);
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

  // Truncated Pagination Logic
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
        pages.push(
          1,
          "...",
          currentPage - 1,
          currentPage,
          currentPage + 1,
          "...",
          totalPages
        );
      }
    }
    return pages;
  };

  return (
    <div className="detailed-mis">
      <div className="detailed-mis-header">
        <h1>Detailed MIS</h1>
        <p>Home / Reports / Detailed MIS · Message-level delivery detail</p>
      </div>

      {/* Search / Filter Section */}
      <div className="detailed-mis-filter-card">
        <div className="detailed-mis-filter-grid">
          {/* User / Client Dropdown */}
          <div className="wrap-detailed-mis-input">
            <div
              className="detailed-mis-field user-client-field"
              ref={clientDropdownRef}
            >
              <label>
                User Name / Client Name <span>*</span>
              </label>

              <div
                className={`detailed-mis-select custom-dropdown-trigger ${
                  showClientDropdown ? "active" : ""
                }`}
                onClick={() => setShowClientDropdown((prev) => !prev)}
              >
                <span
                  className={`select-value-text ${
                    !selectedClient ? "placeholder" : ""
                  }`}
                >
                  {selectedClient || "Select User / Client..."}
                </span>

                <div
                  className="trigger-actions"
                  onClick={(e) => e.stopPropagation()}
                >
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

              {showClientDropdown && (
                <div className="userClient-dropdown">
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

                  <div className="dropdown-options-list">
                    {filteredClients.length > 0 ? (
                      filteredClients.map((client, index) => (
                        <div
                          key={`${client}-${index}`}
                          className={`userClient-dropdown-option ${
                            selectedClient === client ? "selected" : ""
                          }`}
                          onClick={() => handleClientSelect(client)}
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

            {/* Single Date Input */}
            <div className="detailed-mis-field date-field">
              <label>
                Date <span>*</span>
              </label>
              <div className="detailed-mis-input date-input">
                <input
                  type="date"
                  value={selectedDate}
                  max={todayIST}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="date-range-input"
                />
              </div>
            </div>

            {/* Mobile Number */}
            <div className="detailed-mis-field">
              <label>
                Mobile Number <span className="optional-asterisk">*</span>
              </label>
              <div className="detailed-mis-input">
              <input
                    type="text"
                    placeholder="Mobile Number"
                    value={mobileNumber}
                    maxLength={12}
                    onChange={(e) => {
                      const numericValue = e.target.value.replace(/[^\d]/g, "").slice(0, 12);
                      setMobileNumber(numericValue);
                    }}
                    className="user-client-search-input"
                  />
              </div>
            </div>

            {/* Sender ID */}
            <div className="detailed-mis-field">
              <label>
                Sender ID <span className="optional-asterisk">*</span>
              </label>
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
              <label>
                Message ID <span className="optional-asterisk">*</span>
              </label>
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
              onClick={() => fetchDetailedMisReport(1)}
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
            <h3>Select a date and User Name / Client Name to search</h3>
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
                          <td>
                            {row.sentDate ||
                              row.sent_date ||
                              row.sendDate ||
                              "-"}
                          </td>
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

                          <td>
                            {row.messageCount || row.message_count || "-"}
                          </td>
                          <td>{row.templateId || row.template_id || "-"}</td>

                          {/* Delivery Status Badge */}
                          <td>
                            <span
                              className={`status-badge ${
                                status.includes("delivered")
                                  ? "delivered"
                                  : status.includes("failed") ||
                                    status.includes("rejected")
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
                                {row.errorCodeDesc ||
                                  row.error_code_desc ||
                                  "-"}
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
          </div>

          {/* Pagination */}
          {!loading && reportData.length > 0 && (
            <div className="detailed-mis-pagination">
              <div className="mis-rows-per-page">
                <span>Rows per page:</span>
                <select
                  value={rowsPerPage}
                  onChange={(e) => {
                    setRowsPerPage(Number(e.target.value));
                    fetchDetailedMisReport(1);
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
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  ‹
                </button>

                {getPageNumbers().map((item, index) =>
                  item === "..." ? (
                    <span
                      key={`dots-${index}`}
                      className="mis-pagination-dots"
                    >
                      ...
                    </span>
                  ) : (
                    <button
                      key={item}
                      className={`mis-page-btn ${
                        currentPage === item ? "active" : ""
                      }`}
                      onClick={() => handlePageChange(Number(item))}
                    >
                      {item}
                    </button>
                  )
                )}

                <button
                  className="mis-page-arrow"
                  onClick={() => handlePageChange(currentPage + 1)}
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