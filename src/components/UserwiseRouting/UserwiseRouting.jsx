import React, { useState, useEffect, useContext, useRef } from "react";
import "./UserwiseRouting.css";
import { Shuffle, ChevronDown, ChevronUp } from "lucide-react";
import Endpoints from "../../api/endpoint";
import { AuthContext } from "../../context/AuthContext";

const UserwiseRouting = () => {

    const { userData } = useContext(AuthContext);

    const [selectedType, setSelectedType] = useState("");
    const [userList, setUserList] = useState([]);
    const [selectedUser, setSelectedUser] = useState("");

    const [routingData, setRoutingData] = useState([]);
     const [toastMessage, setToastMessage] = useState("");

    //ADD NEW OUTING STATES
    const [showAddRoutingModal, setShowAddRoutingModal] = useState(false);

    const [senderIds, setSenderIds] = useState([]);
    const [circles, setCircles] = useState([]);
    const [carriers, setCarriers] = useState([]);
    const [groups, setGroups] = useState([]);

    const [selectedSenderId, setSelectedSenderId] = useState("");
    const [selectedCircle, setSelectedCircle] = useState("");
    const [selectedCarrier, setSelectedCarrier] = useState("");
    const [selectedGroup, setSelectedGroup] = useState("");

  const [showEditRoutingModal, setShowEditRoutingModal] = useState(false);
  const [editingRoutingId, setEditingRoutingId] = useState(null);

  const [editSenderId, setEditSenderId] = useState("");
  const [editCircle, setEditCircle] = useState("");
  const [editCarrier, setEditCarrier] = useState("");
  const [editGroup, setEditGroup] = useState("");

  // Inside your component:
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const dropdownRef = useRef(null);

  // Find the selected user's object to display their name in the trigger header
  const selectedUserObj = userList.find(
    (user) => String(user.userId) === String(selectedUser)
  );

  // Filter options based on search query
  const filteredUsers = userList.filter((user) =>
    user.userName.toLowerCase().includes(searchTerm.toLowerCase().trim())
  );

  // Close dropdown when clicking outside
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

  const handleUserSelect = (userId) => {
    setSelectedUser(userId);
    setIsOpen(false);
    setSearchTerm(""); // Reset search on select

    if (userId) {
      getUserListDataOptions(userId, selectedType);
    } else {
      setRoutingData([]);
    }
  };

  //==========API to get Routed Uers=====================
  const getUserwiseMessageType = async (type) => {
  try {
    const response = await fetch(
      `${Endpoints.get(
        "userwiseMessageType"
      )}?type=${encodeURIComponent(type)}`,
      {
        method: "POST",
        headers: {
          Authorization: `${userData.authJwtToken}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP Error: ${response.status}`);
    }

    const data = await response.json();

    setUserList(data || []);
  } catch (error) {
    console.error(error);
    setUserList([]);
  }
};

//================API to get Routing Data in the Table===================
const getUserListDataOptions = async (userId, type) => {
  try {
    const response = await fetch(
      `${Endpoints.get(
        "userListDataOptions"
      )}?userId=${userId}&type=${type}`,
      {
        method: "POST",
        headers: {
          Authorization: `${userData.authJwtToken}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP Error: ${response.status}`);
    }

    const data = await response.json();

    setRoutingData(data || []);
  } catch (error) {
    console.error(error);
    setRoutingData([]);
  }
};

//==============Get Infor of new routing API================
const getEditUserRoutingData = async () => {
  try {
    const response = await fetch(
      `${Endpoints.get(
        "editUserRoutingData"
      )}?userId=${selectedUser}&type=${selectedType}`,
      {
        method: "POST",
        headers: {
          Authorization: `${userData.authJwtToken}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP Error: ${response.status}`);
    }

    const data = await response.json();

    setSenderIds(data.senderIds || []);
    setCircles(data.circles || []);
    setCarriers(data.carriers || []);
    setGroups(data.groups || []);
  } catch (error) {
    console.error(error);
  }
};

//Show ALL if i get null or UNKNOWN
const getDisplayName = (item) => {
  return item.name === null ||
    item.name === "UNKNOWN" ||
    item.id === 0
    ? "ALL"
    : item.name;
};

const handleTypeChange = (type) => {
  setSelectedType(type);

  // Clear previous selection
  setSelectedUser("");
  setUserList([]);
  setRoutingData([]);

  getUserwiseMessageType(type);
};

//===========To save new user routing API================
const addNewUserRouting = async () => {
  if (
    selectedSenderId === "" ||
    selectedCircle === "" ||
    selectedCarrier === "" ||
    selectedGroup === ""
  ) {
    alert("Please fill all required fields.");
    return;
  }

  try {
    const response = await fetch(
      Endpoints.get("addNewUserRouting"),
      {
        method: "POST",
        headers: {
          Authorization: `${userData.authJwtToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: Number(selectedUser),
          senderId: Number(selectedSenderId),
          circleId: Number(selectedCircle),
          carrierId: Number(selectedCarrier),
          groupId: Number(selectedGroup),
          type: selectedType,
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP Error: ${response.status}`);
    }

    const data = await response.text();

    setToastMessage(data);

    setTimeout(() => {
      setToastMessage("");
    }, 2000);

    setShowAddRoutingModal(false);

    // Clear modal input fields
    setSelectedSenderId("");
    setSelectedCircle("");
    setSelectedCarrier("");
    setSelectedGroup("");

    // Refresh routing table using the currently selected user and type
    await getUserListDataOptions(selectedUser, selectedType);

  } catch (error) {
    console.error(error);
    alert("Failed to add routing.");
  }
};

//=================Handle edit button===================
const handleEditRouting = async (row) => {
  await getEditUserRoutingData();

  setEditingRoutingId(row.id);

  setEditSenderId(row.senderId ?? 0);

  const circle = circles.find(
    (item) =>
      item.name === row.circleName ||
      (item.name === "UNKNOWN" && row.circleName === "ALL")
  );

  setEditCircle(circle ? circle.id : 0);

  const carrier = carriers.find(
    (item) =>
      item.name === row.carrierName ||
      (item.name === "UNKNOWN" && row.carrierName === "ALL")
  );

  setEditCarrier(carrier ? carrier.id : 0);

  const group = groups.find(
    (item) => item.name === row.groupName
  );

  setEditGroup(group ? group.id : "");

  setShowEditRoutingModal(true);
};


//================Calling API to update user routing=================
const updateUserRouting = async () => {
  if (
    editSenderId === "" ||
    editCircle === "" ||
    editCarrier === "" ||
    editGroup === ""
  ) {
    alert("Please fill all required fields.");
    return;
  }

  try {
    const response = await fetch(
      Endpoints.get("updatedUserRouting"),
      {
        method: "POST",
        headers: {
          Authorization: `${userData.authJwtToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: editingRoutingId,          // Routing row id
          userId: Number(selectedUser),  // Selected user from main screen
          senderId: Number(editSenderId),
          circleId: Number(editCircle),
          carrierId: Number(editCarrier),
          groupId: Number(editGroup),
          type: selectedType,            // trans / promo
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP Error: ${response.status}`);
    }

    const data = await response.text();

    // Show success toast
    setToastMessage(data);

    setTimeout(() => {
      setToastMessage("");
    }, 2000);

    // Close modal
    setShowEditRoutingModal(false);

    // Clear edit states
    setEditingRoutingId(null);
    setEditSenderId("");
    setEditCircle("");
    setEditCarrier("");
    setEditGroup("");

    // Refresh routing table
    await getUserListDataOptions(selectedUser, selectedType);
  } catch (error) {
    console.error(error);
    alert("Failed to update routing.");
  }
};


  return (
    <div className="userwise-routing">
       {toastMessage && (
        <div className="toast-message">
            <i className="fa-regular fa-circle-check"></i>
            {toastMessage}
        </div>
        )}
        <div className="userwise-routing-header">
        <h1>Userwise Routing</h1>

        <p>
          Home / Routing Management / Userwise Routing · Per-user Sender ID, circle & carrier 
          routing rules
        </p>
      </div>

      <div className="userwise-filter-card">
        <div className="userwise-filter-row">
          <div className="userwise-field">
            <label>
              Type <span className="mandatory">*</span>
            </label>

           <div className="userwise-radio-box">
            <label className="userwise-radio-item">
                <input
                type="radio"
                name="type"
                checked={selectedType === "trans"}
                onChange={() => handleTypeChange("trans")}
                />
                <span>Trans/Otp</span>
            </label>

            <label className="userwise-radio-item">
                <input
                type="radio"
                name="type"
                checked={selectedType === "promo"}
                onChange={() => handleTypeChange("promo")}
                />
                <span>Promo</span>
            </label>
            </div>
          </div>

        <div className="userwise-field" ref={dropdownRef}>
        <label>
          User List <span className="mandatory">*</span>
        </label>

        <div className="custom-user-dropdown">
          {/* Trigger Header */}
          <button
            type="button"
            className={`dropdown-trigger ${isOpen ? "active" : ""} ${
              !selectedType ? "disabled" : ""
            }`}
            disabled={!selectedType}
            onClick={() => setIsOpen((prev) => !prev)}
          >
            <span className={`trigger-text ${!selectedUserObj ? "placeholder" : ""}`}>
              {selectedUserObj ? selectedUserObj.userName : "-- Select --"}
            </span>
            {isOpen ? (
              <ChevronUp size={16} className="chevron-icon" />
            ) : (
              <ChevronDown size={16} className="chevron-icon" />
            )}
          </button>

          {/* Dropdown Popup Menu */}
          {isOpen && (
            <div className="dropdown-menu">
              {/* Search Input Box */}
              <div className="dropdown-search-container">
                <input
                  type="text"
                  className="dropdown-search-input"
                  placeholder="Search admin..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  autoFocus
                />
              </div>

              {/* Options List */}
              <div className="dropdown-options-list">
                {/* Default "-- Select --" / Reset Option */}
                <div
                  className={`dropdown-option ${!selectedUser ? "selected" : ""}`}
                  onClick={() => handleUserSelect("")}
                >
                  -- Select --
                </div>

                {filteredUsers.length > 0 ? (
                  filteredUsers.map((user) => (
                    <div
                      key={user.userId}
                      className={`dropdown-option ${
                        String(selectedUser) === String(user.userId) ? "selected" : ""
                      }`}
                      onClick={() => handleUserSelect(user.userId)}
                    >
                      {user.userName}
                    </div>
                  ))
                ) : (
                  <div className="dropdown-no-results">No options found</div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
        </div>
      </div>

      {selectedType && selectedUser && (
        <div className="wrap-add-routing-btn">
        <button
            className="add-routing-btn"
            onClick={() => {
            setShowAddRoutingModal(true);
            getEditUserRoutingData();
            }}
        >
            <i className="fa-solid fa-plus"></i>
            Add Routing
        </button>
        </div>
        )}

        {showAddRoutingModal && (
        <div
            className="routing-modal-overlay"
        >
            <div
            className="routing-modal"
            onClick={(e) => e.stopPropagation()}
            >
            <div className="routing-modal-header">
                <h2>Add Routing</h2>

                <button
                className="close-modal-btn"
                onClick={() => setShowAddRoutingModal(false)}
                >
                <i className="fa-solid fa-xmark"></i>
                </button>
            </div>

            <div className="routing-modal-body">

                {/* Sender ID */}

                <div className="routing-modal-field">
                <label>
                    Sender ID <span>*</span>
                </label>

                <select
                value={selectedSenderId}
                onChange={(e) => setSelectedSenderId(e.target.value)}
              >
                <option value="">-- Select --</option>

                <option value={0}>ALL</option>

                {senderIds
                  .filter((item) => item.id !== 0)
                  .map((item) => (
                    <option key={item.id} value={item.id}>
                      {getDisplayName(item)}
                    </option>
                  ))}
              </select>
                </div>

                {/* Circle */}

                <div className="routing-modal-field">
                <label>
                    Circle <span>*</span>
                </label>

                <select
                    value={selectedCircle}
                    onChange={(e) => setSelectedCircle(e.target.value)}
                >
                    <option value="">-- Select --</option>

                    {circles.map((item) => (
                    <option key={item.id} value={item.id}>
                      {getDisplayName(item)}
                    </option>
                  ))}
                </select>
                </div>

                {/* Carrier */}
                <div className="routing-modal-field">
                <label>
                    Carrier <span>*</span>
                </label>

                <select
                    value={selectedCarrier}
                    onChange={(e) => setSelectedCarrier(e.target.value)}
                >
                    <option value="">-- Select --</option>
                    {carriers.map((item) => (
                      <option key={item.id} value={item.id}>
                        {getDisplayName(item)}
                      </option>
                    ))}
                </select>
                </div>

                {/* Type */}
                <div className="routing-modal-field">
                <label>Type</label>

                <div className="selected-type-box">
                    <span className={selectedType === "trans" ? "trans-badge" : "promo-badge"}>
                    {selectedType === "trans" ? "Trans/Otp" : "Promo"}
                    </span>
                </div>
                </div>

                {/* Group */}

                <div className="routing-modal-field">
                <label>
                    Group <span>*</span>
                </label>

                <select
                    value={selectedGroup}
                    onChange={(e) => setSelectedGroup(e.target.value)}
                >
                    <option value="">-- Select --</option>

                    {groups.map((item) => (
                    <option key={item.id} value={item.id}>
                        {item.name}
                    </option>
                    ))}
                </select>
                </div>

            </div>

            <div className="routing-modal-footer">
                <button
                className="cancel-btn"
                onClick={() => setShowAddRoutingModal(false)}
                >
                Cancel
                </button>

                <button
                className="save-btn"
                onClick={addNewUserRouting}
              >
                Save
              </button>
            </div>
            </div>
        </div>
        )}

      {routingData.length === 0 ? (
        <div className="userwise-empty-card">
            <Shuffle size={54} strokeWidth={1.5} />

            <h2>Select a type and user to view routing</h2>

            <p>
            Choose a Type, then pick a user from the list to see that user's
            Sender ID, Circle and Carrier routing rules.
            </p>
        </div>
        ) : (
        <div className="userwise-table-card">
            <table className="userwise-table">
            <thead>
                <tr>
                <th>S.NO</th>
                <th>SENDER ID</th>
                <th>CIRCLE</th>
                <th>CARRIER</th>
                <th>TYPE</th>
                <th>GROUP</th>
                <th>ACTIONS</th>
                </tr>
            </thead>

            <tbody>
                {routingData.map((row, index) => (
                <tr key={row.id}>
                    <td>{index + 1}</td>

                    <td>{row.senderId || "ALL"}</td>

                    <td>
                      {!row.circleName || row.circleName.toUpperCase() === "UNKNOWN"
                        ? "ALL"
                        : row.circleName}
                    </td>

                    <td>
                      {!row.carrierName || row.carrierName.toUpperCase() === "UNKNOWN"
                        ? "ALL"
                        : row.carrierName}
                    </td>

                    <td>
                   <span
                    className={`type-badge ${
                        selectedType === "trans" ? "trans-badge" : "promo-badge"
                    }`}
                    >
                    {selectedType === "trans" ? "Trans/Otp" : "Promo"}
                    </span>
                    </td>

                    <td>{row.groupName}</td>

                    <td>
                   <button
                    className="edit-btn"
                    onClick={() => handleEditRouting(row)}
                  >
                    <i className="fa-regular fa-pen-to-square"></i>
                  </button>
                    </td>
                </tr>
                ))}
            </tbody>
            </table>
             {showEditRoutingModal && (
                  <div className="routing-modal-overlay">
                    <div
                      className="routing-modal"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="routing-modal-header">
                        <h2>Edit Routing</h2>

                        <button
                          className="close-modal-btn"
                          onClick={() => setShowEditRoutingModal(false)}
                        >
                          <i className="fa-solid fa-xmark"></i>
                        </button>
                      </div>

                      <div className="routing-modal-body">

                        {/* Sender ID */}
                        <div className="routing-modal-field">
                          <label>
                            Sender ID <span>*</span>
                          </label>

                          <select
                            value={editSenderId}
                            onChange={(e) => setEditSenderId(e.target.value)}
                          >
                            <option value="">-- Select --</option>

                            <option value={0}>ALL</option>

                            {senderIds
                              .filter((item) => item.id !== 0)
                              .map((item) => (
                                <option key={item.id} value={item.id}>
                                  {getDisplayName(item)}
                                </option>
                              ))}
                          </select>
                        </div>

                        {/* Circle */}
                        <div className="routing-modal-field">
                          <label>
                            Circle <span>*</span>
                          </label>

                          <select
                              value={editCircle}
                              onChange={(e) => setEditCircle(e.target.value)}
                            >
                            <option value="">-- Select --</option>

                            {circles.map((item) => (
                              <option key={item.id} value={item.id}>
                                {getDisplayName(item)}
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* Carrier */}
                        <div className="routing-modal-field">
                          <label>
                            Carrier <span>*</span>
                          </label>

                          <select
                            value={editCarrier}
                            onChange={(e) => setEditCarrier(e.target.value)}
                          >
                            <option value="">-- Select --</option>

                            {carriers.map((item) => (
                              <option key={item.id} value={item.id}>
                                {getDisplayName(item)}
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* Type */}
                        <div className="routing-modal-field">
                          <label>Type</label>

                          <div className="selected-type-box">
                            <span
                              className={
                                selectedType === "trans"
                                  ? "trans-badge"
                                  : "promo-badge"
                              }
                            >
                              {selectedType === "trans"
                                ? "Trans/Otp"
                                : "Promo"}
                            </span>
                          </div>
                        </div>

                        {/* Group */}
                        <div className="routing-modal-field">
                          <label>
                            Group <span>*</span>
                          </label>

                          <select
                            value={editGroup}
                            onChange={(e) => setEditGroup(e.target.value)}
                          >
                            <option value="">-- Select --</option>

                            {groups.map((item) => (
                              <option key={item.id} value={item.id}>
                                {item.name}
                              </option>
                            ))}
                          </select>
                        </div>

                      </div>

                      <div className="routing-modal-footer">
                        <button
                          className="cancel-btn"
                          onClick={() => setShowEditRoutingModal(false)}
                        >
                          Cancel
                        </button>

                        <button
                          className="save-btn"
                          onClick={updateUserRouting}
                        >
                          Save
                        </button>
                      </div>
                    </div>
                  </div>
                )}
        </div>
        )}
    </div>
  )
}

export default UserwiseRouting
