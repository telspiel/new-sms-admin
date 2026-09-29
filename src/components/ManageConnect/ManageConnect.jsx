import React, { useState, useEffect, useContext, useRef } from "react";
import "./ManageConnect.css";
import Endpoints from "../../api/endpoint";
import { AuthContext } from "../../context/AuthContext";
import { ChevronDown, ChevronUp } from "lucide-react";

const ManageConnect = () => {
    
   const { userData } = useContext(AuthContext);
    
   const [groups, setGroups] = useState([]);
   const [selectedGroup, setSelectedGroup] = useState("");

   const [groupKannelMap, setGroupKannelMap] = useState({});
   const [rows, setRows] = useState([]);

   const [kannelList, setKannelList] = useState([]);
   const [allocationError, setAllocationError] = useState("");
   const [toastMessage, setToastMessage] = useState("");

   const [originalRows, setOriginalRows] = useState([]);
   const [isSubmitted, setIsSubmitted] = useState(false);

   const [isGroupOpen, setIsGroupOpen] = useState(false);
const [groupSearchTerm, setGroupSearchTerm] = useState("");
const groupDropdownRef = useRef(null);

// Find selected group object to render label
const selectedGroupObj = groups.find(
  (g) => String(g.id) === String(selectedGroup)
);

// Filter options matching search query
const filteredGroups = groups.filter((group) =>
  group.name.toLowerCase().includes(groupSearchTerm.toLowerCase().trim())
);

// Close dropdown on outside click
useEffect(() => {
  const handleClickOutside = (event) => {
    if (
      groupDropdownRef.current &&
      !groupDropdownRef.current.contains(event.target)
    ) {
      setIsGroupOpen(false);
    }
  };

  if (isGroupOpen) {
    document.addEventListener("mousedown", handleClickOutside);
  }
  return () => {
    document.removeEventListener("mousedown", handleClickOutside);
  };
}, [isGroupOpen]);

// Selection Handler preserving original mapping and state setup logic
const handleSelectGroup = (groupId) => {
  setSelectedGroup(groupId);
  setIsGroupOpen(false);
  setGroupSearchTerm("");

  const selected = groups.find((g) => String(g.id) === String(groupId));

  if (!selected) {
    setRows([]);
    setOriginalRows([]);
    return;
  }

  const kannels = groupKannelMap[selected.name] || {};

  const rowData = Object.entries(kannels).map(([kannelName, percentage]) => {
    const selectedKannel = kannelList.find((k) => k.name === kannelName);

    return {
      kannelId: selectedKannel?.id || "",
      kannelName,
      percentage,
    };
  });

  setRows(rowData);

  // Keep an untouched copy
  setOriginalRows(JSON.parse(JSON.stringify(rowData)));

  setAllocationError("");
};

  const removeRow = (index) => {
    setRows(rows.filter((_, i) => i !== index));
  };

  //Get all routing groupname list API
  const getUserRoutingGroups = async () => {
  try {
    const payload = {
      loggedInUsername: userData.username,
    };

    const response = await Endpoints.post(
      "getUserRoutingGroups",
      payload,
      userData.authJwtToken
    );

    if (response.code === 1003) {
      const groupMap = response.data?.userGroupAndGroupIdMap || {};

      const groupList = Object.entries(groupMap).map(([name, id]) => ({
        id,
        name,
      }));

      setGroups(groupList);
    } else {
      setGroups([]);
      alert(response.message);
    }
  } catch (error) {
    console.error(error);
    setGroups([]);
  }
};

//Get the kennel name based on groupname
const getGroupKannelLoad = async () => {
  try {
    const payload = {
      loggedInUsername: userData.username,
    };

    const response = await Endpoints.post(
      "viewRoutingGroups",
      payload,
      userData.authJwtToken
    );

    if (response.code === 1001) {
      setGroupKannelMap(response.data?.groupKannelLoadMap || {});
    } else {
      setGroupKannelMap({});
    }
  } catch (error) {
    console.error(error);
    setGroupKannelMap({});
  }
};

//To get all the kennel list names
const getUserKennalList = async () => {
  try {
    const payload = {
      loggedInUsername: userData.username,
    };

    const response = await Endpoints.post(
      "getUserKennalList",
      payload,
      userData.authJwtToken
    );

    if (response.code === 1005) {
      const kannelMap = response.data?.userKannelMap || {};

      const kannelArray = Object.entries(kannelMap).map(([name, id]) => ({
        id,
        name,
      }));

      setKannelList(kannelArray);
    } else {
      setKannelList([]);
    }
  } catch (error) {
    console.error(error);
    setKannelList([]);
  }
};

useEffect(() => {
  getUserRoutingGroups();
  getGroupKannelLoad();
  getUserKennalList();
}, []);


const addRow = () => {
  setRows((prev) => [
    ...prev,
    {
      kannelName: "",
      percentage: "",
    },
  ]);
};

const totalAllocated = rows.reduce(
  (total, row) => total + (Number(row.percentage) || 0),
  0
);
const isAllocationInvalid = totalAllocated !== 100;

//To update kennel group mapping API
   const updateKennalGroupMap = async () => {
    setIsSubmitted(true);

    if (!selectedGroup) {
      alert("Please select a routing group.");
      return;
    }

    // 1. Check if any row is missing a kannel selection
    const hasUnselectedKannel = rows.some((row) => !row.kannelId);
    if (hasUnselectedKannel) {
      return; // Stops function execution before calling the API
    }

    // 2. Check total percentage allocation
    if (totalAllocated !== 100) {
      setAllocationError(
        `⚠ Total % of the group cannot be more or less than 100. Currently at ${totalAllocated}%.`
      );
      return;
    }

    setAllocationError("");

    const kannelPayload = {};

    rows.forEach((row) => {
      if (row.kannelId) {
        kannelPayload[row.kannelId] = String(row.percentage);
      }
    });

    const payload = {
      loggedInUsername: userData.username,
      groupId: String(selectedGroup),
      kannelList: kannelPayload,
    };

    // 3. API Call will only execute if all validations pass
    try {
      const response = await Endpoints.post(
        "updatedKennalGroupMap",
        payload,
        userData.authJwtToken
      );

      if (response.code === 1007 || response.result === "success") {
        const selectedGroupName =
          groups.find((group) => String(group.id) === String(selectedGroup))
            ?.name || "Selected group";

        setToastMessage(`${selectedGroupName} kannel routing saved`);

        setTimeout(() => {
          setToastMessage("");
        }, 2000);
      } else {
        alert(response.message);
      }
    } catch (error) {
      console.error(error);
    }
  };

    const handleCancel = () => {
    setRows(JSON.parse(JSON.stringify(originalRows)));
    setAllocationError("");
    setIsSubmitted(false);
    };

  return (
    <div className="manage-connect">
        {toastMessage && (
        <div className="toast-message">
            <i className="fa-regular fa-circle-check"></i>
            {toastMessage}
        </div>
        )} 
      <div className="manage-connect-header">
        <h1>Manage Connect</h1>

        <p>
          Home / Routing Management / Manage Connect · Split a routing group's
          traffic across kannels
        </p>
      </div>

      <div className="connect-card">
        <h2>Manage Connect</h2>

        <p className="card-subtitle">
          Pick a group, then set which kannels carry its traffic and in what
          proportion.
        </p>

        <div className="manage-form-group" ref={groupDropdownRef}>
        <label>
          Select Group <span className="mandatory">*</span>
        </label>

        <div className="custom-manage-dropdown">
          {/* Dropdown Header Trigger */}
          <button
            type="button"
            className={`manage-dropdown-trigger ${isGroupOpen ? "active" : ""}`}
            onClick={() => setIsGroupOpen((prev) => !prev)}
          >
            <span className={`trigger-text ${!selectedGroupObj ? "placeholder" : ""}`}>
              {selectedGroupObj ? selectedGroupObj.name : "-- Select --"}
            </span>
            {isGroupOpen ? (
              <ChevronUp size={16} className="chevron-icon" />
            ) : (
              <ChevronDown size={16} className="chevron-icon" />
            )}
          </button>

          {/* Dropdown Popup */}
          {isGroupOpen && (
            <div className="manage-dropdown-menu">
              {/* Search Field Header */}
              <div className="manage-dropdown-search-container">
                <input
                  type="text"
                  className="manage-dropdown-search-input"
                  placeholder="Search group..."
                  value={groupSearchTerm}
                  onChange={(e) => setGroupSearchTerm(e.target.value)}
                  autoFocus
                />
              </div>

              {/* Options Scrollable List */}
              <div className="manage-dropdown-options-list">
                {/* Default "-- Select --" Reset Option */}
                <div
                  className={`manage-dropdown-option ${!selectedGroup ? "selected" : ""}`}
                  onClick={() => handleSelectGroup("")}
                >
                  -- Select --
                </div>

                {filteredGroups.length > 0 ? (
                  filteredGroups.map((group) => (
                    <div
                      key={group.id}
                      className={`manage-dropdown-option ${
                        String(selectedGroup) === String(group.id) ? "selected" : ""
                      }`}
                      onClick={() => handleSelectGroup(group.id)}
                    >
                      {group.name}
                    </div>
                  ))
                ) : (
                  <div className="manage-dropdown-no-results">No groups found</div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

        {!selectedGroup ? (
          <div className="empty-connect-state">
            <i className="fa-solid fa-up-right-and-down-left-from-center"></i>

            <h3>Select a group to configure it</h3>

            <p>
              Choose a group above to see and edit the kannels its
              <br />
              traffic is split across.
            </p>
          </div>
        ) : (
          <>
            {rows.map((row, index) => {
            const isKannelInvalid = isSubmitted && !row.kannelId;

            return (
              <>
              <div className="routing-row" key={index}>
                <div className="routing-field">
                  {index === 0 && <label>KANNEL NAME</label>}
                  <select
                    className={isKannelInvalid ? "select-error" : ""}
                    value={row.kannelId || ""}
                    onChange={(e) => {
                      const selected = kannelList.find(
                        (k) => String(k.id) === e.target.value
                      );

                      const updated = [...rows];
                      updated[index].kannelId = selected?.id;
                      updated[index].kannelName = selected?.name;
                      setRows(updated);
                    }}
                  >
                    <option value="">-- Select --</option>

                    {kannelList.map((kannel) => (
                      <option key={kannel.id} value={kannel.id}>
                        {kannel.name}
                      </option>
                    ))}
                  </select>
                  
                  {/* Error message under the select dropdown */}
                  
                </div>

                <div className="percentage-field">
                  {index === 0 && <label>KANNEL PERCENTAGE</label>}

                  <div className="percentage-input">
                    <input
                      type="number"
                      value={row.percentage}
                      min="0"
                      max="100"
                      onChange={(e) => {
                        const updated = [...rows];
                        updated[index].percentage = e.target.value;
                        setRows(updated);
                      }}
                    />
                    <span>%</span>
                  </div>
                </div>

                <button
                  className="remove-row"
                  onClick={() => removeRow(index)}
                  disabled={rows.length === 1}
                >
                  <i className="fa-solid fa-xmark"></i>
                </button>
              </div>
                {isKannelInvalid && (
                    <span className="manage-field-error-text">
                      ⚠ Select a kannel.
                    </span>
                  )}
                </>      
            );
          })}

            <button className="add-more-btn" onClick={addRow}>
              <i className="fa-solid fa-plus"></i>
              Add More
            </button>

            <div
                className={`allocation-bar ${
                    isAllocationInvalid ? "allocation-error" : ""
                }`}
                >
                <span>Total allocated</span>

                <strong>{totalAllocated}%</strong>
            </div>
            {allocationError && (
            <p className="allocation-warning">
                {allocationError}
            </p>
            )}

            <div className="footer-buttons">
              <button
                className="cancel-btn"
                onClick={handleCancel}
                >
                Cancel
             </button>

              <button
                className="save-btn"
                onClick={updateKennalGroupMap}
                >
                Save
                </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ManageConnect;