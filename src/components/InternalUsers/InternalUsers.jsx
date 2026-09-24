import React, { useState, useEffect, useContext } from "react";
import "./InternalUsers.css";
import Endpoints from "../../api/endpoint";
import { AuthContext } from "../../context/AuthContext";
import { CircleHelp } from "lucide-react";

const InternalUsers = () => {
    const { userData } = useContext(AuthContext);

    const [internalUsers, setInternalUsers] = useState([]);

    const [loading, setLoading] = useState(false);

    const [searchTerm, setSearchTerm] = useState("");
    const [selectedUserType, setSelectedUserType] = useState("all");
    const [selectedStatus, setSelectedStatus] = useState("all");

    const [showAddInternalUser, setShowAddInternalUser] = useState(false);
    const [userType, setUserType] = useState("");

    const [seniorAccountManagers, setSeniorAccountManagers] = useState([]);
    const [selectedSeniorManager, setSelectedSeniorManager] = useState("");

    const [regionalManagers, setRegionalManagers] = useState([]);
    const [selectedRegionalManager, setSelectedRegionalManager] = useState("");

    const [username, setUsername] = useState("");
    const [usernameMessage, setUsernameMessage] = useState("");
    const [usernameAvailable, setUsernameAvailable] = useState(false);
    const [checkingUsername, setCheckingUsername] = useState(false);

    //States to add new Internal User
    const [status, setStatus] = useState("active");
    const [password, setPassword] = useState("");
    const [email, setEmail] = useState("");
    const [mobile, setMobile] = useState("");

    const [showCreateModal, setShowCreateModal] = useState(false);
    const [loadingCreate, setLoadingCreate] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [loadingUpdate, setLoadingUpdate] = useState(false);
    const [toastMessage, setToastMessage] = useState("");

    const [errors, setErrors] = useState({});

    const [showEditDrawer, setShowEditDrawer] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);

    const [editUserType, setEditUserType] = useState("");
    const [editStatus, setEditStatus] = useState("active");
    const [editSelectedSeniorManager, setEditSelectedSeniorManager] = useState("");
    const [editSelectedRegionalManager, setEditSelectedRegionalManager] = useState("");
    const [editUsername, setEditUsername] = useState("");
    const [editPassword, setEditPassword] = useState("");
    const [editEmail, setEditEmail] = useState("");
    const [editMobile, setEditMobile] = useState("");
    const [editErrors, setEditErrors] = useState({});

    const [showDiscardModal, setShowDiscardModal] = useState(false);

   
    //Get all Internal User Data API
    const getInternalUsers = async () => {
    setLoading(true);
    try {
        const payload = {
        loggedInUserName: userData.username,
        };

        const response = await Endpoints.post(
        "listInternalusers",
        payload,
        userData.authJwtToken
        );

        if (response.code === 4005) {
        const reversedUsers = [...(response.data.userList || [])].reverse();
        setInternalUsers(reversedUsers);
        } else {
        setToastMessage(response.message);
        }
    } catch (error) {
        console.error(error);
    } finally {
        setLoading(false);
    }
    };

  //Edit Internal User  
  const [isFetchingUser, setIsFetchingUser] = useState(false);

  const validateEditForm = () => {
  let errs = {};
  if (!editUserType) errs.userType = "User Type is required";
  if (!editUsername) errs.username = "Username is required";
  if (!editPassword) errs.password = "Password is required";
  if (!editEmail) errs.email = "Email ID is required";
  if (!editMobile) errs.mobile = "Mobile Number is required";

  setEditErrors(errs);
  return Object.keys(errs).length === 0;
};

const getInternalUserData = async (targetUserName) => {
  setIsFetchingUser(true);
  try {
    const payload = {
      loggedInUserName: userData.username,
      userName: targetUserName,
    };

    const response = await Endpoints.post(
      "getInternalUserData",
      payload,
      userData.authJwtToken
    );

    if (response.code === 9003 && response.data?.user) {
      const fetchedUser = response.data.user;

      setSelectedUser(fetchedUser);

      // Populate dedicated Edit states
      setEditUsername(fetchedUser.userName || "");
      setEditPassword(fetchedUser.userPassword || "");
      setEditEmail(fetchedUser.email || "");
      setEditMobile(fetchedUser.mobile || "");
      setEditStatus(fetchedUser.status?.toLowerCase() || "active");

      // Set Manager dropdown IDs if available in API response
      setEditSelectedSeniorManager(fetchedUser.seniorManagerId || "");
      setEditSelectedRegionalManager(fetchedUser.regionalManagerId || "");

      // Normalize customerType string
      const type = fetchedUser.customerType?.toLowerCase() || "";
      if (type === "accountmanager") {
        setEditUserType("Account Manager");
      } else if (type === "regionalmanager") {
        setEditUserType("Regional Manager");
      } else if (type === "support") {
        setEditUserType("Support");
      } else {
        setEditUserType(fetchedUser.customerType || "");
      }

      setEditErrors({});
      setShowEditDrawer(true);
    } else {
      setToastMessage(response.message || "Failed to fetch user details");
    }
  } catch (error) {
    console.error("Error fetching internal user data:", error);
    setToastMessage("An error occurred while fetching user data");
  } finally {
    setIsFetchingUser(false);
  }
};

    //API to get all the sr. Account Manager list
    const getSeniorAccountManagers = async () => {
    try {
        const payload = {
        loggedInUserName: userData.username,
        };

    const response = await Endpoints.post(
      "listSeniorAccountManagers",
      payload,
      userData.authJwtToken
    );

    // API returns an array directly
    setSeniorAccountManagers(Array.isArray(response) ? response : []);
  } catch (error) {
    console.error(error);
    setSeniorAccountManagers([]);
  }
};

    //API to get all the Regional Managers 
    const getRegionalManagers = async () => {
    try {
        const payload = {
        loggedInUserName: userData.username,
        };

        const response = await Endpoints.post(
        "regionalManagersList",
        payload,
        userData.authJwtToken
        );

        // API returns an array directly
        setRegionalManagers(Array.isArray(response) ? response : []);
    } catch (error) {
        console.error(error);
        setRegionalManagers([]);
    }
    };

    useEffect(() => {
      getInternalUsers();
      getSeniorAccountManagers();
      getRegionalManagers();
    }, []);

   //API call to check available username 
   const checkUsernameAvailability = async (value) => {
    try {
        setCheckingUsername(true);

        const payload = {
        loggedInUserName: userData.username,
        operation: "internal user",
        userName: value,
        };

        const response = await Endpoints.post(
        "saveInternalUser",
        payload,
        userData.authJwtToken
        );

        if (response.code === 9001) {
        setUsernameAvailable(true);
        setUsernameMessage(response.message || "Username is available");
        } else {
        setUsernameAvailable(false);
        setUsernameMessage(response.message || "Username is not available");
        }
    } catch (error) {
        console.error("Error checking username:", error);
        setUsernameAvailable(false);
        setUsernameMessage("Error checking username availability");
    } finally {
        setCheckingUsername(false);
    }
    };

    useEffect(() => {
    const trimmedLength = username.trim().length;

    // Case 1: Empty input -> Clear message and availability
    if (trimmedLength === 0) {
        setUsernameMessage("");
        setUsernameAvailable(false);
        return;
    }

    // Case 2: Entered 1 to 3 characters -> Prompt minimum character requirement
    if (trimmedLength < 4) {
        setUsernameAvailable(false);
        setUsernameMessage("Minimum 4 characters required");
        return;
    }

    // Case 3: 4 or more characters -> Trigger API call with 500ms debounce
    const timer = setTimeout(() => {
        checkUsernameAvailability(username.trim());
    }, 500);

    return () => clearTimeout(timer);
    }, [username]);

    //To get unique dropdown values
    const userTypes = [
    ...new Set(internalUsers.map(user => user.customerType))
    ];

    const statuses = [
    ...new Set(internalUsers.map(user => user.status))
    ];

    //Filter Data
    const filteredUsers = internalUsers.filter((user) => {
    const matchesSearch =
        user.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.mobile.includes(searchTerm);

    const matchesUserType =
        selectedUserType === "all" ||
        user.customerType === selectedUserType;

    const matchesStatus =
        selectedStatus === "all" ||
        user.status === selectedStatus;

    return matchesSearch && matchesUserType && matchesStatus;
    });
    
    //Pagination
    const ITEMS_PER_PAGE = 10;

    const [currentPage, setCurrentPage] = useState(1);

    const totalPages = Math.ceil(filteredUsers.length / ITEMS_PER_PAGE);

    const indexOfLastUser = currentPage * ITEMS_PER_PAGE;
    const indexOfFirstUser = indexOfLastUser - ITEMS_PER_PAGE;

    const currentUsers = filteredUsers.slice(
    indexOfFirstUser,
    indexOfLastUser
    );

   //========Validation to create new internal user===========
   const validateForm = () => {
    const newErrors = {};

    if (!userType) {
        newErrors.userType = "User Type is required.";
    }

    if (userType === "Account Manager") {
        if (!selectedSeniorManager) {
        newErrors.seniorManager = "Sr. Account Manager is required.";
        }

        if (!selectedRegionalManager) {
        newErrors.regionalManager = "Regional Manager is required.";
        }
    }

    if (!username.trim()) {
        newErrors.username = "Username is required.";
    } else if (!usernameAvailable) {
        newErrors.username = "Username is not available.";
    }

    if (!password.trim()) {
        newErrors.password = "Password is required.";
    }

    if (!email.trim()) {
        newErrors.email = "Email ID is required.";
    }

    if (!mobile.trim()) {
        newErrors.mobile = "Mobile Number is required.";
    } else if (mobile.length !== 10) {
        newErrors.mobile = "Please enter a valid Mobile Number.";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
    };

const saveInternalUser = async () => {
    try {
        setLoadingCreate(true);

        const payload = {
            loggedInUserName: userData.username,
            operation: "addInternalUser",
            userRole: "internaluser",
            userName: username,
            userPassword: password,
            email: email,
            mobile: mobile,
            status: status,
            userExpiryDate: "",
        };

        if (userType === "Account Manager") {
            payload.customerType = "accountmanager";
            payload.amId = selectedSeniorManager;
            payload.rmId = selectedRegionalManager;
        } else if (userType === "Regional Manager") {
            payload.customerType = "regionalmanager";
        } else {
            payload.customerType = "support";
        }

        const response = await Endpoints.post(
            "saveInternalUser",
            payload,
            userData.authJwtToken
        );

        if (response.code === 9001) {
            setToastMessage(response.message);
            setShowCreateModal(false);
            setShowAddInternalUser(false);

            getInternalUsers();
        } else {
            setToastMessage(response.message);
        }
    } catch (err) {
        console.error(err);
    } finally {
        setLoadingCreate(false);
    }
};

//Save Updated User
const handleUpdateUser = async () => {
  try {

    const payload = {
      loggedInUserName: userData.username,
      operation: "editInternalUser",
      userRole: "internaluser",
      userName: editUsername,
      userPassword: editPassword,
      email: editEmail,
      mobile: editMobile,
      status: editStatus,
      userExpiryDate: "",
    };

    if (editUserType === "Account Manager") {
      payload.customerType = "accountmanager";
    } else if (editUserType === "Regional Manager") {
      payload.customerType = "regionalmanager";
    } else {
      payload.customerType = "support";
    }

    const response = await Endpoints.post(
      "saveInternalUser",
      payload,
      userData.authJwtToken
    );

    // Extract code, result, and message safely across nested or direct structures
    const resCode = response?.code ?? response?.data?.code;
    const resResult = response?.result || response?.data?.result;
    const resMessage = response?.message || response?.data?.message;

    if (
      resCode === 9003 ||
      resCode === 9001 ||
      resCode === 9000 ||
      resResult === "Success" ||
      response?.status === 200
    ) {
      setToastMessage(resMessage || "User Updated successfully");

      // Close both modal and drawer overlays
      setShowEditModal(false);
      setShowEditDrawer(false);

      // Refresh table list
      await getInternalUsers();
    } else {
      setToastMessage(resMessage || "Failed to update user");
    }
  } catch (err) {
    console.error("Error updating internal user:", err);
    setToastMessage("An error occurred while updating the user");
  } 
};

//Edit Internal User Logic
const handleEditClick = (user) => {
  setSelectedUser(user);
  setUserType(user.customerType || "");
  setStatus(user.status?.toLowerCase() || "active");
  setEmail(user.email || "");
  setMobile(user.mobile || "");
  setUsername(user.userName || "");
  
  // Set manager assignments if available in your user object
  setSelectedSeniorManager(user.seniorManagerId || "");
  setSelectedRegionalManager(user.regionalManagerId || "");
  
  setPassword(""); // Reset password field for security
  setErrors({});
  setShowEditDrawer(true);
};

const handleCloseEditDrawer = () => {
  setShowDiscardModal(true);
};

// Discards changes: closes both the confirmation modal and the edit drawer
const handleConfirmDiscard = () => {
  setShowDiscardModal(false);
  setShowEditDrawer(false);
};

  return (
    <div className="internal-user">
         {toastMessage && (
        <div className="toast-message">
            <i className="fa-regular fa-circle-check"></i>
            {toastMessage}
        </div>
        )}
         <div className="internal-user-header">
            <div>
            <h1>Internal Users</h1>
            <p>Home / Management Console / User Management / Internal Users · Staff accounts with admin panel access</p>
         </div>
         
         <div className="wrap-add-internal-user-btn">
        <button
            className="add-internal-user-btn"
            onClick={() => setShowAddInternalUser(true)}
        >
            <i className="fa-solid fa-plus"></i>
            Add Internal User
        </button>
        </div>
        {showAddInternalUser && (
        <div
            className="internal-drawer-overlay"
            onClick={() => setShowAddInternalUser(false)}
        >
            <div
            className="internal-user-drawer"
            onClick={(e) => e.stopPropagation()}
            >
            {/* Header */}
            <div className="internal-drawer-header">
                <div>
                <h2>Add Internal User</h2>
                <p>Create a new staff account</p>
                </div>

                <button
                className="close-btn"
                onClick={() => setShowAddInternalUser(false)}
                >
                <i className="fa-solid fa-xmark"></i>
                </button>
            </div>

            {/* Body */}
            <div className="internal-drawer-body">
            <h3 className="internal-section-title">USER ACCOUNT</h3>

            <div className="internal-form-row">
              <div className="internal-form-group">
                <label>
                    User Type <span>*</span>
                </label>

                <select
                    value={userType}
                    onChange={(e) => {
                    setUserType(e.target.value);

                    if (errors.userType) {
                        setErrors((prev) => ({
                        ...prev,
                        userType: "",
                        }));
                    }
                    }}
                    className={errors.userType ? "input-error" : ""}
                >
                    <option value="">-- Select --</option>
                    <option value="Account Manager">Account Manager</option>
                    <option value="Regional Manager">Regional Manager</option>
                    <option value="Support">Support</option>
                </select>

                {errors.userType && (
                    <div className="field-error">
                    ⚠ {errors.userType}
                    </div>
                )}
                </div>

                <div className="internal-form-group">
                <label>Status</label>

                <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                </select>
                </div>
            </div>

            {userType === "Account Manager" && (
            <div className="internal-form-row">

               <div className="internal-form-group">
            <label>
                Sr. Account Manager <span>*</span>
            </label>

            <select
                value={selectedSeniorManager}
                onChange={(e) => {
                setSelectedSeniorManager(Number(e.target.value));

                if (errors.seniorManager) {
                    setErrors((prev) => ({
                    ...prev,
                    seniorManager: "",
                    }));
                }
                }}
                className={errors.seniorManager ? "input-error" : ""}
            >
                <option value="">-- Select --</option>

                {seniorAccountManagers.map((manager) => (
                <option key={manager.userId} value={manager.userId}>
                    {manager.userName}
                </option>
                ))}
            </select>

            {errors.seniorManager && (
                <div className="field-error">
                ⚠ {errors.seniorManager}
                </div>
            )}
            </div>

                <div className="internal-form-group">
            <label>
                Regional Manager <span>*</span>
            </label>

            <select
                value={selectedRegionalManager}
                onChange={(e) => {
                setSelectedRegionalManager(Number(e.target.value));

                if (errors.regionalManager) {
                    setErrors((prev) => ({
                    ...prev,
                    regionalManager: "",
                    }));
                }
                }}
                className={errors.regionalManager ? "input-error" : ""}
            >
                <option value="">-- Select --</option>

                {regionalManagers.map((manager) => (
                <option key={manager.userId} value={manager.userId}>
                    {manager.userName}
                </option>
                ))}
            </select>

            {errors.regionalManager && (
                <div className="field-error">
                ⚠ {errors.regionalManager}
                </div>
            )}
            </div>

            </div>
            )}

            {/* Username */}
           <div className="internal-form-group">
            <label>
                Username <span>*</span>
            </label>

            <input
                type="text"
                placeholder="Enter username"
                value={username}
                onChange={(e) => {
                setUsername(e.target.value);

                if (errors.username) {
                    setErrors((prev) => ({
                    ...prev,
                    username: "",
                    }));
                }
                }}
                className={errors.username ? "input-error" : ""}
            />

            {/* Field Validation Error */}
            {errors.username && (
                <div className="field-error">
                ⚠ {errors.username}
                </div>
            )}

            {/* Loading Indicator */}
            {checkingUsername && (
                <div className="username-checking">
                Checking username...
                </div>
            )}

            {/* Availability Status / Character Hint Message */}
            {!checkingUsername && !errors.username && usernameMessage && (
                <div
                className={`username-status ${
                    usernameAvailable ? "success" : "error"
                }`}
                >
                {usernameAvailable ? "✓ " : "✗ "}
                {usernameMessage}
                </div>
            )}
            </div>

            {/* Password */}
            <div className="internal-form-group">
            <label>
                Password <span>*</span>
            </label>

            <input
                type="password"
                placeholder="Enter password"
                value={password}
                onChange={(e) => {
                setPassword(e.target.value);

                if (errors.password) {
                    setErrors((prev) => ({
                    ...prev,
                    password: "",
                    }));
                }
                }}
                className={errors.password ? "input-error" : ""}
            />

            {errors.password && (
                <div className="field-error">
                ⚠ {errors.password}
                </div>
            )}

            <small>6-20 characters · no spaces</small>
            </div>

            {/* Email + Mobile */}
            <div className="internal-form-row">

              <div className="internal-form-group">
            <label>
                Email ID <span>*</span>
            </label>

            <input
                type="email"
                placeholder="name@company.com"
                value={email}
                onChange={(e) => {
                setEmail(e.target.value);

                if (errors.email) {
                    setErrors((prev) => ({
                    ...prev,
                    email: "",
                    }));
                }
                }}
                className={errors.email ? "input-error" : ""}
            />

            {errors.email && (
                <div className="field-error">
                ⚠ {errors.email}
                </div>
            )}
            </div>

               <div className="internal-form-group">
            <label>
                Mobile Number <span>*</span>
            </label>

            <input
                type="text"
                placeholder="10-digit mobile number"
                maxLength={10}
                value={mobile}
                onChange={(e) => {
                setMobile(e.target.value.replace(/\D/g, ""));

                if (errors.mobile) {
                    setErrors((prev) => ({
                    ...prev,
                    mobile: "",
                    }));
                }
                }}
                className={errors.mobile ? "input-error" : ""}
            />

            {errors.mobile && (
                <div className="field-error">
                ⚠ {errors.mobile}
                </div>
            )}
            </div>

          </div>
        </div>

            <div className="drawer-footer-internal">
                <button
                className="cancel-btn"
                onClick={() => setShowAddInternalUser(false)}
                >
                Cancel
                </button>

                <button
                    className="create-btn"
                    onClick={() => {
                        if (validateForm()) {
                            setShowCreateModal(true);
                        }
                    }}
                >
                    Create User
                </button>
            </div>

            </div>
        </div>
        )}
         </div>
         {showCreateModal && (
        <div className="internal-modal-overlay">
        <div className="create-internal-modal">

            <div className="create-internal-header">

                <div className="create-internal-icon">
                    <CircleHelp size={22} strokeWidth={2.2} />
                </div>

                <h2>Create this internal user?</h2>

                </div>

                <div className="create-internal-body">

                    You're about to create a new{" "}
                    <b>{userType}</b> staff account.

                </div>

                <div className="create-internal-footer">

                <button
                    className="cancel-btn"
                    onClick={() => setShowCreateModal(false)}
                >
                    Cancel
                </button>

                <button
                    className="create-btn"
                    onClick={saveInternalUser}
                    disabled={loadingCreate}
                >
                    {loadingCreate ? "Creating..." : "Create User"}
                    </button>

                </div>

                </div>
            </div>
        )}

         <div className="internal-card">
         <div className="internal-toolbar">
         <div className="internal-toolbar-left">

         <div className="search-box">
            <i className="fa-solid fa-magnifying-glass"></i>
            <input
            type="text"
            placeholder="Search username, email or mobile..."
            value={searchTerm}
            onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
            }}
            />
        </div>

        <select
        value={selectedUserType}
        onChange={(e) => {
            setSelectedUserType(e.target.value);
            setCurrentPage(1);
        }}
        >
        <option value="all">All user types</option>

        {userTypes.map((type) => (
            <option key={type} value={type}>
            {type}
            </option>
        ))}
        </select>

        <select
        value={selectedStatus}
        onChange={(e) => {
            setSelectedStatus(e.target.value);
            setCurrentPage(1);
        }}
        >
        <option value="all">All statuses</option>

        {statuses.map((status) => (
            <option key={status} value={status}>
            {status}
            </option>
        ))}
        </select>

        </div>

        <div className="internal-toolbar-right">
        <span>{filteredUsers.length} of {internalUsers.length} users</span>
        </div>
      </div>

      <div>
        <table className="internal-table">
        <thead>
            <tr>
            <th>USER</th>
            <th>CONTACT</th>
            <th>USER TYPE</th>
            <th>STATUS</th>
            <th>ACTIONS</th>
            </tr>
        </thead>
         <tbody>
        {loading ? (
            <tr>
            <td colSpan="5">
                <div className="table-loader">
                <div className="spinner"></div>
                <p>Loading Internal Users...</p>
                </div>
            </td>
            </tr>
        ) : currentUsers.length > 0 ? (
            currentUsers.map((user) => (
            <tr key={user.userId}>
                {/* USER */}
                <td>
                <div className="internal-user-info">
                    <div className="internal-user-avatar">
                    {user.userName?.charAt(0).toUpperCase()}
                    </div>

                    <div className="internal-user-details">
                    <div className="internal-user-name">
                        {user.userName}
                    </div>

                    <div className="internal-user-date">
                        Since {new Date(user.createdDate).toLocaleDateString("en-GB")}
                    </div>
                    </div>
                </div>
                </td>

                {/* CONTACT */}
                <td>
                <div className="internal-contact-info">
                    <div className="internal-mobile">
                    {user.mobile}
                    </div>

                    <div className="internal-email">
                    {user.email}
                    </div>
                </div>
                </td>

                {/* USER TYPE */}
                <td>
                <span
                    className={`user-type-badge ${
                    user.customerType.toLowerCase() === "accountmanager"
                        ? "account-manager"
                        : user.customerType.toLowerCase() === "regionalmanager"
                        ? "regional-manager"
                        : "support"
                    }`}
                >
                    {user.customerType}
                </span>
                </td>

                {/* STATUS */}
                <td>
                <span
                    className={`internal-status-badge ${
                    user.status.toLowerCase() === "active"
                        ? "status-active"
                        : "status-inactive"
                    }`}
                >
                    {user.status}
                </span>
                </td>

                {/* ACTION */}
                <td>
                <button 
                    className="internal-action-btn"
                    disabled={isFetchingUser}
                    onClick={() => getInternalUserData(user.userName)}
                >
                    <i className="fa-regular fa-pen-to-square"></i>
                </button>
                </td>
            </tr>
            ))
        ) : (
            <tr>
            <td colSpan="5">
                <div className="table-loader">
                <p>No Internal Users Found</p>
                </div>
            </td>
            </tr>
        )}
        </tbody>
     </table>
     
     {showEditDrawer && (
        <div
            className="internal-drawer-overlay"
            onClick={() => setShowEditDrawer(false)}
        >
            <div
            className="internal-user-drawer"
            onClick={(e) => e.stopPropagation()}
            >
            {/* Header */}
            <div className="internal-drawer-header">
                <div>
                <h2>Edit Internal User</h2>
                <p>Update account details for {selectedUser?.userName}</p>
                </div>

                <button
                className="close-btn"
                onClick={handleCloseEditDrawer}
                >
                <i className="fa-solid fa-xmark"></i>
                </button>
            </div>

            {/* Body */}
            <div className="internal-drawer-body">
                <h3 className="internal-section-title">USER ACCOUNT</h3>

                <div className="internal-form-row">
                {/* User Type */}
                <div className="internal-form-group">
                    <label>
                    User Type <span>*</span>
                    </label>
                    <select
                    value={editUserType}
                    onChange={(e) => {
                        setEditUserType(e.target.value);
                        if (editErrors.userType) {
                        setEditErrors((prev) => ({ ...prev, userType: "" }));
                        }
                    }}
                    className={editErrors.userType ? "input-error" : ""}
                    >
                    <option value="">-- Select --</option>
                    <option value="Account Manager">Account Manager</option>
                    <option value="Regional Manager">Regional Manager</option>
                    <option value="Support">Support</option>
                    </select>
                    {editErrors.userType && (
                    <div className="field-error">⚠ {editErrors.userType}</div>
                    )}
                </div>

                {/* Status */}
                <div className="internal-form-group">
                    <label>Status</label>
                    <select
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value)}
                    >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    </select>
                </div>
                </div>

                {/* Username */}
                <div className="internal-form-group">
                <label>
                    Username <span>*</span>
                </label>
                <input
                    type="text"
                    placeholder="Enter username"
                    value={editUsername}
                    disabled
                    onChange={(e) => {
                    setEditUsername(e.target.value);
                    if (editErrors.username) {
                        setEditErrors((prev) => ({ ...prev, username: "" }));
                    }
                    }}
                    className={editErrors.username ? "input-error" : ""}
                />
                {editErrors.username && (
                    <div className="field-error">⚠ {editErrors.username}</div>
                )}
                </div>

                {/* Password (Visible Text) */}
                <div className="internal-form-group">
                <label>
                    Password <span>*</span>
                </label>
                <input
                    type="text"
                    placeholder="Enter password"
                    value={editPassword}
                    onChange={(e) => {
                    setEditPassword(e.target.value);
                    if (editErrors.password) {
                        setEditErrors((prev) => ({ ...prev, password: "" }));
                    }
                    }}
                    className={editErrors.password ? "input-error" : ""}
                />
                {editErrors.password && (
                    <div className="field-error">⚠ {editErrors.password}</div>
                )}
                </div>

                {/* Email & Mobile */}
                <div className="internal-form-row">
                <div className="internal-form-group">
                    <label>
                    Email ID <span>*</span>
                    </label>
                    <input
                    type="email"
                    placeholder="name@company.com"
                    value={editEmail}
                    onChange={(e) => {
                        setEditEmail(e.target.value);
                        if (editErrors.email) {
                        setEditErrors((prev) => ({ ...prev, email: "" }));
                        }
                    }}
                    className={editErrors.email ? "input-error" : ""}
                    />
                    {editErrors.email && (
                    <div className="field-error">⚠ {editErrors.email}</div>
                    )}
                </div>

                <div className="internal-form-group">
                    <label>
                    Mobile Number <span>*</span>
                    </label>
                    <input
                    type="text"
                    placeholder="10-digit mobile number"
                    maxLength={10}
                    value={editMobile}
                    onChange={(e) => {
                        setEditMobile(e.target.value.replace(/\D/g, ""));
                        if (editErrors.mobile) {
                        setEditErrors((prev) => ({ ...prev, mobile: "" }));
                        }
                    }}
                    className={editErrors.mobile ? "input-error" : ""}
                    />
                    {editErrors.mobile && (
                    <div className="field-error">⚠ {editErrors.mobile}</div>
                    )}
                </div>
                </div>
            </div>

            {/* Footer */}
            <div className="drawer-footer-internal">
                <button
                className="cancel-btn"
                onClick={handleCloseEditDrawer}
                >
                Cancel
                </button>

                <button
                className="create-btn"
                onClick={() => {
                if (validateEditForm()) {
                    setShowEditModal(true);
                }
                }}
            >
                Save Changes
            </button>
            </div>
            </div>
        </div>
        )}

        {showEditModal && (
        <div className="internal-modal-overlay">
            <div className="create-internal-modal">
            <div className="create-internal-header">
                <div className="create-internal-icon">
                <CircleHelp size={22} strokeWidth={2.2} />
                </div>

                <h2>Save changes to this account?</h2>
            </div>

            <div className="create-internal-body">
                You're about to update <b>{selectedUser?.userName || editUsername}</b>'s profile.
            </div>

            <div className="create-internal-footer">
                <button
                className="cancel-btn"
                onClick={() => setShowEditModal(false)}
                >
                Cancel
                </button>

                <button
                className="create-btn"
                onClick={handleUpdateUser}
                disabled={loadingUpdate}
                >
                {loadingUpdate ? "Saving..." : "Save Changes"}
                </button>
            </div>
            </div>
        </div>
        )}

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
              <button
                className="btn-danger"
                onClick={handleConfirmDiscard}
              >
                Discard
              </button>
            </div>
          </div>
        </div>
      )}

        <div className="internal-table-footer">
        <span>
         Showing {filteredUsers.length === 0 ? 0 : indexOfFirstUser + 1}–
         {Math.min(indexOfLastUser, filteredUsers.length)} of {filteredUsers.length}
        </span>

        <div className="internal-pagination">
        <button
            className="page-btn"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(currentPage - 1)}
        >
            <i className="fa-solid fa-chevron-left"></i>
        </button>
        {totalPages <= 4 ? (
        Array.from({ length: totalPages }, (_, i) => (
            <button
            key={i}
            className={`page-btn ${currentPage === i + 1 ? "active" : ""}`}
            onClick={() => setCurrentPage(i + 1)}
            >
            {i + 1}
            </button>
        ))
        ) : (
        <>
            {[1, 2, 3].map((page) => (
            <button
                key={page}
                className={`page-btn ${currentPage === page ? "active" : ""}`}
                onClick={() => setCurrentPage(page)}
            >
                {page}
            </button>
            ))}

            <span className="pagination-dots">...</span>

            <button
            className={`page-btn ${
                currentPage === totalPages ? "active" : ""
            }`}
            onClick={() => setCurrentPage(totalPages)}
            >
            {totalPages}
            </button>
        </>
        )}

        <button
            className="page-btn"
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(currentPage + 1)}
        >
            <i className="fa-solid fa-chevron-right"></i>
        </button>
        </div>

        </div>
      </div>
     </div>
    </div>
  )
}

export default InternalUsers