import { useContext, useEffect, useState, useMemo, useRef } from "react";
import { AuthContext } from "../../context/AuthContext";
import "./SummaryReport.css";
import Endpoints from "../../api/endpoint";
import { Search, ChevronDown, ChevronUp, ArrowUp, ArrowDown, Download  } from "lucide-react";


const SummaryReport = () => {
  const { userData } = useContext(AuthContext);

  // Helper function to get today's date formatted as YYYY-MM-DD in Asia/Kolkata (IST)
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

  const todayIST = getTodayIST();

  // Filter States
  const [selectedUser, setSelectedUser] = useState("");
  const [selectedSenderId, setSelectedSenderId] = useState("");
  const [fromDate, setFromDate] = useState(todayIST);
  const [toDate, setToDate] = useState(todayIST);

  // Options populated dynamically from senderIdSummaryReport
  const [userList, setUserList] = useState([]);
  const [senderList, setSenderList] = useState([]);

  // Data & Pagination States
  const [gridData, setGridData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const [isUserOpen, setIsUserOpen] = useState(false);
  const [userSearchTerm, setUserSearchTerm] = useState("");
  const [isSenderOpen, setIsSenderOpen] = useState(false);
  const [senderSearchTerm, setSenderSearchTerm] = useState("");

  // Dynamic Column Visibility based on dropdown selections (Preserved)
  const showUserColumn = selectedUser.length > 0;
  const showSenderColumn = selectedSenderId.length > 0;

  const [sortField, setSortField] = useState(null);
  const [sortDirection, setSortDirection] = useState("asc"); // "asc" or "desc"

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
    setCurrentPage(1);
  };

  // Fetch Summary Report Data
  const fetchSummaryReport = async (overridePayload) => {
    setLoading(true);
    try {
      const payload = overridePayload || {
        loggedInUserName: userData.username,
        fromDate,
        toDate,
        userName: selectedUser.length > 0 ? selectedUser.join(",") : undefined,
        senderId: selectedSenderId.length > 0 ? selectedSenderId.join(",") : undefined,
      };

      const response = await Endpoints.post(
        "senderIdSummaryReport",
        payload,
        userData.authJwtToken
      );

      if (response?.code === 14000) {
        const rawGrid = response.data?.grid || [];
        setGridData(rawGrid);

        // Keep dropdown lists intact by only initializing them when no dropdown filter is active
        if (!payload.userName && !payload.senderId) {
          const uniqueUsers = [
            ...new Set(rawGrid.map((item) => item.username).filter(Boolean)),
          ];
          const uniqueSenders = [
            ...new Set(rawGrid.map((item) => item.senderId).filter(Boolean)),
          ];
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

  // Client-side filter fallback to guarantee instantaneous filtering and calculations
//  const filteredGridData = useMemo(() => {
//     if (!gridData || gridData.length === 0) return [];

//     const matchedRows = gridData.filter((row) => {
//       const rowUser = row.username || row.clientName;
//       const matchesUser = selectedUser.length > 0 ? selectedUser.includes(rowUser) : true;
//       const matchesSender = selectedSenderId.length > 0 ? selectedSenderId.includes(row.senderId) : true;

//       return matchesUser && matchesSender;
//     });

//     let processedRows = [];

//     if (selectedUser.length === 0 && selectedSenderId.length === 0) {
//       const aggregatedMap = {};
//       matchedRows.forEach((item) => {
//         const date = item.summaryDate;
//         if (!aggregatedMap[date]) {
//           aggregatedMap[date] = {
//             summaryDate: date,
//             totalRequest: 0,
//             totalRejected: 0,
//             totalSubmit: 0,
//             totalDelivered: 0,
//             totalFailed: 0,
//             totalAwaited: 0,
//             username: "",
//             senderId: "",
//           };
//         }
//         aggregatedMap[date].totalRequest += Number(item.totalRequest || 0);
//         aggregatedMap[date].totalRejected += Number(item.totalRejected || 0);
//         aggregatedMap[date].totalSubmit += Number(item.totalSubmit || 0);
//         aggregatedMap[date].totalDelivered += Number(item.totalDelivered || 0);
//         aggregatedMap[date].totalFailed += Number(item.totalFailed || 0);
//         aggregatedMap[date].totalAwaited += Number(item.totalAwaited || 0);
//       });
//       processedRows = Object.values(aggregatedMap);
//     } else {
//       processedRows = matchedRows.map((item) => ({
//         ...item,
//         username: item.username || item.clientName || "-",
//         senderId: item.senderId || "-",
//       }));
//     }

//     if (sortField) {
//       processedRows.sort((a, b) => {
//         const valA = Number(a[sortField] || 0);
//         const valB = Number(b[sortField] || 0);
//         if (valA < valB) return sortDirection === "asc" ? -1 : 1;
//         if (valA > valB) return sortDirection === "asc" ? 1 : -1;
//         return 0;
//       });
//     } else {
//       processedRows.sort((a, b) => new Date(b.summaryDate) - new Date(a.summaryDate));
//     }

//     return processedRows;
//   }, [gridData, selectedUser, selectedSenderId, sortField, sortDirection]);
const filteredGridData = useMemo(() => {
    if (!gridData || gridData.length === 0) return [];

    // Step 1: Filter rows based on selected dropdown values
    const matchedRows = gridData.filter((row) => {
      const rowUser = row.username || row.clientName;
      const matchesUser = selectedUser.length > 0 ? selectedUser.includes(rowUser) : true;
      const matchesSender = selectedSenderId.length > 0 ? selectedSenderId.includes(row.senderId) : true;

      return matchesUser && matchesSender;
    });

    let processedRows = [];

    // Step 2: Conditional Aggregation based on active filter combination
    if (selectedUser.length === 0 && selectedSenderId.length === 0) {
      // Case A: Nothing selected -> Group strictly by Date
      const aggregatedMap = {};
      matchedRows.forEach((item) => {
        const date = item.summaryDate;
        if (!aggregatedMap[date]) {
          aggregatedMap[date] = {
            summaryDate: date,
            totalRequest: 0,
            totalRejected: 0,
            totalSubmit: 0,
            totalDelivered: 0,
            totalFailed: 0,
            totalAwaited: 0,
            username: "",
            senderId: "",
          };
        }
        aggregatedMap[date].totalRequest += Number(item.totalRequest || 0);
        aggregatedMap[date].totalRejected += Number(item.totalRejected || 0);
        aggregatedMap[date].totalSubmit += Number(item.totalSubmit || 0);
        aggregatedMap[date].totalDelivered += Number(item.totalDelivered || 0);
        aggregatedMap[date].totalFailed += Number(item.totalFailed || 0);
        aggregatedMap[date].totalAwaited += Number(item.totalAwaited || 0);
      });
      processedRows = Object.values(aggregatedMap);

    } else if (selectedUser.length > 0 && selectedSenderId.length === 0) {
      // Case B: Only User selected -> Group by Date + Username (merging same username on same date)
      const aggregatedMap = {};
      matchedRows.forEach((item) => {
        const uname = item.username || item.clientName || "-";
        const date = item.summaryDate;
        const key = `${date}_${uname}`;

        if (!aggregatedMap[key]) {
          aggregatedMap[key] = {
            summaryDate: date,
            username: uname,
            senderId: "-", // or combine them if needed
            totalRequest: 0,
            totalRejected: 0,
            totalSubmit: 0,
            totalDelivered: 0,
            totalFailed: 0,
            totalAwaited: 0,
          };
        }
        aggregatedMap[key].totalRequest += Number(item.totalRequest || 0);
        aggregatedMap[key].totalRejected += Number(item.totalRejected || 0);
        aggregatedMap[key].totalSubmit += Number(item.totalSubmit || 0);
        aggregatedMap[key].totalDelivered += Number(item.totalDelivered || 0);
        aggregatedMap[key].totalFailed += Number(item.totalFailed || 0);
        aggregatedMap[key].totalAwaited += Number(item.totalAwaited || 0);
      });
      processedRows = Object.values(aggregatedMap);

    } else if (selectedUser.length === 0 && selectedSenderId.length > 0) {
      // Case C: Only Sender ID selected -> Group by Date + Sender ID
      const aggregatedMap = {};
      matchedRows.forEach((item) => {
        const sId = item.senderId || "-";
        const date = item.summaryDate;
        const key = `${date}_${sId}`;

        if (!aggregatedMap[key]) {
          aggregatedMap[key] = {
            summaryDate: date,
            username: "-",
            senderId: sId,
            totalRequest: 0,
            totalRejected: 0,
            totalSubmit: 0,
            totalDelivered: 0,
            totalFailed: 0,
            totalAwaited: 0,
          };
        }
        aggregatedMap[key].totalRequest += Number(item.totalRequest || 0);
        aggregatedMap[key].totalRejected += Number(item.totalRejected || 0);
        aggregatedMap[key].totalSubmit += Number(item.totalSubmit || 0);
        aggregatedMap[key].totalDelivered += Number(item.totalDelivered || 0);
        aggregatedMap[key].totalFailed += Number(item.totalFailed || 0);
        aggregatedMap[key].totalAwaited += Number(item.totalAwaited || 0);
      });
      processedRows = Object.values(aggregatedMap);

    } else {
      // Case D: Both User and Sender ID selected -> Keep granular rows separate (grouped by Date + User + SenderID)
      const aggregatedMap = {};
      matchedRows.forEach((item) => {
        const uname = item.username || item.clientName || "-";
        const sId = item.senderId || "-";
        const date = item.summaryDate;
        const key = `${date}_${uname}_${sId}`;

        if (!aggregatedMap[key]) {
          aggregatedMap[key] = {
            summaryDate: date,
            username: uname,
            senderId: sId,
            totalRequest: 0,
            totalRejected: 0,
            totalSubmit: 0,
            totalDelivered: 0,
            totalFailed: 0,
            totalAwaited: 0,
          };
        }
        aggregatedMap[key].totalRequest += Number(item.totalRequest || 0);
        aggregatedMap[key].totalRejected += Number(item.totalRejected || 0);
        aggregatedMap[key].totalSubmit += Number(item.totalSubmit || 0);
        aggregatedMap[key].totalDelivered += Number(item.totalDelivered || 0);
        aggregatedMap[key].totalFailed += Number(item.totalFailed || 0);
        aggregatedMap[key].totalAwaited += Number(item.totalAwaited || 0);
      });
      processedRows = Object.values(aggregatedMap);
    }

    // Step 3: Apply Sorting if a sort field is active
    if (sortField) {
      processedRows.sort((a, b) => {
        const valA = Number(a[sortField] || 0);
        const valB = Number(b[sortField] || 0);
        if (valA < valB) return sortDirection === "asc" ? -1 : 1;
        if (valA > valB) return sortDirection === "asc" ? 1 : -1;
        return 0;
      });
    } else {
      processedRows.sort((a, b) => new Date(b.summaryDate) - new Date(a.summaryDate));
    }

    return processedRows;
  }, [gridData, selectedUser, selectedSenderId, sortField, sortDirection]);

  // Filtered lists for custom search dropdowns
  const filteredUsers = useMemo(() => {
    return userList.filter((user) =>
      user.toLowerCase().includes(userSearchTerm.toLowerCase())
    );
  }, [userList, userSearchTerm]);

  const filteredSenders = useMemo(() => {
    return senderList.filter((sender) =>
      sender.toLowerCase().includes(senderSearchTerm.toLowerCase())
    );
  }, [senderList, senderSearchTerm]);

  const handleSearch = () => {
    setCurrentPage(1);
    fetchSummaryReport();
  };

const handleReset = () => {
    const today = getTodayIST();
    setSelectedUser([]);
    setSelectedSenderId([]);
    setFromDate(today);
    setToDate(today);
    setCurrentPage(1);

    // Pass the fresh reset values directly into the fetch call
    fetchSummaryReport({
      loggedInUserName: userData.username,
      fromDate: today,
      toDate: today,
      userName: undefined,
      senderId: undefined,
    });
  };

  // Percentage Helper (Calculated against Total Submit)
  const calculatePercentage = (val, submitVal) => {
    const num = Number(val) || 0;
    const sub = Number(submitVal) || 0;
    if (sub === 0) return "0.0%";
    return `${((num / sub) * 100).toFixed(1)}%`;
  };

  // Totals Calculation for Footer (derived from filteredGridData)
  const totals = useMemo(() => {
    return filteredGridData.reduce(
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
  }, [filteredGridData]);

  // Pagination Logic (derived from filteredGridData)
  const totalRecords = filteredGridData.length;
  const totalPages = Math.ceil(totalRecords / rowsPerPage) || 1;
  const indexOfLastRow = currentPage * rowsPerPage;
  const indexOfFirstRow = indexOfLastRow - rowsPerPage;

  const currentRows = useMemo(() => {
    return filteredGridData.slice(indexOfFirstRow, indexOfLastRow);
  }, [filteredGridData, indexOfFirstRow, indexOfLastRow]);

  // Truncated Pagination Number Generator
  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1);

      if (currentPage > 3) {
        pages.push("LEFT_DOTS");
      }

      let start = Math.max(2, currentPage - 1);
      let end = Math.min(totalPages - 1, currentPage + 1);

      if (currentPage <= 3) {
        end = 3;
      }
      if (currentPage >= totalPages - 2) {
        start = totalPages - 2;
      }

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      if (currentPage < totalPages - 2) {
        pages.push("RIGHT_DOTS");
      }

      pages.push(totalPages);
    }

    return pages;
  };

  const baseColumns = 7; // DATE, REQUEST, REJECTED, SUBMIT, DELIVERED, FAILED, AWAITED
  const activeExtraColumnsCount =
    (showUserColumn ? 1 : 0) + (showSenderColumn ? 1 : 0);
  const totalColumns = baseColumns + activeExtraColumnsCount;

  // Inside your SummaryReport component:
  const userDropdownRef = useRef(null);
  const senderDropdownRef = useRef(null);

  // Close User Dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userDropdownRef.current && !userDropdownRef.current.contains(event.target)) {
        setIsUserOpen(false);
      }
    };
    if (isUserOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isUserOpen]);

  // Close Sender Dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (senderDropdownRef.current && !senderDropdownRef.current.contains(event.target)) {
        setIsSenderOpen(false);
      }
    };
    if (isSenderOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isSenderOpen]);


  //Download functionality
  const downloadFile = (content, fileName, mimeType) => {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Export full filtered dataset as CSV
  const handleDownloadCSV = () => {
    if (!filteredGridData || filteredGridData.length === 0) return;

    const headers = ["Summary Date", "Total Request", "Total Rejected", "Total Submit", "Total Delivered", "Total Failed", "Total Awaited"];
    if (showUserColumn) headers.splice(1, 0, "Client Name");
    if (showSenderColumn) headers.splice(showUserColumn ? 2 : 1, 0, "Sender ID");

    const csvRows = [headers.join(",")];

    filteredGridData.forEach((row) => {
      const values = [
        row.summaryDate,
        ...(showUserColumn ? [row.username || "-"] : []),
        ...(showSenderColumn ? [row.senderId || "-"] : []),
        row.totalRequest || 0,
        row.totalRejected || 0,
        row.totalSubmit || 0,
        row.totalDelivered || 0,
        row.totalFailed || 0,
        row.totalAwaited || 0,
      ];
      csvRows.push(values.join(","));
    });

    downloadFile(csvRows.join("\n"), `Summary_Report_${fromDate}_to_${toDate}.csv`, "text/csv;charset=utf-8;");
  };

  // Export full filtered dataset as simulated XLSX (Tab-separated format recognized by Excel)
  const handleDownloadXLSX = () => {
    if (!filteredGridData || filteredGridData.length === 0) return;

    const headers = ["Summary Date", "Total Request", "Total Rejected", "Total Submit", "Total Delivered", "Total Failed", "Total Awaited"];
    if (showUserColumn) headers.splice(1, 0, "Client Name");
    if (showSenderColumn) headers.splice(showUserColumn ? 2 : 1, 0, "Sender ID");

    const excelRows = [headers.join("\t")];

    filteredGridData.forEach((row) => {
      const values = [
        row.summaryDate,
        ...(showUserColumn ? [row.username || "-"] : []),
        ...(showSenderColumn ? [row.senderId || "-"] : []),
        row.totalRequest || 0,
        row.totalRejected || 0,
        row.totalSubmit || 0,
        row.totalDelivered || 0,
        row.totalFailed || 0,
        row.totalAwaited || 0,
      ];
      excelRows.push(values.join("\t"));
    });

    downloadFile(excelRows.join("\n"), `Summary_Report_${fromDate}_to_${toDate}.xls`, "application/vnd.ms-excel;charset=utf-8;");
  };

  return (
    <div className="summary-report">
      <div className="summary-report-header">
        <h1>Summary Report</h1>
        <p>
          Home / Reports / Summary Report · Per-user, per-day delivery summary
        </p>
      </div>

      <div className="summary-filter-card">
        <div className="summary-filter-field user-field" ref={userDropdownRef}>
          <label>User Name / Client Name</label>
          <div className="custom-summary-dropdown">
            <button
              type="button"
              className={`summary-dropdown-trigger ${isUserOpen ? "active" : ""}`}
              onClick={() => setIsUserOpen((prev) => !prev)}
            >
              <span className={`trigger-text ${selectedUser.length === 0 ? "placeholder" : ""}`}>
                {selectedUser.length === 0
                  ? "All Clients"
                  : selectedUser.length === 1
                  ? selectedUser[0]
                  : `${selectedUser.length} selected`}
              </span>
              {isUserOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>

            {isUserOpen && (
              <div className="summary-dropdown-menu">
                <div className="summary-dropdown-search-container">
                  <input
                    type="text"
                    className="summary-dropdown-search-input"
                    placeholder="Search user / client..."
                    value={userSearchTerm}
                    onChange={(e) => setUserSearchTerm(e.target.value)}
                    autoFocus
                  />
                </div>

                <div className="manage-dropdown-options-list">
                  {/* Select All Option */}
                  <div
                    className="manage-dropdown-option"
                    style={{ borderBottom: "1px solid #eee", fontWeight: "500" }}
                    onClick={() => {
                      if (selectedUser.length === userList.length) {
                        setSelectedUser([]);
                      } else {
                        setSelectedUser([...userList]);
                      }
                      setCurrentPage(1);
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={userList.length > 0 && selectedUser.length === userList.length}
                      readOnly
                      style={{ marginRight: "8px" }}
                    />
                    Select All
                  </div>

                  {userList
                    .filter((u) => u.toLowerCase().includes(userSearchTerm.toLowerCase()))
                    .map((user, idx) => (
                      <div
                        key={idx}
                        className="manage-dropdown-option"
                        onClick={() => {
                          setSelectedUser((prev) =>
                            prev.includes(user)
                              ? prev.filter((item) => item !== user)
                              : [...prev, user]
                          );
                          setCurrentPage(1);
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={selectedUser.includes(user)}
                          readOnly
                          style={{ marginRight: "8px" }}
                        />
                        {user}
                      </div>
                    ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Sender ID Custom Dropdown */}
       <div className="summary-filter-field sender-field" ref={senderDropdownRef}>
          <label>Sender ID</label>
          <div className="custom-summary-dropdown">
            <button
              type="button"
              className={`summary-dropdown-trigger ${isSenderOpen ? "active" : ""}`}
              onClick={() => setIsSenderOpen((prev) => !prev)}
            >
              <span className={`trigger-text ${selectedSenderId.length === 0 ? "placeholder" : ""}`}>
                {selectedSenderId.length === 0
                  ? "All Sender IDs"
                  : selectedSenderId.length === 1
                  ? selectedSenderId[0]
                  : `${selectedSenderId.length} selected`}
              </span>
              {isSenderOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>

            {isSenderOpen && (
              <div className="summary-dropdown-menu">
                <div className="summary-dropdown-search-container">
                  <input
                    type="text"
                    className="summary-dropdown-search-input"
                    placeholder="Search sender ID..."
                    value={senderSearchTerm}
                    onChange={(e) => setSenderSearchTerm(e.target.value)}
                    autoFocus
                  />
                </div>

                <div className="manage-dropdown-options-list">
                  {/* Select All Option */}
                  <div
                    className="manage-dropdown-option"
                    style={{ borderBottom: "1px solid #eee", fontWeight: "500" }}
                    onClick={() => {
                      if (selectedSenderId.length === senderList.length) {
                        setSelectedSenderId([]);
                      } else {
                        setSelectedSenderId([...senderList]);
                      }
                      setCurrentPage(1);
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={senderList.length > 0 && selectedSenderId.length === senderList.length}
                      readOnly
                      style={{ marginRight: "8px" }}
                    />
                    Select All
                  </div>

                  {senderList
                    .filter((s) => s.toLowerCase().includes(senderSearchTerm.toLowerCase()))
                    .map((sender, idx) => (
                      <div
                        key={idx}
                        className="manage-dropdown-option"
                        onClick={() => {
                          setSelectedSenderId((prev) =>
                            prev.includes(sender)
                              ? prev.filter((item) => item !== sender)
                              : [...prev, sender]
                          );
                          setCurrentPage(1);
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={selectedSenderId.includes(sender)}
                          readOnly
                          style={{ marginRight: "8px" }}
                        />
                        {sender}
                      </div>
                    ))}
                </div>
              </div>
            )}
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
              max={todayIST}
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
              max={todayIST}
              min={fromDate}
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
          
         {!loading && (selectedUser.length > 0 || selectedSenderId.length > 0) && filteredGridData.length > 0 && (
          <div style={{ display: "inline-flex", gap: "8px", marginLeft: "auto" }}>
            <button
              type="button"
              className="summary-reset-btn"
              onClick={handleDownloadCSV}
              style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}
            >
              <Download size={14} /> CSV
            </button>
            <button
              type="button"
              className="summary-reset-btn"
              onClick={handleDownloadXLSX}
              style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}
            >
              <Download size={14} /> XLSX
            </button>
          </div>
        )}
        </div>
      </div>

      {!loading && filteredGridData.length === 0 ? (
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

                  {[
                    { label: "TOTAL REQUEST", field: "totalRequest" },
                    { label: "TOTAL REJECTED", field: "totalRejected" },
                    { label: "TOTAL SUBMIT", field: "totalSubmit" },
                    { label: "TOTAL DELIVERED", field: "totalDelivered" },
                    { label: "TOTAL FAILED", field: "totalFailed" },
                    { label: "TOTAL AWAITED", field: "totalAwaited" },
                  ].map((col) => (
                    <th
                      key={col.field}
                      onClick={() => handleSort(col.field)}
                      style={{ cursor: "pointer", userSelect: "none" }}
                    >
                      <div style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}>
                        {col.label}
                        <span style={{ display: "inline-flex", flexDirection: "column", fontSize: "10px", lineHeight: "8px" }}>
                          <ArrowUp
                            size={10}
                            color={sortField === col.field && sortDirection === "asc" ? "#000" : "#ccc"}
                          />
                          <ArrowDown
                            size={10}
                            color={sortField === col.field && sortDirection === "desc" ? "#000" : "#ccc"}
                          />
                        </span>
                      </div>
                    </th>
                  ))}
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
                        {Number(row.totalRequest || 0).toLocaleString()}
                      </td>
                      <td className="summary-number">
                        {Number(row.totalRejected || 0).toLocaleString()}
                      </td>
                      <td className="summary-number">
                        {Number(row.totalSubmit || 0).toLocaleString()}
                      </td>

                      <td className="summary-delivered-cell">
                        <strong>
                          {Number(row.totalDelivered || 0).toLocaleString()}
                        </strong>
                        <span>
                          {calculatePercentage(
                            row.totalDelivered,
                            row.totalSubmit
                          )}
                        </span>
                      </td>

                      <td className="summary-failed-cell">
                        <strong>
                          {Number(row.totalFailed || 0).toLocaleString()}
                        </strong>
                        <span>
                          {calculatePercentage(
                            row.totalFailed,
                            row.totalSubmit
                          )}
                        </span>
                      </td>

                      <td className="summary-awaited-cell">
                        <strong>
                          {Number(row.totalAwaited || 0).toLocaleString()}
                        </strong>
                        <span>
                          {calculatePercentage(
                            row.totalAwaited,
                            row.totalSubmit
                          )}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>

              {!loading && filteredGridData.length > 0 && (
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
                      <strong>
                        {totals.totalDelivered.toLocaleString()}
                      </strong>
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
                {/* Previous Page Arrow */}
                <button
                  type="button"
                  className={`summary-page-arrow ${
                    currentPage === 1 ? "disabled" : ""
                  }`}
                  disabled={currentPage === 1}
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(prev - 1, 1))
                  }
                >
                  ‹
                </button>

                {/* Page Numbers & Ellipses */}
                {getPageNumbers().map((page, idx) => {
                  if (page === "LEFT_DOTS" || page === "RIGHT_DOTS") {
                    return (
                      <span
                        key={`dots-${idx}`}
                        className="summary-pagination-dots"
                      >
                        ...
                      </span>
                    );
                  }

                  return (
                    <button
                      key={page}
                      type="button"
                      className={`summary-page ${
                        currentPage === page ? "active" : ""
                      }`}
                      onClick={() => setCurrentPage(page)}
                    >
                      {page}
                    </button>
                  );
                })}

                {/* Next Page Arrow */}
                <button
                  type="button"
                  className={`summary-page-arrow ${
                    currentPage === totalPages || totalPages === 0
                      ? "disabled"
                      : ""
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