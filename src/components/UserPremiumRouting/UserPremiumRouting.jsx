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

    console.log("Users:", data);

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

    console.log("Routing Groups:", data);

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

    console.log("Premium Routing:", data);

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

    console.log("Descriptions:", data);

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
  console.log("Search clicked");

  if (!selectedUser) {
    alert("Please select a user.");
    return;
  }

  const selected = users.find(
    (user) => String(user.id) === String(selectedUser)
  );

  console.log("Selected User:", selectedUser);


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

const addPremiumNumber = async () => {
  if (
    !singleUser ||
    !singleMobileNumber ||
    !singleRoutingGroup ||
    !singleDescription
  ) {
    alert("Please fill all required fields.");
    return;
  }

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

    console.log(message);

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
  if (
    !bulkUser ||
    !bulkRoutingGroup ||
    !bulkDescription ||
    !bulkFile
  ) {
    alert("Please fill all required fields.");
    return;
  }

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

    console.log(data);

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

  return (
    <div className="user-routing">
        {showToast && (
        <div className="toast-message">
            <i className="fa-solid fa-circle-check"></i>
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
            onClick={() => setShowUserDrawer(false)}
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
                onClick={() => setShowUserDrawer(false)}
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
                        User <span>*</span>
                    </label>

                    <select
                    value={singleUser}
                    onChange={(e) => setSingleUser(e.target.value)}
                    >
                    <option value="">Select a user...</option>

                    {users.map((user) => (
                        <option key={user.id} value={user.id}>
                        {user.name}
                        </option>
                    ))}
                    </select>
                    </div>

                    {/* Mobile */}
                    <div className="routing-form-group">
                    <label>
                        Mobile Number <span>*</span>
                    </label>

                    <div className="user-mobile-input">

                        <div className="country-code">
                        +91
                        </div>

                       <input
                        type="text"
                        maxLength={10}
                        placeholder="10-digit mobile number"
                        value={singleMobileNumber}
                        onChange={(e) =>
                            setSingleMobileNumber(e.target.value.replace(/\D/g, ""))
                        }
                        />

                    </div>
                    </div>

                    {/* Group */}
                   <div className="routing-form-group">
                    <label>
                        Group Name <span>*</span>
                    </label>

                    <select
                    value={singleRoutingGroup}
                    onChange={(e) => setSingleRoutingGroup(e.target.value)}
                    >
                    <option value="">Select a routing group...</option>

                    {routingGroups.map((group) => (
                        <option key={group.id} value={group.id}>
                        {group.groupName}
                        </option>
                    ))}
                    </select>
                    </div>

                    {/* Description */}
                    <div className="routing-form-group">
                    <label>
                        Description <span>*</span>
                    </label>

                   <input
                    type="text"
                    placeholder="Why is this number on premium routing?"
                    value={singleDescription}
                    onChange={(e) => setSingleDescription(e.target.value)}
                    />
                    </div>

                </>

                ) : (

                <>

                    <div className="routing-form-group">
                    <label>
                        User <span>*</span>
                    </label>

                    <select
                    value={bulkUser}
                    onChange={(e) => setBulkUser(e.target.value)}
                    >
                    <option value="">Select a user...</option>

                    {users.map((user) => (
                        <option key={user.id} value={user.id}>
                        {user.name}
                        </option>
                    ))}
                    </select>
                    </div>

                    <div className="routing-form-group">
                    <label>
                        Group Name <span>*</span>
                    </label>

                    <select
                    value={bulkRoutingGroup}
                    onChange={(e) => setBulkRoutingGroup(e.target.value)}
                    >
                    <option value="">Select a routing group...</option>

                    {routingGroups.map((group) => (
                        <option key={group.id} value={group.id}>
                        {group.groupName}
                        </option>
                    ))}
                    </select>
                    </div>

                    <div className="routing-form-group">
                    <label>
                        Upload File <span>*</span>
                    </label>
                    <div className="user-upload-box">
                        <input
                        type="file"
                        accept=".txt,.csv,.xlsx"
                        onChange={(e) => setBulkFile(e.target.files[0])}
                        />
                        <p>
                        Only .txt, .csv or .xlsx files are allowed · max 500 numbers per file
                        </p>
                    </div>
                    </div>

                    <div className="routing-form-group">
                    <label>
                        Description <span>*</span>
                    </label>

                    <input
                    type="text"
                    placeholder="Description"
                    value={bulkDescription}
                    onChange={(e) => setBulkDescription(e.target.value)}
                    />
                    </div>

                </>

                )}

            </div>

            {/* Footer */}
            <div className="user-drawer-footer">
            <button
                className="cancel-button"
                onClick={() => setShowUserDrawer(false)}
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
                <th>Actions</th>
            </tr>
            </thead>

            <tbody>
            {loading ? (
                <tr>
                <td colSpan="6">
                    <div className="table-loader">
                    <div className="spinner"></div>
                    <p>Searching routing list...</p>
                    </div>
                </td>
                </tr>
            ) : !hasSearched ? (
                <tr>
                <td colSpan="6" className="empty-table-cell">
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
                <td colSpan="6" className="empty-table-cell">
                    <div className="empty-state">
                    <h2>No data found</h2>

                    <p>No data found for the selected user.</p>
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

                        <span className="user-name">
                            {selectedUserName}
                        </span>
                        </div>
                    </div>
                    </td>

                    <td>{item.description}</td>

                    <td>
                    {item.createddate.split(" ")[0].split("-").reverse().join("-")}
                    </td>

                    <td>
                    {item.updateddate.split(" ")[0].split("-").reverse().join("-")}
                    </td>

                    <td>
                    <div className="user-action-buttons">
                        <button className="action-btn edit-btn">
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
                        Remove{" "}
                        <strong>+{selectedRows[0].mobileNumber}</strong>{" "}
                        (<strong>{selectedUserName}</strong>) from premium routing?
                        This action cannot be undone.
                    </>
                    ) : (
                    <>
                        Remove{" "}
                        <strong>{selectedRows.length}</strong> selected routing
                        {selectedRows.length > 1 ? " entries" : " entry"}?
                        This action cannot be undone.
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
            </tbody>
            </table>
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
        </div>
    </div>
  )
}

export default UserPremiumRouting
