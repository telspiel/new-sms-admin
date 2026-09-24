import React, { useEffect, useState, useContext, useMemo } from "react";
import "./ErrorCodeReport.css";
import Endpoints from "../../api/endpoint";
import { AuthContext } from "../../context/AuthContext";

const ErrorCodeReport = () => {
  const { userData } = useContext(AuthContext);
  
  // Format YYYY-MM-DD string into YYYY-M-D or YYYY-MM-DD
  const formatDateToYYYYMMDD = (dateString) => {
    if (!dateString) return "";
    const [year, month, day] = dateString.split("-");
    // parseInt strips leading zeros to produce formats like 2026-8-21
    return `${year}-${parseInt(month, 10)}-${parseInt(day, 10)}`;
  };

  const getDefaultDates = () => {
    const today = new Date();
    const prior = new Date();
    prior.setDate(today.getDate() - 7);

    return {
      fromDate: prior.toISOString().split("T")[0],
      toDate: today.toISOString().split("T")[0],
    };
  };

  const initialDates = getDefaultDates();

  const [fromDate, setFromDate] = useState(initialDates.fromDate);
  const [toDate, setToDate] = useState(initialDates.toDate);
  const [selectedUser, setSelectedUser] = useState("");
  const [selectedErrorCode, setSelectedErrorCode] = useState("");

  const [reportData, setReportData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  const fetchErrorCodeReport = async () => {
    if (!userData?.username) return;

    setIsLoading(true);
    setErrorMessage("");

    try {
      const payload = {
        loggedInUserName: userData.username,
        fromDate: formatDateToYYYYMMDD(fromDate),
        toDate: formatDateToYYYYMMDD(toDate),
      };

      const response = await Endpoints.post("errorcodeReport", payload);

      if (response.code === 21000) {
        setReportData(response.grid || []);
      } else {
        setReportData([]);
        setErrorMessage(
          response.message || "Unable to fetch error code report."
        );
      }
    } catch (error) {
      console.error(error);
      setReportData([]);
      setErrorMessage("Something went wrong while fetching data.");
    } finally {
      setIsLoading(false);
      setCurrentPage(1);
    }
  };

  useEffect(() => {
    fetchErrorCodeReport();
  }, []);

  const userOptions = useMemo(() => {
    const users = reportData.map((item) => item.username).filter(Boolean);
    return Array.from(new Set(users));
  }, [reportData]);

  const errorCodeOptions = useMemo(() => {
    const codes = reportData.map((item) => item.errorCode).filter(Boolean);
    return Array.from(new Set(codes));
  }, [reportData]);

  const filteredData = useMemo(() => {
    return reportData.filter((item) => {
      const matchesUser = selectedUser ? item.username === selectedUser : true;
      const matchesCode = selectedErrorCode
        ? String(item.errorCode) === String(selectedErrorCode)
        : true;
      return matchesUser && matchesCode;
    });
  }, [reportData, selectedUser, selectedErrorCode]);

  const grandTotalCount = useMemo(() => {
    return filteredData.reduce(
      (sum, item) => sum + (parseInt(item.count, 10) || 0),
      0
    );
  }, [filteredData]);

  const totalRecords = filteredData.length;
  const totalPages = Math.ceil(totalRecords / rowsPerPage) || 1;
  const startIndex = (currentPage - 1) * rowsPerPage;
  const currentTableData = filteredData.slice(
    startIndex,
    startIndex + rowsPerPage
  );

  // Helper function to generate pagination items with ellipses
const getPageNumbers = () => {
  const pages = [];
  const maxVisiblePages = 1; // Number of pages to show around current page

  if (totalPages <= 5) {
    // If 5 or fewer total pages, show all page numbers
    for (let i = 1; i <= totalPages; i++) {
      pages.push(i);
    }
  } else {
    // Always show first page
    pages.push(1);

    if (currentPage > maxVisiblePages + 2) {
      pages.push("...");
    }

    // Determine start and end of middle pages
    const startPage = Math.max(2, currentPage - maxVisiblePages);
    const endPage = Math.min(totalPages - 1, currentPage + maxVisiblePages);

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    if (currentPage < totalPages - (maxVisiblePages + 1)) {
      pages.push("...");
    }

    // Always show last page
    pages.push(totalPages);
  }

  return pages;
};

  const handleSearch = (e) => {
    e.preventDefault();
    fetchErrorCodeReport();
  };

  const handleReset = () => {
    const defaults = getDefaultDates();
    setFromDate(defaults.fromDate);
    setToDate(defaults.toDate);
    setSelectedUser("");
    setSelectedErrorCode("");
  };

  return (
    <div className="errorcode-report">
      <div className="errorcode-report-header">
        <h1>Error Code Wise Report</h1>
        <p>
          Home / Reports / Error Code Wise Report · Error-code wise failure
          breakdown, per user
        </p>
      </div>

      <form className="errorcode-filter-card" onSubmit={handleSearch}>
        {/* User Name Filter Dropdown */}
        <div className="errorcode-filter-field user-field">
          <label>User Name / Client Name</label>
          <div className="errorcode-select">
            <select
              value={selectedUser}
              onChange={(e) => {
                setSelectedUser(e.target.value);
                setCurrentPage(1); // Reset page on filter change
              }}
            >
              <option value="">All Users</option>
              {userOptions.map((user) => (
                <option key={user} value={user}>
                  {user}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Error Code Filter Dropdown */}
        <div className="errorcode-filter-field error-field">
          <label>Error Code</label>
          <div className="errorcode-select">
            <select
              value={selectedErrorCode}
              onChange={(e) => {
                setSelectedErrorCode(e.target.value);
                setCurrentPage(1); // Reset page on filter change
              }}
            >
              <option value="">All Error Codes</option>
              {errorCodeOptions.map((code) => (
                <option key={code} value={code}>
                  {code}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="errorcode-filter-field date-field">
          <label>
            From <span>*</span>
          </label>
          <div className="date-input-wrap">
            <input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              required
            />
          </div>
        </div>

        <div className="errorcode-filter-field date-field">
          <label>
            To <span>*</span>
          </label>
          <div className="date-input-wrap">
            <input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              required
            />
          </div>
        </div>

        <div className="errorcode-filter-actions">
          <button
            type="submit"
            className="errorcode-search-btn"
            disabled={isLoading}
          >
            {isLoading ? "Searching..." : "Search"}
          </button>
          <button
            type="button"
            className="errorcode-reset-btn"
            onClick={handleReset}
          >
            Reset
          </button>
        </div>
      </form>

      {/* <div className="errorcode-record-count">{totalRecords} records</div> */}

      <>
      {!isLoading && currentTableData.length > 0 && (
        <div className="errorcode-record-count">{totalRecords} records</div>
      )}

      {errorMessage && <div className="errorcode-error-msg">{errorMessage}</div>}

      {!isLoading && currentTableData.length === 0 ? (
        <div className="error-state-blacklist not-found-state" style={{ padding: "40px 20px", textAlign: "center" }}>
          <div className="errorCode-icon not-found-icon">
            <i className="fa-solid fa-magnifying-glass"></i>
          </div>

          <h2>No failures found</h2>

          <p>
            No failed messages match your filters in this date range. Try widening
            <br />
            number or keyword.
          </p>
        </div>
      ) : (
        <div className="errorcode-table-wrapper">
          <table className="errorcode-table">
            <thead>
              <tr>
                <th>DATE</th>
                <th>USERNAME</th>
                <th>ERROR CODE</th>
                <th>ERROR DESCRIPTION</th>
                <th>COUNT</th>
              </tr>
            </thead>

            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan="5">
                    <div className="table-loader">
                      <div className="spinner"></div>
                      <p>Loading Error Report...</p>
                    </div>
                  </td>
                </tr>
              ) : (
                currentTableData.map((item, index) => (
                  <tr key={index}>
                    <td>{item.date}</td>
                    <td>{item.username}</td>
                    <td>
                      <span className="error-code-badge">{item.errorCode}</span>
                    </td>
                    <td>{item.errorDesc}</td>
                    <td className="error-count">{item.count}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          {/* Hide summary footer during loading */}
          {!isLoading && (
            <div className="errorcode-pagination-summary">
              <div className="errorcode-total">
                <span>Total</span>
                <strong>({totalRecords} records)</strong>
              </div>

              <div className="errorcode-grand-total">
                {grandTotalCount.toLocaleString()}
              </div>
            </div>
          )}

          {/* Hide pagination buttons during loading */}
          {!isLoading && (
            <div className="errorcode-pagination">
              <div className="rows-per-page">
                <span>Rows per page</span>
                <select
                  value={rowsPerPage}
                  onChange={(e) => {
                    setRowsPerPage(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                >
                  <option value="25">25</option>
                  <option value="50">50</option>
                  <option value="100">100</option>
                </select>
              </div>

              <div className="showing-records">
                Showing {totalRecords === 0 ? 0 : startIndex + 1}–
                {Math.min(startIndex + rowsPerPage, totalRecords)} of {totalRecords}
              </div>

              <div className="pagination-buttons">
                <button
                  className={`pagination-arrow ${currentPage === 1 ? "disabled" : ""}`}
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                >
                  ‹
                </button>

                {getPageNumbers().map((page, index) => {
                  if (page === "...") {
                    return (
                      <span key={`dots-${index}`} className="pagination-dots">
                        ...
                      </span>
                    );
                  }

                  return (
                    <button
                      key={page}
                      className={`pagination-page ${currentPage === page ? "active" : ""}`}
                      onClick={() => setCurrentPage(page)}
                    >
                      {page}
                    </button>
                  );
                })}

                <button
                  className={`pagination-arrow ${
                    currentPage >= totalPages ? "disabled" : ""
                  }`}
                  onClick={() =>
                    setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                  }
                  disabled={currentPage >= totalPages || totalPages === 0}
                >
                  ›
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </>
    </div>
  );
};

export default ErrorCodeReport;