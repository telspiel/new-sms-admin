import React, { useState, useEffect, useContext, useRef } from "react";
import "./ManageConnect.css";
import Endpoints from "../../api/endpoint";
import { AuthContext } from "../../context/AuthContext";
import { ChevronDown, ChevronUp, Copy } from "lucide-react";

// --- Helper Component: Searchable Kannel Dropdown ---
const KannelSearchableDropdown = ({
  row,
  index,
  kannelList,
  isKannelInvalid,
  onSelectKannel,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const dropdownRef = useRef(null);

  const selectedKannelObj = kannelList.find(
    (k) => String(k.id) === String(row.kannelId)
  );

  const filteredKannels = kannelList.filter((kannel) =>
    kannel.name.toLowerCase().includes(searchTerm.toLowerCase().trim())
  );

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const handleSelect = (kannel) => {
    onSelectKannel(index, kannel);
    setIsOpen(false);
    setSearchTerm("");
  };

  return (
    <div
      className={`custom-manage-dropdown ${isKannelInvalid ? "select-error" : ""}`}
      ref={dropdownRef}
    >
      <button
        type="button"
        className={`manage-dropdown-trigger ${isOpen ? "active" : ""}`}
        onClick={() => setIsOpen((prev) => !prev)}
      >
        <span
          className={`trigger-text ${
            !selectedKannelObj ? "placeholder" : ""
          }`}
        >
          {selectedKannelObj ? selectedKannelObj.name : "-- Select --"}
        </span>
        {isOpen ? (
          <ChevronUp size={16} className="chevron-icon" />
        ) : (
          <ChevronDown size={16} className="chevron-icon" />
        )}
      </button>

      {isOpen && (
        <div className="manage-dropdown-menu">
          <div className="manage-dropdown-search-container">
            <input
              type="text"
              className="manage-dropdown-search-input"
              placeholder="Search kannel..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              autoFocus
            />
          </div>

          <div className="manage-dropdown-options-list">
            <div
              className={`manage-dropdown-option ${
                !row.kannelId ? "selected" : ""
              }`}
              onClick={() => handleSelect(null)}
            >
              -- Select --
            </div>

            {filteredKannels.length > 0 ? (
              filteredKannels.map((kannel) => (
                <div
                  key={kannel.id}
                  className={`manage-dropdown-option ${
                    String(row.kannelId) === String(kannel.id)
                      ? "selected"
                      : ""
                  }`}
                  onClick={() => handleSelect(kannel)}
                >
                  {kannel.name}
                </div>
              ))
            ) : (
              <div className="manage-dropdown-no-results">
                No kannels found
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// --- Main ManageConnect Component ---
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
    setOriginalRows(JSON.parse(JSON.stringify(rowData)));
    setAllocationError("");
  };

  const removeRow = (index) => {
    setRows(rows.filter((_, i) => i !== index));
  };

  const handleCopyKannel = (row) => {
    if (!row.kannelName) {
      setToastMessage("No kannel name selected to copy");
    } else {
      navigator.clipboard.writeText(row.kannelName);
      setToastMessage(`Copied: "${row.kannelName}"`);
    }

    setTimeout(() => {
      setToastMessage("");
    }, 2000);
  };

  const handleSelectKannelRow = (index, kannelObj) => {
    const updated = [...rows];
    updated[index].kannelId = kannelObj?.id || "";
    updated[index].kannelName = kannelObj?.name || "";
    setRows(updated);
  };

  // Get all routing groupname list API
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

  // Get the kannel name based on groupname
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

  // To get all the kannel list names
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
        kannelId: "",
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

  // To update kannel group mapping API
  const updateKennalGroupMap = async () => {
    setIsSubmitted(true);

    if (!selectedGroup) {
      alert("Please select a routing group.");
      return;
    }

    const hasUnselectedKannel = rows.some((row) => !row.kannelId);
    if (hasUnselectedKannel) {
      return;
    }

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
            <button
              type="button"
              className={`manage-dropdown-trigger ${
                isGroupOpen ? "active" : ""
              }`}
              onClick={() => setIsGroupOpen((prev) => !prev)}
            >
              <span
                className={`trigger-text ${
                  !selectedGroupObj ? "placeholder" : ""
                }`}
              >
                {selectedGroupObj ? selectedGroupObj.name : "-- Select --"}
              </span>
              {isGroupOpen ? (
                <ChevronUp size={16} className="chevron-icon" />
              ) : (
                <ChevronDown size={16} className="chevron-icon" />
              )}
            </button>

            {isGroupOpen && (
              <div className="manage-dropdown-menu">
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

                <div className="manage-dropdown-options-list">
                  <div
                    className={`manage-dropdown-option ${
                      !selectedGroup ? "selected" : ""
                    }`}
                    onClick={() => handleSelectGroup("")}
                  >
                    -- Select --
                  </div>

                  {filteredGroups.length > 0 ? (
                    filteredGroups.map((group) => (
                      <div
                        key={group.id}
                        className={`manage-dropdown-option ${
                          String(selectedGroup) === String(group.id)
                            ? "selected"
                            : ""
                        }`}
                        onClick={() => handleSelectGroup(group.id)}
                      >
                        {group.name}
                      </div>
                    ))
                  ) : (
                    <div className="manage-dropdown-no-results">
                      No groups found
                    </div>
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
                <React.Fragment key={index}>
                  <div className="routing-row">
                    <div className="routing-field">
                      {index === 0 && <label>KANNEL NAME</label>}
                      <KannelSearchableDropdown
                        row={row}
                        index={index}
                        kannelList={kannelList}
                        isKannelInvalid={isKannelInvalid}
                        onSelectKannel={handleSelectKannelRow}
                      />
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
                      type="button"
                      className="remove-row"
                      onClick={() => removeRow(index)}
                      disabled={rows.length === 1}
                      title="Remove Row"
                    >
                      <i className="fa-solid fa-xmark"></i>
                    </button>

                    {/* Copy Icon Button directly after the cross icon */}
                    <button
                      type="button"
                      className="copy-kannel-btn"
                      onClick={() => handleCopyKannel(row)}
                      title="Copy Kannel Name"
                    >
                      <Copy size={16} />
                    </button>
                  </div>

                  {isKannelInvalid && (
                    <span className="manage-field-error-text">
                      ⚠ Select a kannel.
                    </span>
                  )}
                </React.Fragment>
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
              <p className="allocation-warning">{allocationError}</p>
            )}

            <div className="footer-buttons">
              <button className="cancel-btn" onClick={handleCancel}>
                Cancel
              </button>
              <button className="save-btn" onClick={updateKennalGroupMap}>
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