import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../../context/AuthContext";
import "./DetailedMis.css";
import Endpoints from "../../api/endpoint";
import { ChevronDown, ChevronUp } from "lucide-react";

const DetailedMis = () => {

  const { userData } = useContext(AuthContext);

  // Client Data dropdown states
  const [clientList, setClientList] = useState([]);
  const [clientSearch, setClientSearch] = useState("");
  const [selectedClient, setSelectedClient] = useState("");
  const [showClientDropdown, setShowClientDropdown] = useState(false)


  //========API to get all Client Data================
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

      if (response.code === 14000) {
        setClientList(response.data?.clientList || []);
      } else {
        alert(response.message);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  // Call API when page loads
  useEffect(() => {
    if (userData?.username) {
      getAllUsers();
    }
  }, [userData?.username]);

   // Filter client list based on search text
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
    <div className="detailed-mis">
      {/* Page Header */}
      <div className="detailed-mis-header">
        <h1>Detailed MIS</h1>
        <p>
          Home / Reports / Detailed MIS · Message-level delivery detail
        </p>
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
                    setShowClientDropdown(true);
                  }}
                  onFocus={() => setShowClientDropdown(true)}
                  placeholder="Type to search..."
                  className="user-client-search-input"
                />

                <button
                type="button"
                className="select-arrow"
                onClick={() =>
                    setShowClientDropdown((prev) => !prev)
                }
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

            <div className="detailed-mis-field">
            <label>
                From <span>*</span>
            </label>

            <div className="detailed-mis-input date-input">
                <input
                type="date"
                className="date-range-input"
                />
            </div>
            </div>

            {/* To Date */}
            <div className="detailed-mis-field">
            <label>
                To <span>*</span>
            </label>

            <div className="detailed-mis-input date-input">
                <input
                type="date"
                className="date-range-input"
                />
            </div>
            </div>

            {/* Mobile Number */}
            <div className="detailed-mis-field">
                <label>Mobile Number</label>

                <div className="detailed-mis-input">
                <span>Mobile Number</span>
                </div>
            </div>

            {/* Sender ID */}
            <div className="detailed-mis-field">
                <label>Sender ID</label>

                <div className="detailed-mis-input">
                <span>Sender ID</span>
                </div>
            </div>

            {/* Message ID */}
            <div className="detailed-mis-field">
                <label>Message ID</label>

                <div className="detailed-mis-input">
                <span>Message ID</span>
                </div>
            </div>
            </div>  

            {/* Buttons */}
            <div className="detailed-mis-actions">
                <button className="detailed-mis-reset-btn">
                Reset
                </button>

                <button className="detailed-mis-search-btn">
                Search
                </button>
            </div>
            </div>
        </div>

        {/* Empty State / Results Container */}
        <div className="detailed-mis-results-card">
        <div className="detailed-mis-empty-state">

          <div className="detailed-mis-search-icon">
            <div className="search-circle"></div>
            <div className="search-handle"></div>
          </div>

          <h3>
            Select a date range and User Name / Client Name to search
          </h3>

          <p>
            Then add at least one of Sender ID, Mobile Number or Message ID to
            narrow it down.
          </p>

        </div>
      </div>
    </div>
  )
}

export default DetailedMis
