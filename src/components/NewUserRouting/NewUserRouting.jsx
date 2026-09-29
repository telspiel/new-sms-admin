import React, { useState, useEffect, useContext, useRef } from "react";
import "./NewUserRouting.css";
import Endpoints from "../../api/endpoint";
import { AuthContext } from "../../context/AuthContext";
import { ChevronDown, ChevronUp } from "lucide-react";

const NewUserRouting = () => {

  const { userData } = useContext(AuthContext);

  const [userList, setUserList] = useState([]);
  const [selectedUser, setSelectedUser] = useState("");

  const [groups, setGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState("");

  const [selectedType, setSelectedType] = useState("");
  const [toastMessage, setToastMessage] = useState("");

  const [errors, setErrors] = useState({
    user: "",
    type: "",
    group: "",
  });

// Inside your component:
const [isOpen, setIsOpen] = useState(false);
const [searchTerm, setSearchTerm] = useState("");
const dropdownRef = useRef(null);

// Find selected user object for label display
const selectedUserObj = userList.find(
  (user) => String(user.userId) === String(selectedUser)
);

// Filter users matching search term
const filteredUsers = userList.filter((user) =>
  user.userName.toLowerCase().includes(searchTerm.toLowerCase().trim())
);

// Close dropdown on outside click
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

// Option selection handler maintaining your original logic
const handleUserSelect = (userId) => {
  setSelectedUser(userId);
  setErrors((prev) => ({ ...prev, user: "" }));
  setIsOpen(false);
  setSearchTerm("");
};

const [isGroupOpen, setIsGroupOpen] = useState(false);
const [groupSearchTerm, setGroupSearchTerm] = useState("");
const groupDropdownRef = useRef(null);

// Find selected group object to display its name in the trigger header
const selectedGroupObj = groups.find(
  (group) => String(group.id) === String(selectedGroup)
);

// Filter groups matching search term
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

// Selection handler preserving original state & error clearing logic
const handleGroupSelect = (groupId) => {
  setSelectedGroup(groupId);
  setErrors((prev) => ({ ...prev, group: "" }));
  setIsGroupOpen(false);
  setGroupSearchTerm("");
};

  //==========Get Unrouted data API list=================
  const getUnroutedUserList = async () => {
  try {
    const payload = {
      loggedInUserName: userData.username,
    };

    const response = await Endpoints.post(
      "unroutedUserlist",
      payload,
      userData.authJwtToken
    );

    console.log("API Response:", response);

    setUserList(response || []);
  } catch (error) {
    console.error(error);
  }
};

//============Get all routing groupname list API===============
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

useEffect(() => {
  getUnroutedUserList();
  getUserRoutingGroups();
}, []);

//================Save new user routing api====================
const saveNewUserRouting = async () => {
    const newErrors = {
    user: "",
    type: "",
    group: "",
    };

    if (!selectedUser) {
    newErrors.user = "Select a user.";
    }

    if (!selectedType) {
    newErrors.type = "Select a type — Trans/Otp or Promo.";
    }

    if (!selectedGroup) {
    newErrors.group = "Select a routing group.";
    }

    setErrors(newErrors);

    if (newErrors.user || newErrors.type || newErrors.group) {
    return;
    }
  try {
    const response = await fetch(
      Endpoints.get("saveNewUserRouting"),
      {
        method: "POST",
        headers: {
          Authorization: `${userData.authJwtToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: Number(selectedUser),
          groupId: Number(selectedGroup),
          type: selectedType,
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP Error: ${response.status}`);
    }

    await response.text();

    const selectedUserName =
      userList.find((u) => u.userId === Number(selectedUser))?.userName || "";

    const selectedGroupName =
      groups.find((g) => Number(g.id) === Number(selectedGroup))?.name || "";

    const selectedTypeLabel =
      selectedType === "trans" ? "Trans/Otp" : "Promo";

    setToastMessage(
      `${selectedUserName} routed to ${selectedGroupName} for ${selectedTypeLabel}`
    );

    // Hide toast after 2 seconds
    setTimeout(() => {
      setToastMessage("");
    }, 2000);

    setSelectedUser("");
    setSelectedType("");
    setSelectedGroup("");
  } catch (error) {
    console.error(error);
    alert("Failed to save routing.");
  }
};

//==============Reset the input fields==========
const handleResetRouting = () => {
  setSelectedUser("");
  setSelectedType("");
  setSelectedGroup("");

  setErrors({
    user: "",
    type: "",
    group: "",
  });

  // Optional: Hide success toast if it's visible
  setToastMessage("");
};

  return (
    <div className="new-user-routing">
        {toastMessage && (
        <div className="toast-message">
            <i className="fa-regular fa-circle-check"></i>
            {toastMessage}
        </div>
        )}
      <div className="new-user-routing-header">
        <h1>New User Routing</h1>

        <p>
          Home / Routing Management / New User Routing · Assign a routing group
          to a user
        </p>
      </div>

      <div className="routing-card">
        <h2>New User Routing</h2>

        <p className="routing-subtitle">
          Route a user's traffic through a routing group. A user can be routed
          for one or both message types.
        </p>

        <div className="new-routing-form-group" ref={dropdownRef}>
        <label>
          User List <span className="mandatory">*</span>
        </label>

        <div className="custom-user-dropdown">
          {/* Trigger Box */}
          <button
            type="button"
            className={`dropdown-trigger ${isOpen ? "active" : ""} ${
              errors.user ? "input-error" : ""
            }`}
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

          {/* Dropdown Popup */}
          {isOpen && (
            <div className="dropdown-menu">
              {/* Sticky Search Field */}
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
                {/* Default "-- Select --" Reset Option */}
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
        {errors.user && (
        <p className="field-error">
            <i className="fa-solid fa-triangle-exclamation"></i> {errors.user}
        </p>
        )}

        <div className="new-routing-form-group">
          <label>
            Type <span className="mandatory">*</span>
          </label>

          <div className={`routing-radio-box ${errors.type ? "input-error" : ""}`}>
        <label className="radio-item">
           <input
            type="radio"
            name="type"
            value="trans"
            checked={selectedType === "trans"}
            onChange={(e) => {
                setSelectedType(e.target.value);
                setErrors((prev) => ({ ...prev, type: "" }));
            }}
            />
            <span>Trans/Otp</span>
        </label>

        <label className="radio-item">
            <input
            type="radio"
            name="type"
            value="promo"
            checked={selectedType === "promo"}
            onChange={(e) => {
                setSelectedType(e.target.value);
                setErrors((prev) => ({ ...prev, type: "" }));
            }}
            />
            <span>Promo</span>
        </label>
        </div>
        {errors.type && (
        <p className="field-error">
            <i className="fa-solid fa-triangle-exclamation"></i> {errors.type}
        </p>
        )}

          <p className="field-note">
            Choose the message type this routing group applies to.
          </p>
        </div>

        <div className="new-routing-form-group" ref={groupDropdownRef}>
          <label>
            Group List <span className="mandatory">*</span>
          </label>

          <div className="custom-user-dropdown">
            {/* Trigger Box */}
            <button
              type="button"
              className={`dropdown-trigger ${isGroupOpen ? "active" : ""} ${
                errors.group ? "input-error" : ""
              } ${!selectedType ? "disabled" : ""}`}
              disabled={!selectedType}
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
              <div className="dropdown-menu">
                {/* Search Field Header */}
                <div className="dropdown-search-container">
                  <input
                    type="text"
                    className="dropdown-search-input"
                    placeholder="Search group..."
                    value={groupSearchTerm}
                    onChange={(e) => setGroupSearchTerm(e.target.value)}
                    autoFocus
                  />
                </div>

                {/* Options List */}
                <div className="dropdown-options-list">
                  {/* Default "-- Select --" Reset Option */}
                  <div
                    className={`dropdown-option ${!selectedGroup ? "selected" : ""}`}
                    onClick={() => handleGroupSelect("")}
                  >
                    -- Select --
                  </div>

                  {filteredGroups.length > 0 ? (
                    filteredGroups.map((group) => (
                      <div
                        key={group.id}
                        className={`dropdown-option ${
                          String(selectedGroup) === String(group.id) ? "selected" : ""
                        }`}
                        onClick={() => handleGroupSelect(group.id)}
                      >
                        {group.name}
                      </div>
                    ))
                  ) : (
                    <div className="dropdown-no-results">No groups found</div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
        {errors.group && (
        <p className="field-error">
            <i className="fa-solid fa-triangle-exclamation"></i> {errors.group}
        </p>
        )}

        <div className="routing-divider"></div>

        <div className="routing-actions">
          <button className="reset-btn" onClick={handleResetRouting}>Reset</button>

          <button className="save-btn" onClick={saveNewUserRouting}>Save</button>
        </div>
      </div>
    </div>
  );
};

export default NewUserRouting;