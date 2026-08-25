import React, { useState, useEffect, useContext, useMemo } from "react";
import Endpoints from "../../api/endpoint";
import { AuthContext } from "../../context/AuthContext";
import "./SmppManagement.css";
import { ChevronLeft, ChevronRight, X } from "lucide-react";

const SmppManagement = () => {
  const { userData } = useContext(AuthContext);

  // States
  const [sessionData, setSessionData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedDetails, setSelectedDetails] = useState(null);

  // Sorting state
  const [sortConfig, setSortConfig] = useState({
    key: "username",
    direction: "asc",
  });

  // Fetch API Data
  const fetchSmppStatus = async () => {
    if (!userData?.username) return;
    setLoading(true);

    try {
      const payload = { username: userData.username };
      const response = await Endpoints.post("smppStatus", payload);

      if (response && response.smppResult) {
        const parsedList = [];

        Object.entries(response.smppResult).forEach(([smppServer, valueStr]) => {
          try {
            const parsedData = JSON.parse(valueStr);

            Object.values(parsedData).forEach((clientObj) => {
              parsedList.push({
                smppServer: smppServer.split(":")[0],
                username: clientObj.username,
                txCount: clientObj.sessionStats?.txSessionCount || 0,
                rxCount: clientObj.sessionStats?.rxSessionCount || 0,
                trxCount: clientObj.sessionStats?.trxSessionCount || 0,
                submitTps: clientObj.sessionStats?.submitTps || 0,
                deliverTps: clientObj.sessionStats?.deliverTps || 0,
                details: clientObj.sessionStatsDetails || {},
              });
            });
          } catch (e) {
            console.error("Error parsing node JSON:", e);
          }
        });

        setSessionData(parsedList);
      }
    } catch (error) {
      console.error("Failed to fetch SMPP status:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSmppStatus();
  }, [userData]);

  // Sorting Handler
  const handleSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  // Filtered & Sorted Data
  const filteredAndSortedData = useMemo(() => {
    let data = sessionData.filter((item) =>
      item.username?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (sortConfig.key) {
      data.sort((a, b) => {
        let aVal = a[sortConfig.key];
        let bVal = b[sortConfig.key];

        if (!isNaN(Number(aVal)) && !isNaN(Number(bVal))) {
          aVal = Number(aVal);
          bVal = Number(bVal);
        }

        if (aVal < bVal) return sortConfig.direction === "asc" ? -1 : 1;
        if (aVal > bVal) return sortConfig.direction === "asc" ? 1 : -1;
        return 0;
      });
    }

    return data;
  }, [sessionData, searchTerm, sortConfig]);

  // Pagination Math
  const totalRecords = filteredAndSortedData.length;
  const totalPages = Math.ceil(totalRecords / rowsPerPage) || 1;
  const startIndex = (currentPage - 1) * rowsPerPage;
  const paginatedData = filteredAndSortedData.slice(
    startIndex,
    startIndex + rowsPerPage
  );

  // Dynamic Pagination Buttons
  const getPageNumbers = () => {
    const pages = [];
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (currentPage > 3) pages.push("...");
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);
      for (let i = start; i <= end; i++) pages.push(i);
      if (currentPage < totalPages - 2) pages.push("...");
      pages.push(totalPages);
    }
    return pages;
  };

  // Helper renderer for modal tables
  const renderDetailTable = (title, list = []) => (
    <div className="detail-section">
      <h3 className="detail-title">{title}</h3>
      <div className="detail-table-wrapper">
        <table className="detail-table">
          <thead>
            <tr>
              <th>BIND STATUS <span>↕</span></th>
              <th>BIND TIME <span>↕</span></th>
              <th>BIND TYPE <span>↕</span></th>
              <th>ISALIVE <span>↕</span></th>
              <th>REMOTE ADDRESS <span>↕</span></th>
            </tr>
          </thead>
          <tbody>
            {list && list.length > 0 ? (
              list.map((item, idx) => (
                <tr key={idx}>
                  <td>
                    <span className="badge-bound">
                      {item.bindStatus || "BOUND"}
                    </span>
                  </td>
                  <td>{item.bindTime || "-"}</td>
                  <td>{item.bindType || "-"}</td>
                  <td className="font-bold">{String(item.isAlive ?? true)}</td>
                  <td>{item.remoteAddress || "-"}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="text-center">
                  No records found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );

  return (
    <div className="smpp-management">
      <div className="smpp-management-header">
        <h1>SMPP Session Management</h1>
        <p>
          Home / Routing Management / SMPP Session Management · Live SMPP bind
          sessions per client, with drill-down and unbind controls
        </p>
      </div>
      <div className="smpp-card">
        <div className="smpp-controls">
          <div className="entries-selector">
            <span>Show</span>
            <select
              value={rowsPerPage}
              onChange={(e) => {
                setRowsPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
            >
              <option value="10">10</option>
              <option value="25">25</option>
              <option value="50">50</option>
              <option value="100">100</option>
            </select>
            <span>entries</span>
          </div>

          <div className="search-box">
            <label htmlFor="search">Search:</label>
            <input
              id="search"
              type="text"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
            />
          </div>
        </div>

        <div className="table-responsive">
          <table className="smpp-table">
            <thead>
              <tr>
                <th onClick={() => handleSort("username")}>
                  CLIENT NAME <span>↕</span>
                </th>
                <th onClick={() => handleSort("smppServer")}>
                  SMPP <span>↕</span>
                </th>
                <th onClick={() => handleSort("txCount")}>
                  TX <span>↕</span>
                </th>
                <th onClick={() => handleSort("rxCount")}>
                  RX <span>↕</span>
                </th>
                <th onClick={() => handleSort("trxCount")}>
                  TRX <span>↕</span>
                </th>
                <th onClick={() => handleSort("submitTps")}>
                  SUBMIT TPS <span>↕</span>
                </th>
                <th onClick={() => handleSort("deliverTps")}>
                  DELIVER TPS <span>↕</span>
                </th>
                <th>ACTION</th>
                <th>ACTION2</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                <td colSpan="9">
                    <div className="table-loader">
                    <div className="spinner"></div>
                    <p>Loading SMPP sessions...</p>
                    </div>
                </td>
                </tr>
              ) : paginatedData.length > 0 ? (
                paginatedData.map((row, index) => (
                  <tr key={index}>
                    <td>{row.username}</td>
                    <td>{row.smppServer}</td>
                    <td>{row.txCount}</td>
                    <td>{row.rxCount}</td>
                    <td>{row.trxCount}</td>
                    <td>{row.submitTps}</td>
                    <td>{row.deliverTps}</td>
                    <td>
                      <button
                        className="btn-detail"
                        onClick={() => setSelectedDetails(row)}
                      >
                        Show Detail
                      </button>
                    </td>
                    <td>
                      <button className="btn-unbind">Unbind</button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="9" style={{ textAlign: "center", padding: "20px" }}>
                    No sessions found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="smpp-footer">
          <div className="pagination-info">
            Showing {totalRecords === 0 ? 0 : startIndex + 1} to{" "}
            {Math.min(startIndex + rowsPerPage, totalRecords)} of {totalRecords}{" "}
            entries
          </div>

          <div className="pagination">
            <button
              className={`pagination-btn icon-btn ${currentPage === 1 ? "disabled" : ""}`}
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              aria-label="Previous Page"
            >
              <ChevronLeft size={16} />
            </button>

            {getPageNumbers().map((page, index) =>
              page === "..." ? (
                <span key={index} className="pagination-dots">
                  ...
                </span>
              ) : (
                <button
                  key={index}
                  className={`pagination-btn ${
                    currentPage === page ? "active" : ""
                  }`}
                  onClick={() => setCurrentPage(page)}
                >
                  {page}
                </button>
              )
            )}

            <button
              className={`pagination-btn icon-btn ${
                currentPage >= totalPages ? "disabled" : ""
              }`}
              onClick={() =>
                setCurrentPage((prev) => Math.min(prev + 1, totalPages))
              }
              disabled={currentPage >= totalPages || totalPages === 0}
              aria-label="Next Page"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Detailed View Modal */}
      {selectedDetails && (
        <div className="smpp-modal-overlay">
          <div className="smpp-modal-content">
            <div className="smpp-modal-header">
              <div>
                <h2>Detailed View</h2>
                <p className="modal-subtitle">
                  {selectedDetails.username} · {selectedDetails.smppServer}
                </p>
              </div>
              <button
                className="modal-close-btn"
                onClick={() => setSelectedDetails(null)}
              >
                <X size={18} />
              </button>
            </div>

            <div className="smpp-modal-body">
              {renderDetailTable(
                "RX SESSION DETAILS LIST",
                selectedDetails.details?.rxSessionDetailsList ||
                  selectedDetails.details?.rxList
              )}

              {renderDetailTable(
                "TX SESSION DETAILS LIST",
                selectedDetails.details?.txSessionDetailsList ||
                  selectedDetails.details?.txList
              )}

              {renderDetailTable(
                "TRX SESSION DETAILS LIST",
                selectedDetails.details?.trxSessionDetailsList ||
                  selectedDetails.details?.trxList
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SmppManagement;