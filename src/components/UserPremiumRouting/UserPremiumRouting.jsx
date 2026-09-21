import React, { useState, useEffect, useContext } from "react";
import "./UserPremiumRouting.css";
import Endpoints from "../../api/endpoint";
import { AuthContext } from "../../context/AuthContext";

const UserPremiumRouting = () => {

  const { userData } = useContext(AuthContext);

  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState("");

  const [routingGroups, setRoutingGroups] = useState([]);
  const [selectedRoutingGroup, setSelectedRoutingGroup] = useState("");

  const [routingData, setRoutingData] = useState([]);
  const [hasSearched, setHasSearched] = useState(false);

  const [descriptions, setDescriptions] = useState([]);
  const [selectedDescription, setSelectedDescription] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");

  const [loading, setLoading] = useState(false);

  const [showUserDrawer, setShowUserDrawer] = useState(false);
  const [activeTab, setActiveTab] = useState("single");

  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);
  const [selectedRows, setSelectedRows] = useState([]);

 // State variables
const [showEditDrawer, setShowEditDrawer] = useState(false);
const [editingItem, setEditingItem] = useState(null);
const [selectedGroupName, setSelectedGroupName] = useState("");

// Open edit drawer handler
const handleEditClick = (item) => {
  setEditingItem(item);
  
  const selectedId = item?.groupid !== undefined && item?.groupid !== null 
    ? String(item.groupid) 
    : "";

  setSelectedGroupName(selectedId);
  setShowEditDrawer(true);
};

// Save edit handler
const handleSaveEdit = async () => {
  if (!selectedGroupName) {
    alert("Please select a group name.");
    return;
  }

  try {
    // Construct the payload object matching your API schema
    const updatedItem = {
      userid: editingItem?.userid || Number(selectedUser),
      mobileNumber: editingItem?.mobileNumber || "",
      description: editingItem?.description || "",
      createddate: editingItem?.createddate || "",
      updateddate: editingItem?.updateddate || "",
      groupid: editingItem?.groupid || "",
      updategroupId: Number(selectedGroupName), // Passing the newly selected group ID
    };

    // Wrap in an array as requested: [{...}]
    const payload = [updatedItem];

    const response = await fetch(Endpoints.get("updateGroupNameApi"), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: userData?.authJwtToken || "",
      },
      body: JSON.stringify(payload),
    });

    const message = await response.text();
    setToastMessage(message || "Routing group updated successfully!");
    setShowToast(true);

    setTimeout(() => setShowToast(false), 2000);

    setShowEditDrawer(false);
    setEditingItem(null);

    // Refresh table data
    if (selectedUser) {
      usernameSearchSelect(selectedUser);
    }
  } catch (error) {
    console.error("Error updating group:", error);
  }
};


////////////////////////////////////////////////////////////////////
 //To get all the users API   
  const getAllUsername = async () => {
  try {
    const response = await fetch(
      Endpoints.get("getAllUsername"),
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: userData?.authJwtToken || "",
        },
      }
    );

    const data = await response.json();

    if (Array.isArray(data)) {
      setUsers(data);
    } else {
      setUsers([]);
    }
  } catch (error) {
    console.error("Error fetching users:", error);
    setUsers([]);
  }
};

// To get all routing groups API
const getAllRoutingName = async () => {
  try {
    const response = await fetch(
      Endpoints.get("getAllRoutingName"),
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: userData?.authJwtToken || "",
        },
      }
    );

    const data = await response.json();

    if (Array.isArray(data)) {
      setRoutingGroups(data);
    } else {
      setRoutingGroups([]);
    }
  } catch (error) {
    console.error("Error fetching routing groups:", error);
    setRoutingGroups([]);
  }
};

useEffect(() => {
  getAllUsername();
  getAllRoutingName();
}, []);

//To get user routing data based on user selected
const usernameSearchSelect = async (userId) => {
    setLoading(true);
  try {
    const response = await fetch(
      `${Endpoints.get("usernameSearchSelect")}?userid=${userId}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: userData?.authJwtToken || "",
        },
      }
    );

    const data = await response.json();

    if (Array.isArray(data)) {
      setRoutingData(data);
    } else {
      setRoutingData([]);
    }

    setHasSearched(true);
  } catch (error) {
    console.error(error);
    setRoutingData([]);
    setHasSearched(true);
  } finally {
    setLoading(false);
  }
};

const getGroupNameById = (groupId) => {
  const match = routingGroups.find((g) => String(g.id) === String(groupId));
  return match ? match.groupName : groupId || "-";
};

const selectedUserName =
  users.find((user) => String(user.id) === selectedUser)?.name || "";

//To get all descriptions based on that user
const descriptionByUsername = async (userId) => {
  try {
    const response = await fetch(
      `${Endpoints.get("descriptionByUsername")}?userid=${userId}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: userData?.authJwtToken || "",
        },
      }
    );

    const data = await response.json();

    if (Array.isArray(data)) {
      setDescriptions(data);
    } else {
      setDescriptions([]);
    }
  } catch (error) {
    console.error(error);
    setDescriptions([]);
  }
};  

//Handle search for username select for table data and descriptions
const handleSearch = async () => {

  if (!selectedUser) {
    alert("Please select a user.");
    return;
  }

  const selected = users.find(
    (user) => String(user.id) === String(selectedUser)
  );



  try {
    await Promise.all([
      usernameSearchSelect(selectedUser),
      descriptionByUsername(selectedUser),
    ]);
  } catch (error) {
    console.error("Error while searching:", error);
  }
};

//Filtering the table data 
const filteredRoutingData = routingData.filter((item) => {
  const matchesDescription =
    !selectedDescription || item.description === selectedDescription;

  const matchesMobile =
    !mobileNumber ||
    item.mobileNumber.includes(mobileNumber);

  return matchesDescription && matchesMobile;
});

// =================Add premium number API=========================
const [singleUser, setSingleUser] = useState("");
const [singleMobileNumber, setSingleMobileNumber] = useState("");
const [singleRoutingGroup, setSingleRoutingGroup] = useState("");
const [singleDescription, setSingleDescription] = useState("");

// Single form errors
const [singleErrors, setSingleErrors] = useState({
  user: "",
  mobile: "",
  group: "",
  description: "",
});

// Bulk form errors
const [bulkErrors, setBulkErrors] = useState({
  user: "",
  group: "",
  file: "",
  description: "",
});

const addPremiumNumber = async () => {
 const errors = {};
  if (!singleUser) errors.user = "Please select a user.";
  if (!singleMobileNumber) {
    errors.mobile = "Mobile number is required.";
  } else if (singleMobileNumber.length !== 10) {
    errors.mobile = "Please enter a valid 10-digit mobile number.";
  }
  if (!singleRoutingGroup) errors.group = "Please select a routing group.";
  if (!singleDescription) errors.description = "Description is required.";

  if (Object.keys(errors).length > 0) {
    setSingleErrors(errors);
    return;
  }

  // Clear errors if valid
  setSingleErrors({});

  try {
    const payload = {
      description: singleDescription,
      mobileNumber: `91${singleMobileNumber}`,
      routingGroupName: singleRoutingGroup,
      userName: singleUser,
    };

    const response = await fetch(
    Endpoints.get("addPremiumNumber"),
    {
        method: "POST",
        headers: {
        "Content-Type": "application/json",
        Authorization: userData?.authJwtToken || "",
        },
        body: JSON.stringify(payload),
    }
    );

    const message = await response.text();

    setToastMessage(message);
    setShowToast(true);

    setTimeout(() => {
    setShowToast(false);
    }, 2000);

    // clear form
    setSingleUser("");
    setSingleMobileNumber("");
    setSingleRoutingGroup("");
    setSingleDescription("");

    // close drawer
    setShowUserDrawer(false);

    if (selectedUser) {
      usernameSearchSelect(selectedUser);
    }
  } catch (error) {
    console.error(error);
  }
};

//==============Upload premium number API==================
const [bulkUser, setBulkUser] = useState("");
const [bulkRoutingGroup, setBulkRoutingGroup] = useState("");
const [bulkDescription, setBulkDescription] = useState("");
const [bulkFile, setBulkFile] = useState(null);

const uploadPremiumNumber = async () => {
  const errors = {};
  if (!bulkUser) errors.user = "Please select a user.";
  if (!bulkRoutingGroup) errors.group = "Please select a routing group.";
  if (!bulkFile) errors.file = "Please choose a file to upload.";
  if (!bulkDescription) errors.description = "Description is required.";

  if (Object.keys(errors).length > 0) {
    setBulkErrors(errors);
    return;
  }

  setBulkErrors({});

  try {
    const fileType = bulkFile.name.split(".").pop();

    const formData = new FormData();
    formData.append("file", bulkFile);

    const response = await fetch(
      `${Endpoints.get(
        "uploadPremiumNumber"
      )}?userid=${bulkUser}&fileType=${fileType}&uploadDescription=${encodeURIComponent(
        bulkDescription
      )}&groupid=${bulkRoutingGroup}`,
      {
        method: "POST",
        headers: {
          Authorization: userData?.authJwtToken || "",
        },
        body: formData,
      }
    );

    const data = await response.json();

    setToastMessage(data.msg);
    setShowToast(true);

    setTimeout(() => {
      setShowToast(false);
    }, 2000);

    // clear form
    setBulkUser("");
    setBulkRoutingGroup("");
    setBulkDescription("");
    setBulkFile(null);

    setShowUserDrawer(false);

    if (selectedUser) {
      usernameSearchSelect(selectedUser);
    }
  } catch (error) {
    console.error(error);
  }
};

//Delete premium number API
const deleteSelectedRows = async () => {
  if (selectedRows.length === 0) return;

  try {
    const response = await fetch(
      Endpoints.get("deleteSelectedRows"),
      {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: userData?.authJwtToken || "",
        },
        body: JSON.stringify(selectedRows),
      }
    );

    const message = await response.text();

    setToastMessage(message);
    setShowToast(true);

    setTimeout(() => {
      setShowToast(false);
    }, 2000);

    setShowDeleteModal(false);
    setSelectedRows([]);

    await usernameSearchSelect(selectedUser);
  } catch (error) {
    console.error(error);
  }
};

//To delete multiple rows 
const handleRowSelect = (item) => {
  setSelectedRows((prev) => {
    const exists = prev.some(
      (row) =>
        row.mobileNumber === item.mobileNumber &&
        row.userid === item.userid
    );

    if (exists) {
      return prev.filter(
        (row) =>
          !(
            row.mobileNumber === item.mobileNumber &&
            row.userid === item.userid
          )
      );
    }

    return [...prev, item];
  });
};

//Reset the User Premium page
const handleReset = () => {
  setSelectedUser("");
  setMobileNumber("");
  setSelectedDescription("");
  setRoutingData([]);
};

const resetFormAndErrors = () => {
  // Clear error states
  setSingleErrors({});
  setBulkErrors({});

  // Reset single form state
  setSingleUser("");
  setSingleMobileNumber("");
  setSingleRoutingGroup("");
  setSingleDescription("");

  // Reset bulk form state
  setBulkUser("");
  setBulkRoutingGroup("");
  setBulkFile(null);
  setBulkDescription("");
};

const handleCloseDrawer = () => {
  resetFormAndErrors();
  setShowUserDrawer(false);
};

const [showDiscardModal, setShowDiscardModal] = useState(false);


const handleCloseEditDrawer = () => {

  setShowDiscardModal(true);
};

const resetAndCloseEditDrawer = () => {
  setShowEditDrawer(false);
  setSelectedGroupName("");
};

// Triggered when clicking "Discard" on the discard modal
const handleConfirmDiscard = () => {
  setShowDiscardModal(false);
  resetAndCloseEditDrawer();
};

  return (
    <div className="user-routing">
        {showToast && (
        <div className="toast-message">
            <i className="fa-regular fa-circle-check"></i>
            <span>{toastMessage}</span>
        </div>
        )}
         <div className="user-routing-header">
            <div>
            <h1>User Premium Routing</h1>
                <p>
                    Home / Config / User Premium Routing · Route specific numbers through a premium 
                    path for a user
                </p>
           </div>

            <div className="user-wrap-add-button">
            <button
                className="add-btn"
                onClick={() => {
                setShowUserDrawer(true);
                setActiveTab("single");
                }}
            >
                <i className="fa-solid fa-plus"></i>
                Add Number
            </button>
            </div>
         </div>

        <div className="routing-search-card">
        <div className="routing-card-field">
        <label>
            USER <span>*</span>
        </label>

        <select
            value={selectedUser}
            onChange={(e) => {
            setSelectedUser(e.target.value);
            }}
        >
            <option value="">Select a user...</option>

            {users.map((user) => (
            <option key={user.id} value={user.id}>
                {user.name}
            </option>
            ))}
        </select>
        </div>

       <div className="routing-card-field">
        <label>MOBILE NUMBER (optional)</label>

        <input
            type="text"
            placeholder="Search by number"
            value={mobileNumber}
            onChange={(e) => setMobileNumber(e.target.value)}
        />
        </div>

        <div className="routing-card-field">
        <label>DESCRIPTION (optional)</label>

        <select
            value={selectedDescription}
            onChange={(e) => setSelectedDescription(e.target.value)}
        >
            <option value="">All descriptions</option>

            {descriptions.map((description, index) => (
            <option
                key={description || index}
                value={description}
            >
                {description}
            </option>
            ))}
        </select>
        </div>

        <div className="search-actions">
          <button
            className="search-btn"
            onClick={handleSearch}
            >
            Search
          </button>

          <button className="reset-btn" onClick={handleReset}>
            Reset
          </button>
        </div>
      </div>

      {showUserDrawer && (
        <>
            <div
            className="drawer-overlay"
            onClick={handleCloseDrawer}
            ></div>

            <div className="user-add-drawer">

            {/* Header */}
            <div className="user-drawer-header">

                <div>
                <h2>Add Number</h2>
                <p>Route a number through a premium path for a user</p>
                </div>

                <button
                className="user-close-drawer"
                onClick={handleCloseDrawer}
                >
                <i className="fa-solid fa-xmark"></i>
                </button>

            </div>

            {/* Tabs */}

            <div className="user-drawer-tabs">

                <button
                className={activeTab === "single" ? "active" : ""}
                onClick={() => setActiveTab("single")}
                >
                Single Number
                </button>

                <button
                className={activeTab === "bulk" ? "active" : ""}
                onClick={() => setActiveTab("bulk")}
                >
                Bulk Upload
                </button>

            </div>

            {/* Body */}

            <div className="user-drawer-body">

                {activeTab === "single" ? (

                <>
                    {/* User */}
                  <div className="routing-form-group">
                  <label>
                    User <span style={{ color: "#d83b2d" }}>*</span>
                  </label>

                  <select
                    className={singleErrors.user ? "input-errors" : ""}
                    value={singleUser}
                    onChange={(e) => {
                      setSingleUser(e.target.value);
                      if (singleErrors.user) setSingleErrors((prev) => ({ ...prev, user: "" }));
                    }}
                  >
                    <option value="">Select a user...</option>
                    {users.map((user) => (
                      <option key={user.id} value={user.id}>
                        {user.name}
                      </option>
                    ))}
                  </select>
                  {singleErrors.user && (
                    <p className="error-text">
                      ⚠{" "} {singleErrors.user}
                    </p>
                  )}
                </div>

                    {/* Mobile */}
                   <div className="routing-form-group">
                    <label>
                      Mobile Number <span style={{ color: "#d83b2d" }}>*</span>
                    </label>

                    <div className="user-mobile-input">
                      <div className="country-code">+91</div>

                      <input
                        type="text"
                        className={singleErrors.mobile ? "input-errors" : ""}
                        maxLength={10}
                        placeholder="10-digit mobile number"
                        value={singleMobileNumber}
                        onChange={(e) => {
                          setSingleMobileNumber(e.target.value.replace(/\D/g, ""));
                          if (singleErrors.mobile) setSingleErrors((prev) => ({ ...prev, mobile: "" }));
                        }}
                      />
                    </div>
                    {singleErrors.mobile && (
                      <p className="error-text">
                        ⚠{" "} {singleErrors.mobile}
                      </p>
                    )}
                  </div>

                    {/* Group */}
                   <div className="routing-form-group">
                    <label>
                      Group Name <span style={{ color: "#d83b2d" }}>*</span>
                    </label>

                    <select
                      className={singleErrors.group ? "input-errors" : ""}
                      value={singleRoutingGroup}
                      onChange={(e) => {
                        setSingleRoutingGroup(e.target.value);
                        if (singleErrors.group) setSingleErrors((prev) => ({ ...prev, group: "" }));
                      }}
                    >
                      <option value="">Select a routing group...</option>
                      {routingGroups.map((group) => (
                        <option key={group.id} value={group.id}>
                          {group.groupName}
                        </option>
                      ))}
                    </select>
                    {singleErrors.group && (
                      <p className="error-text">
                        ⚠{" "} {singleErrors.group}
                      </p>
                    )}
                  </div>

                    {/* Description */}
                  <div className="routing-form-group">
                  <label>
                    Description <span style={{ color: "#d83b2d" }}>*</span>
                  </label>

                  <input
                    type="text"
                    className={singleErrors.description ? "input-errors" : ""}
                    placeholder="Why is this number on premium routing?"
                    value={singleDescription}
                    onChange={(e) => {
                      setSingleDescription(e.target.value);
                      if (singleErrors.description)
                        setSingleErrors((prev) => ({ ...prev, description: "" }));
                    }}
                  />
                  {singleErrors.description && (
                    <p className="error-text">
                      ⚠{" "} {singleErrors.description}
                    </p>
                  )}
                </div>
                </>

                ) : (

                <>

                  <div className="routing-form-group">
                    <label>
                      User <span style={{ color: "#d83b2d" }}>*</span>
                    </label>

                    <select
                      className={bulkErrors.user ? "input-errors" : ""}
                      value={bulkUser}
                      onChange={(e) => {
                        setBulkUser(e.target.value);
                        if (bulkErrors.user) setBulkErrors((prev) => ({ ...prev, user: "" }));
                      }}
                    >
                      <option value="">Select a user...</option>
                      {users.map((user) => (
                        <option key={user.id} value={user.id}>
                          {user.name}
                        </option>
                      ))}
                    </select>
                    {bulkErrors.user && (
                      <p className="error-text">
                        ⚠{" "} {bulkErrors.user}
                      </p>
                    )}
                  </div>

                   <div className="routing-form-group">
                    <label>
                      Group Name <span style={{ color: "#d83b2d" }}>*</span>
                    </label>

                    <select
                      className={bulkErrors.group ? "input-errors" : ""}
                      value={bulkRoutingGroup}
                      onChange={(e) => {
                        setBulkRoutingGroup(e.target.value);
                        if (bulkErrors.group) setBulkErrors((prev) => ({ ...prev, group: "" }));
                      }}
                    >
                      <option value="">Select a routing group...</option>
                      {routingGroups.map((group) => (
                        <option key={group.id} value={group.id}>
                          {group.groupName}
                        </option>
                      ))}
                    </select>
                    {bulkErrors.group && (
                      <p className="error-text">
                        ⚠{" "} {bulkErrors.group}
                      </p>
                    )}
                  </div>

                    <div className="routing-form-group">
                      <label>
                        Upload File <span style={{ color: "#d83b2d" }}>*</span>
                      </label>
                      <div className={`user-upload-box ${bulkErrors.file ? "has-error" : ""}`}>
                        <input
                          type="file"
                          className={bulkErrors.file ? "input-errors" : ""}
                          accept=".txt,.csv,.xlsx"
                          onChange={(e) => {
                            setBulkFile(e.target.files[0]);
                            if (bulkErrors.file) setBulkErrors((prev) => ({ ...prev, file: "" }));
                          }}
                        />
                        <p style={{ color: bulkErrors.file ? "#d83b2d" : undefined }}>
                          Only .txt, .csv or .xlsx files are allowed · max 500 numbers per file
                        </p>
                      </div>
                      {bulkErrors.file && (
                        <p className="error-text">
                          ⚠{" "} {bulkErrors.file}
                        </p>
                      )}
                    </div>

                   <div className="routing-form-group">
                    <label>
                      Description <span style={{ color: "#d83b2d" }}>*</span>{" "}
                      <span style={{ fontSize: "12px", color: "#6c757d", fontWeight: "normal" }}>
                        (applied to every number in the file)
                      </span>
                    </label>

                    <input
                      type="text"
                      className={bulkErrors.description ? "input-errors" : ""}
                      placeholder="e.g. Q3 premium routing batch"
                      value={bulkDescription}
                      onChange={(e) => {
                        setBulkDescription(e.target.value);
                        if (bulkErrors.description)
                          setBulkErrors((prev) => ({ ...prev, description: "" }));
                      }}
                    />
                    {bulkErrors.description && (
                      <p className="error-text">
                        ⚠{" "} {bulkErrors.description}
                      </p>
                    )}
                  </div>

                </>

                )}

            </div>

            {/* Footer */}
            <div className="user-drawer-footer">
            <button
                className="cancel-button"
                onClick={handleCloseDrawer}
            >
                Cancel
            </button>

            {activeTab === "single" ? (
                <button
                className="submit-button"
                onClick={addPremiumNumber}
                >
                Add Routing
                </button>
            ) : (
                <button
                className="submit-button"
                onClick={uploadPremiumNumber}
                >
                Upload Routing
                </button>
            )}
            </div>
            </div>
        </>
        )}

      <div className="routing-table-card">
        {selectedRows.length > 0 && (
        <div className="selection-action-card">
            <span className="selection-count">
            {selectedRows.length} selected
            </span>

            <div className="selection-actions">
            <button
                className="update-selected-btn"
            >
                Update Selected
            </button>

            <button
                className="delete-selected-btn"
                onClick={() => setShowDeleteModal(true)}
            >
                Delete Selected
            </button>
            </div>
        </div>
        )}
        {routingData.length > 0 && (
        <div className="routing-table-header">
            {routingData.length} entr{routingData.length > 1 ? "ies" : "y"} matched
        </div>
       )}
        <table className="routing-table">
          {hasSearched && filteredRoutingData.length > 0 && (
            <thead>
              <tr>
                <th>
                  <input
                    type="checkbox"
                    checked={
                      filteredRoutingData.length > 0 &&
                      selectedRows.length === filteredRoutingData.length
                    }
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedRows(filteredRoutingData);
                      } else {
                        setSelectedRows([]);
                      }
                    }}
                  />
                </th>
                <th>User Premium Number</th>
                <th>Description</th>
                <th>Created Date</th>
                <th>Updated Date</th>
                <th>Group Name</th> {/* Added Header */}
                <th>Actions</th>
              </tr>
            </thead>
          )}
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="7"> {/* Updated colSpan */}
                  <div className="table-loader">
                    <div className="spinner"></div>
                    <p>Searching routing list...</p>
                  </div>
                </td>
              </tr>
            ) : !hasSearched ? (
              <tr>
                <td colSpan="7" className="empty-table-cell"> {/* Updated colSpan */}
                  <div className="empty-state">
                    <div className="empty-icon">
                      <i className="fa-solid fa-magnifying-glass"></i>
                    </div>
                    <h2>Search to view premium routing entries</h2>
                    <p>
                      This list can hold millions of entries, so it isn't loaded by
                      <br />
                      default. Search or filter by user, number, or description to
                      <br />
                      view matching entries.
                    </p>
                  </div>
                </td>
              </tr>
            ) : filteredRoutingData.length === 0 ? (
              <tr>
                <td colSpan="7" className="empty-table-premium">
                 <div className="empty-state-premium not-found-state">
                    <div className="empty-icon not-found-icon">
                        <i className="fa-solid fa-magnifying-glass"></i>
                    </div>

                    <h2>No matches found</h2>

                    <p>
                        No routing entries match your search or filters
                        <br />
                        Try adjusting them.
                    </p>
                    </div>
                </td>
              </tr>
            ) : (
              filteredRoutingData.map((item, index) => (
                <tr key={index}>
                  <td>
                    <input
                      type="checkbox"
                      checked={selectedRows.some(
                        (row) =>
                          row.mobileNumber === item.mobileNumber &&
                          row.userid === item.userid
                      )}
                      onChange={() => handleRowSelect(item)}
                    />
                  </td>

                  <td>
                    <div className="premium-number">
                      <span className="country-code">+91</span>
                      <div className="premium-number-info">
                        <div className="mobile-number">
                          {item.mobileNumber.slice(-10)}
                        </div>
                        <span className="user-name">{selectedUserName}</span>
                      </div>
                    </div>
                  </td>

                  <td>{item.description}</td>

                  <td>
                    {item.createddate
                      ? item.createddate
                          .split(" ")[0]
                          .split("-")
                          .reverse()
                          .join("-")
                      : "-"}
                  </td>

                  <td>
                    {item.updateddate
                      ? item.updateddate
                          .split(" ")[0]
                          .split("-")
                          .reverse()
                          .join("-")
                      : "-"}
                  </td>

                  {/* New Group Name Column */}
                  <td>
                    <span className="user-group-badge">
                      {getGroupNameById(item.groupid)}
                    </span>
                  </td>

                  <td>
                    <div className="user-action-buttons">
                      <button
                        className="action-btn edit-btn"
                        onClick={() => handleEditClick(item)}
                      >
                        <i className="fa-regular fa-pen-to-square"></i>
                      </button>

                      <button
                        className="action-btn delete-btn"
                        onClick={() => {
                          setSelectedRows([item]);
                          setShowDeleteModal(true);
                        }}
                      >
                        <i className="fa-regular fa-trash-can"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {showDiscardModal && (
            <div className="discard-modal-overlay">
              <div className="discard-modal">
                {/* Header */}
                <div className="discard-modal-header">
                  <div className="trash-icon-container">
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#e5484d"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M3 6h18" />
                      <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                      <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                    </svg>
                  </div>
                  <h2>Discard changes?</h2>
                </div>

                {/* Content */}
                <div className="discard-modal-body">
                  <p>You have unsaved changes. Discard them?</p>
                </div>

                {/* Actions */}
                <div className="discard-modal-footer">
                  <button
                    className="btn-secondary"
                    onClick={() => setShowDiscardModal(false)}
                  >
                    Cancel
                  </button>
                  <button className="btn-danger" onClick={handleConfirmDiscard}>
                    Discard
                  </button>
                </div>
              </div>
            </div>
          )}

            {/* Modals and Drawers placed outside single row mapping */}
            {showEditDrawer && (
              <>
                <div
                  className="drawer-overlay"
                  onClick={handleCloseEditDrawer}
                ></div>

                <div className="user-add-drawer">
                  <div className="user-drawer-header">
                    <div>
                      <h2>Edit Routing Entry</h2>
                      <p>Update the group for this entry</p>
                    </div>
                    <button
                      className="user-close-drawer"
                      onClick={handleCloseEditDrawer}
                    >
                      <i className="fa-solid fa-xmark"></i>
                    </button>
                  </div>

                  <div className="user-drawer-body">
                    <div className="routing-form-group">
                      <label>User</label>
                      <input
                        type="text"
                        value={selectedUserName || ""}
                        disabled
                        style={{ backgroundColor: "#f7f8fc", cursor: "not-allowed" }}
                      />
                    </div>

                    <div className="routing-form-group">
                      <label>
                        Group Name <span style={{ color: "#d83b2d" }}>*</span>
                      </label>
                     <select
                      value={selectedGroupName}
                      onChange={(e) => setSelectedGroupName(e.target.value)}
                    >
                      {!selectedGroupName && (
                        <option value="">Select a routing group...</option>
                      )}
                      {routingGroups.map((group) => (
                        <option key={group.id} value={String(group.id)}>
                          {group.groupName}
                        </option>
                      ))}
                    </select>
                    </div>
                  </div>

                  <div className="user-drawer-footer">
                    <button
                      className="cancel-button"
                      onClick={handleCloseEditDrawer}
                    >
                      Cancel
                    </button>
                    <button className="submit-button" onClick={handleSaveEdit}>
                      Save Changes
                    </button>
                  </div>
                </div>
              </>
            )}
            {routingData.length > 0 && (
                <div className="routing-table-footer">
                    <span>
                    Showing 1-{routingData.length} of {routingData.length}
                    </span>

                    <div className="pagination">
                    <button disabled>
                        <i className="fa-solid fa-angle-left"></i>
                    </button>

                    <button className="active">1</button>

                    <button disabled>
                        <i className="fa-solid fa-angle-right"></i>
                    </button>
                    </div>
                </div>
                )}
                
            {showDeleteModal && (
              <>
                <div
                  className="user-delete-modal-overlay"
                  onClick={() => setShowDeleteModal(false)}
                ></div>

                <div className="user-delete-modal">
                  <div className="user-delete-header">
                    <div className="user-delete-icon">
                      <i className="fa-regular fa-trash-can"></i>
                    </div>
                    <h2>Remove this routing entry?</h2>
                  </div>

                  <div className="user-delete-body">
                    <p>
                      {selectedRows.length === 1 ? (
                        <>
                          Remove <strong>+{selectedRows[0].mobileNumber}</strong> (
                          <strong>{selectedUserName}</strong>) from premium routing?
                          This action cannot be undone.
                        </>
                      ) : (
                        <>
                          Remove <strong>{selectedRows.length}</strong> selected routing
                          {selectedRows.length > 1 ? " entries" : " entry"}? This
                          action cannot be undone.
                        </>
                      )}
                    </p>
                  </div>

                  <div className="user-delete-footer">
                    <button
                      className="cancel-delete-btn"
                      onClick={() => setShowDeleteModal(false)}
                    >
                      Cancel
                    </button>
                    <button
                      className="confirm-delete-btn"
                      onClick={deleteSelectedRows}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </>
            )}
        </div>
    </div>
  )
}

export default UserPremiumRouting
