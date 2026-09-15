import React, { useState, useEffect, useContext } from "react";
import "./NewUserRouting.css";
import Endpoints from "../../api/endpoint";
import { AuthContext } from "../../context/AuthContext";

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

        <div className="new-routing-form-group">
        <label>
            User List <span className="mandatory">*</span>
        </label>

         <select
            value={selectedUser}
            className={errors.user ? "input-error" : ""}
            onChange={(e) => {
                setSelectedUser(e.target.value);
                setErrors((prev) => ({ ...prev, user: "" }));
            }}
            >
            <option value="">-- Select --</option>

            {userList.map((user) => (
            <option key={user.userId} value={user.userId}>
                {user.userName}
            </option>
            ))}
        </select>
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

        <div className="new-routing-form-group">
        <label>
            Group List <span className="mandatory">*</span>
        </label>

       <select
        value={selectedGroup}
        disabled={!selectedType}
        className={errors.group ? "input-error" : ""}
        onChange={(e) => {
            setSelectedGroup(e.target.value);
            setErrors((prev) => ({ ...prev, group: "" }));
        }}
        >
        <option value="">-- Select --</option>

        {groups.map((group) => (
            <option key={group.id} value={group.id}>
            {group.name}
            </option>
        ))}
        </select>
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