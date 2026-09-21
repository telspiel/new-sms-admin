import { useContext, useEffect, useState } from "react";
import "./DownloadReport.css";
import { AuthContext } from "../../context/AuthContext";
import Endpoints from "../../api/endpoint";

const DownloadReport = () => {

  const { userData } = useContext(AuthContext);

  // Date Utilities
  const getTodayISO = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const formatDateToDDMMYYYY = (isoDate) => {
    if (!isoDate) return "";
    const [year, month, day] = isoDate.split("-");
    return `${day}-${month}-${year}`;
  };

  const [clientList, setClientList] = useState([]);
  const [clientSearch, setClientSearch] = useState("");
  const [selectedClient, setSelectedClient] = useState("");
  const [showClientDropdown, setShowClientDropdown] = useState(false);

  const [fromDate, setFromDate] = useState(getTodayISO());
  const [toDate, setToDate] = useState(getTodayISO());

  const [reportsGrid, setReportsGrid] = useState([]);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);

  //=========API to get all client name list=============
  const getAllUsers = async () => {
    try {
      const payload = {
        loggedInUserName: userData?.username,
      };

      const response = await Endpoints.post("getAllUsers", payload);

      if (response?.code === 14000) {
        setClientList(response?.data?.clientList || []);
      } else {
        setClientList([]);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
      setClientList([]);
    }
  };

  // ========= API to Fetch / Generate Reports =============
  const fetchDownloadReport = async (overrideClient = selectedClient, passDates = true) => {
    if (!userData?.username) return;

    setLoading(true);
    try {
      const payload = {
        fromDate: passDates ? formatDateToDDMMYYYY(fromDate) : formatDateToDDMMYYYY(getTodayISO()),
        toDate: passDates ? formatDateToDDMMYYYY(toDate) : formatDateToDDMMYYYY(getTodayISO()),
        username: userData.username,
        clientName: overrideClient || "",
        mobileNumber: "",
        pageNumber: 1,
      };

      const response = await Endpoints.post("downloadReport", payload);

      if (response?.code === 1000) {
        setReportsGrid(response?.data?.grid || []);
      } else {
        setReportsGrid([]);
      }
    } catch (error) {
      console.error("Error fetching download report:", error);
      setReportsGrid([]);
    } finally {
      setLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    if (userData?.username) {
      getAllUsers();
      fetchDownloadReport("", false); // Call by default on page mount
    }
  }, [userData?.username]);

 const handleClientSelect = (client) => {
    setSelectedClient(client);
    setClientSearch(client);
    setShowClientDropdown(false);

    // Call downloadReport immediately on selecting client with clientName and username
    fetchDownloadReport(client, true);
  };

  const handleGenerateReport = async () => {
    if (!selectedClient) {
      alert("Please select a client name first.");
      return;
    }

    setGenerating(true);
    try {
      const generatePayload = {
        clientName: selectedClient,
        fromDate: formatDateToDDMMYYYY(fromDate),
        toDate: formatDateToDDMMYYYY(toDate),
        username: userData?.username,
      };

      // Step A: Call generateReport API
      const response = await Endpoints.post("generateReport", generatePayload);

      // Step B: Immediately fetch downloadReport with full payload filters
      await fetchDownloadReport(selectedClient, true);
    } catch (error) {
      console.error("Error generating report:", error);
    } finally {
      setGenerating(false);
    }
  };

  // Filter clients for dropdown
  const filteredClients = clientList.filter((client) =>
    client.toLowerCase().includes(clientSearch.toLowerCase())
  );

  // Reset filter controls
  const handleReset = () => {
    const defaultDate = getTodayISO();
    setFromDate(defaultDate);
    setToDate(defaultDate);
    setSelectedClient("");
    setClientSearch("");
  };


  return (
   <div className="download-report">
      <div className="download-report-header">
        <h1>Download Report</h1>
        <p>
          Home / Reports / Download Report · Build a custom export and choose
          your format
        </p>
      </div>

      <div className="download-filter-card">
        {/* Client Selection Field */}
        <div className="download-filter-field client-field">
        <label>
          Client name <span>*</span>
        </label>

        <div className="download-select">
          {/* Main Dropdown Trigger Field */}
          <div
            className="download-select-trigger"
            onClick={() => setShowClientDropdown((prev) => !prev)}
          >
            <input
              type="text"
              value={selectedClient || "Type to search..."}
              readOnly
              placeholder="Type to search..."
            />
            <i
              className={`fa-solid ${
                showClientDropdown ? "fa-chevron-up" : "fa-chevron-down"
              }`}
            ></i>
          </div>

          {/* Dropdown Menu with Nested Search Input */}
          {showClientDropdown && (
            <div className="client-dropdown">
              <div className="client-dropdown-search">
                <input
                  type="text"
                  value={clientSearch}
                  placeholder="Search client..."
                  onChange={(e) => setClientSearch(e.target.value)}
                  autoFocus
                />
              </div>

              <div className="client-dropdown-options-list">
                {filteredClients.length > 0 ? (
                  filteredClients.map((client, index) => (
                    <div
                      key={index}
                      className={`client-dropdown-option ${
                        selectedClient === client ? "selected" : ""
                      }`}
                      onClick={() => {
                        handleClientSelect(client);
                        setClientSearch(""); // Reset search after selection
                      }}
                    >
                      {client}
                    </div>
                  ))
                ) : (
                  <div className="client-no-result">No client found</div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

        {/* From Date Input */}
        <div className="download-filter-field date-field">
          <label>
            From <span>*</span>
          </label>

          <div className="download-date-input">
            <input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
            />
          </div>
        </div>

        {/* To Date Input */}
        <div className="download-filter-field date-field">
          <label>
            To <span>*</span>
          </label>

          <div className="download-date-input">
            <input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="download-action-buttons">
        <button
          className="generate-download-btn"
          onClick={handleGenerateReport}
          disabled={generating || loading}
        >
          <i className="fa-solid fa-download"></i>
          {generating ? " Generating..." : " Generate Download Link"}
        </button>

        <button className="download-reset-btn" onClick={handleReset}>
          Reset
        </button>
      </div>

      {/* Report Table */}
      <div className="download-table-wrapper">
        <table className="download-table">
          <thead>
            <tr>
              <th>FROM DATE</th>
              <th>TO DATE</th>
              <th>CLIENT</th>
              <th>STATUS</th>
              <th>DOWNLOAD REPORT LINK</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan="5" style={{ textAlign: "center", padding: "20px" }}>
                  Loading reports...
                </td>
              </tr>
            ) : reportsGrid.length > 0 ? (
              reportsGrid.map((item, index) => (
                <tr key={index}>
                  <td>{item.fromDate}</td>
                  <td>{item.toDate}</td>
                  <td>{selectedClient || item.clientName || userData?.username}</td>
                  <td>
                    <span
                      className={`download-status ${
                        item.status?.toLowerCase() === "ready" ? "ready" : "pending"
                      }`}
                    >
                      {item.status}
                    </span>
                  </td>
                  <td>
                    {item.downloadReportLink ? (
                      <a
                        href={item.downloadReportLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="download-link"
                      >
                        <span className="csv-badge">CSV</span>
                        <span>Download</span>
                      </a>
                    ) : (
                      <span>N/A</span>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" style={{ textAlign: "center", padding: "20px" }}>
                  No reports available
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DownloadReport;