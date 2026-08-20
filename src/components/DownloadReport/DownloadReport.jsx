import { useContext, useEffect, useState } from "react";
import "./DownloadReport.css";
import { AuthContext } from "../../context/AuthContext";
import Endpoints from "../../api/endpoint";

const DownloadReport = () => {

  const { userData } = useContext(AuthContext);

  const [clientList, setClientList] = useState([]);
  const [clientSearch, setClientSearch] = useState("");
  const [selectedClient, setSelectedClient] = useState("");
  const [showClientDropdown, setShowClientDropdown] = useState(false);

  //=========API to get all client name list=============
   const getAllUsers = async () => {
    try {
      const payload = {
        loggedInUserName: userData.username,
      };

      const response = await Endpoints.post("getAllUsers", payload);

      console.log("getAllUsers response:", response);

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

  useEffect(() => {
    if (userData?.username) {
      getAllUsers();
    }
  }, [userData?.username]);

  // Filter clients according to search
  const filteredClients = clientList.filter((client) =>
    client.toLowerCase().includes(clientSearch.toLowerCase())
  );

  // Select client
  const handleClientSelect = (client) => {
    setSelectedClient(client);
    setClientSearch(client);
    setShowClientDropdown(false);
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
        <div className="download-filter-field client-field">
          <label>
            Client name <span>*</span>
          </label>

          <div className="download-select">
          <input
              type="text"
              value={clientSearch}
              placeholder="Type to search..."
              onChange={(e) => {
                setClientSearch(e.target.value);
                setSelectedClient("");
                setShowClientDropdown(true);
              }}
              onFocus={() => setShowClientDropdown(true)}
              autoComplete="off"
            />
            <i
              className={`fa-solid ${
                showClientDropdown ? "fa-chevron-up" : "fa-chevron-down"
              }`}
              onClick={() =>
                setShowClientDropdown((prev) => !prev)
              }
            ></i>

            {showClientDropdown && (
              <div className="client-dropdown">
                {filteredClients.length > 0 ? (
                  filteredClients.map((client, index) => (
                    <div
                      key={index}
                      className={`client-dropdown-option ${
                        selectedClient === client ? "selected" : ""
                      }`}
                      onClick={() => handleClientSelect(client)}
                    >
                      {client}
                    </div>
                  ))
                ) : (
                  <div className="client-no-result">
                    No client found
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="download-filter-field date-field">
          <label>
            From <span>*</span>
          </label>

          <div className="download-date-input">
            <input type="date" defaultValue="2026-07-01" />
          </div>
        </div>

        <div className="download-filter-field date-field">
          <label>
            To <span>*</span>
          </label>

          <div className="download-date-input">
            <input type="date" defaultValue="2026-07-07" />
          </div>
        </div>
      </div>

      <div className="download-action-buttons">
        <button className="generate-download-btn">
          <i className="fa-solid fa-download"></i>
          Generate Download Link
        </button>

        <button className="download-reset-btn">Reset</button>
      </div>

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
            <tr>
              <td>2026-07-01</td>
              <td>2026-07-07</td>
              <td>apidemo</td>
              <td>
                <span className="download-status">Ready</span>
              </td>
              <td>
                <div className="download-link">
                  <span className="csv-badge">CSV</span>
                  <span>Download</span>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DownloadReport;