import React, { useEffect, useState, useContext } from "react";
import "./ExternalUsers.css";
import Endpoints from "../../api/endpoint";
import { AuthContext } from "../../context/AuthContext";
import { Lock } from "lucide-react";

const ExternalUsers = () => {
  const { userData } = useContext(AuthContext);

  const [loading, setLoading] = useState(false);

  const [checkingUsername, setCheckingUsername] = useState(false);
  const [usernameMessage, setUsernameMessage] = useState("");
  const [usernameAvailable, setUsernameAvailable] = useState(false);
  const [errors, setErrors] = useState({});
  const [errorInput, setErrorInput] = useState({});

  const [externalUsers, setExternalUsers] = useState([]);
  const [internalUsers, setInternalUsers] = useState([]);

  const [organizations, setOrganizations] = useState([]);
  const [selectedOrg, setSelectedOrg] = useState("");

  const [departments, setDepartments] = useState([]);
  const [selectedDept, setSelectedDept] = useState("");

  const [toastMessage, setToastMessage] = useState("");

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUserType, setSelectedUserType] = useState("");
  const [selectedAccountType, setSelectedAccountType] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");

  const [showAddExternalUser, setShowAddExternalUser] = useState(false);
  const [addFormData, setAddFormData] = useState({
    customerType: "client",
    userName: "",
    userPassword: "",
    status: "active",
    billingType: "prepaid",
    billingCycle: "monthly",
    senderIdType: "dynamic",
    priority: "high",
    isVisualizeAllowed: "No",
    serviceType: "null",
    userAccountType: "WEB",
    smppCharset: "ASCII",
    txSession: "0",
    rxSession: "0",
    trxSession: "0",
    email: "",
    mobile: "",
    accountManagerName: "",
    isDndCheck: "No",
    isCreditHistoryAllowed: "No",
    isNumberMasking: "No",
    numberMaskingCount: "1",
    isLowCreditAlert: "No",
    lowCreditAlertLimit: "",
    isIntlAllowed: "",
    userExpiryDate: "",
  });

  const [showEditExternalUser, setShowEditExternalUser] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [editFormData, setEditFormData] = useState({});

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Function to verify username availability
const checkUsernameAvailability = async (val) => {
  setCheckingUsername(true);
  setUsernameMessage("");

  try {
    const payload = {
      loggedInUserName: userData.username,
      operation: "external user",
      userName: val,
    };

    const response = await Endpoints.post(
      "saveExternalUser",
      payload,
      userData.authJwtToken
    );

    // Code 9001 indicates availability
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

// Handle input change with character length check (> 3 characters)
const handleUsernameChange = (e) => {
  const value = e.target.value;

  // Update form state
  setAddFormData((prev) => ({ ...prev, userName: value }));

  if (errors.userName) {
    setErrors((prev) => ({ ...prev, userName: "" }));
  }
  setUsernameMessage("");

  if (window.usernameTimer) clearTimeout(window.usernameTimer);

  // Check character count
  if (value.trim().length === 0) {
    // Empty field -> clear everything
    setUsernameMessage("");
  } else if (value.trim().length < 4) {
    // Less than 4 characters -> prompt user
    setUsernameAvailable(false);
    setUsernameMessage("Minimum 4 characters required");
  } else {
    window.usernameTimer = setTimeout(() => {
      checkUsernameAvailability(value.trim());
    }, 500);
  }
};

  //===========Get all Organization list data==============
const getAllOrganization = async () => {
  try {
    const payload = {
      loggedInUserName: userData.username,
    };

    const response = await Endpoints.post(
      "getAllOrganization", 
      payload,
      userData.authJwtToken
    );

    if (response.code === 11000) {
      const orgList = response.data?.organisationList || [];
      setOrganizations(orgList);
      return orgList;
    } else {
      setToastMessage(response.message);
      return [];
    }
  } catch (error) {
    console.error("Error fetching organizations:", error);
    return [];
  }
};

// 2. Fetch Departments for specific selected orgId(s)
const getAllDepartment = async (orgIds) => {
  if (!orgIds || orgIds.length === 0) {
    setDepartments([]);
    return;
  }

  try {
    const payload = {
      loggedInUserName: userData.username,
      orgId: orgIds, // Expects an array like [selectedOrgId]
    };

    const response = await Endpoints.post(
      "getAlldepartment",
      payload,
      userData.authJwtToken
    );

    if (response.code === 4003) {
      setDepartments(response.data?.departmentList || []);
    } else {
      setToastMessage(response.message);
      setDepartments([]);
    }
  } catch (error) {
    console.error("Error fetching departments:", error);
    setDepartments([]);
  }
};

  //============Get all external users data=============
  const getExternalUsers = async () => {
    setLoading(true);

    try {
      const payload = {
        loggedInUserName: userData.username,
      };

      const response = await Endpoints.post(
        "externalListUser",
        payload,
        userData.authJwtToken
      );

      if (response.code === 14000) {
        const userList = response.data.listUserFormDataGrid || [];
        setExternalUsers([...userList].reverse());
      } else {
        setToastMessage(response.message);
      }
    } catch (error) {
      console.error("Error fetching external users:", error);
    } finally {
      setLoading(false);
    }
  };

  //===========Get all internal users data=============
  const getInternalUsers = async () => {
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
        setInternalUsers(response.data?.userList || []);
      } else {
        setToastMessage(response.message);
      }
    } catch (error) {
      console.error("Error fetching internal users:", error);
    }
  };

useEffect(() => {
  const initData = async () => {
    await Promise.all([
      getAllOrganization(),
      getExternalUsers(),
      getInternalUsers(),
    ]);
  };

  initData();
}, []);

const handleOrgChange = (e) => {
  const selectedOrgId = e.target.value;
  
  setSelectedOrg(selectedOrgId);
  setSelectedDept(""); // Reset department selection whenever org changes
  setDepartments([]); // Clear previous options immediately

  if (errors.orgId) setErrors((prev) => ({ ...prev, orgId: "" }));

  if (selectedOrgId) {
    // Pass as single-element array to match expected payload format: { orgId: ["123"] }
    getAllDepartment([selectedOrgId]);
  }
};

  // Filter search table
  const filteredExternalUsers = externalUsers.filter((user) => {
  const search = searchTerm.toLowerCase().trim();

    const matchesSearch =
      !search ||
      user.userName?.toLowerCase().includes(search) ||
      user.emailId?.toLowerCase().includes(search) ||
      user.contactNumber?.toLowerCase().includes(search);

    const matchesUserType =
      !selectedUserType ||
      user.customerType?.toLowerCase() === selectedUserType.toLowerCase();

    const matchesAccountType =
      !selectedAccountType ||
      user.userAccountType?.toLowerCase() ===
        selectedAccountType.toLowerCase();

    const matchesStatus =
      !selectedStatus ||
      user.status?.toLowerCase() === selectedStatus.toLowerCase();

    return (
      matchesSearch &&
      matchesUserType &&
      matchesAccountType &&
      matchesStatus
    );
  });

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedUserType, selectedAccountType, selectedStatus]);

  // Calculate total pages based on filtered results
  const totalPages = Math.ceil(filteredExternalUsers.length / itemsPerPage) || 1;

  // Get current 10 items to display in the table
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentTableData = filteredExternalUsers.slice(
    indexOfFirstItem,
    indexOfLastItem
  );

  // Helper to generate smart pagination numbers with ellipsis (...)
  const getPageNumbers = () => {
    const pageNumbers = [];
    const maxVisibleButtons = 5;

    if (totalPages <= maxVisibleButtons) {
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
    } else {
      if (currentPage <= 3) {
        pageNumbers.push(1, 2, 3, "...", totalPages);
      } else if (currentPage >= totalPages - 2) {
        pageNumbers.push(
          1,
          "...",
          totalPages - 2,
          totalPages - 1,
          totalPages
        );
      } else {
        pageNumbers.push(1, "...", currentPage, "...", totalPages);
      }
    }

    return pageNumbers;
  };

  const userTypeOptions = [
    ...new Set(
      externalUsers.map((user) => user.customerType).filter(Boolean)
    ),
  ];

  const accountTypeOptions = [
    ...new Set(
      externalUsers.map((user) => user.userAccountType).filter(Boolean)
    ),
  ];

  const statusOptions = [
    ...new Set(externalUsers.map((user) => user.status).filter(Boolean)),
  ];

//=============Open edit flow================
const handleEditClick = async (user) => {
  try {
    // 1. Determine the payload key based on customerType
    const customerTypeKeyMap = {
      client: "clientName",
      admin: "adminName",
      seller: "sellerName",
      reseller: "resellerName"
    };

    const typeKey = customerTypeKeyMap[user.customerType?.toLowerCase()] || "clientName";

    // 2. Build the dynamic payload
    const payload = {
      loggedInUserName: userData?.username || "",
      [typeKey]: user.userName || ""
    };

    // 3. API Call to fetch external user details
    const response = await Endpoints.post(
      "viewExternalUser",
      payload,
      userData?.authJwtToken
    );

    if ((response.code === 9003 || response.code === 200) && response.data?.user) {
      const fetchedUser = response.data.user;

      setSelectedUser(fetchedUser);

      // 4. Populate editFormData using the fetched response values
      setEditFormData({
        userType: fetchedUser.customerType || "Client",
        username: fetchedUser.userName || "",
        password: fetchedUser.userPassword || "",
        status: fetchedUser.status
          ? fetchedUser.status.charAt(0).toUpperCase() + fetchedUser.status.slice(1).toLowerCase()
          : "Active",
        billingType: fetchedUser.billingType
          ? fetchedUser.billingType.toUpperCase()
          : "PREPAID",
        billingCycle: fetchedUser.billingCycle
          ? fetchedUser.billingCycle.charAt(0).toUpperCase() + fetchedUser.billingCycle.slice(1).toLowerCase()
          : "Monthly",
        senderIdType: fetchedUser.senderIdType
          ? fetchedUser.senderIdType.charAt(0).toUpperCase() + fetchedUser.senderIdType.slice(1).toLowerCase()
          : "Dynamic",
        priority: fetchedUser.priority
          ? fetchedUser.priority.charAt(0).toUpperCase() + fetchedUser.priority.slice(1).toLowerCase()
          : "High",
        isVisualizeAllowed: fetchedUser.isVisualizeAllowed || "No",
        serviceType: fetchedUser.serviceType || "demo",
        accountType: fetchedUser.userAccountType || "API",
        organisation: fetchedUser.orgName || fetchedUser.provider || "",
        department: fetchedUser.deptName || fetchedUser.department || "IT",
        emailId: fetchedUser.email || "",
        mobileNumber: fetchedUser.mobile || "",
        accountManager: fetchedUser.accountManagerName || "",
        dndCheck: fetchedUser.isDndCheck || "Yes",
        creditHistory: fetchedUser.isCreditHistoryAllowed || "No",
        mobileMasking: fetchedUser.isNumberMasking || "No",
        lowCreditNotif: fetchedUser.isLowCreditAlert || "No",
        creditThreshold: fetchedUser.lowCreditAlertLimit?.toString() || "-",
        creditAlertMode: fetchedUser.creditAlertMode || "Not Applicable"
      });

      setShowEditExternalUser(true);
    } else {
      console.error("Failed to fetch user details:", response.message);
    }
  } catch (error) {
    console.error("Error calling viewExternalUser API:", error);
  }
};

//==============Saving External User==================
const validateForm = () => {
  const newErrors = {};

  // Updated to customerType
  if (!addFormData.customerType) {
    newErrors.customerType = "User Type is required.";
  }

  // Username validation
  if (!addFormData.userName || addFormData.userName.trim().length < 4) {
    newErrors.userName = "Username is required";
  } else if (!usernameAvailable) {
    newErrors.userName = "Please enter an available username.";
  }

  // Updated from addFormData.password to addFormData.userPassword
  if (!addFormData.userPassword) {
    newErrors.password = "Password is required.";
  } else if (
    addFormData.userPassword.length < 6 ||
    addFormData.userPassword.length > 20
  ) {
    newErrors.password = "Password must be 6-20 characters long.";
  }

  if (!addFormData.serviceType || addFormData.serviceType === "null") {
    newErrors.serviceType = "Service Type is required.";
  }

  if (!selectedOrg) newErrors.orgId = "Organisation is required.";
  if (!selectedDept) newErrors.deptId = "Department is required.";

  if (!addFormData.email) {
    newErrors.email = "Email ID is required.";
  } else if (!/\S+@\S+\.\S+/.test(addFormData.email)) {
    newErrors.email = "Enter a valid email address.";
  }

  if (!addFormData.mobile) {
    newErrors.mobile = "Mobile Number is required.";
  } else if (addFormData.mobile.length !== 10) {
    newErrors.mobile = "Mobile number must be exactly 10 digits.";
  }

  if (
    addFormData.isNumberMasking === "Yes" &&
    (addFormData.numberMaskingCount === undefined ||
      addFormData.numberMaskingCount === "")
  ) {
    newErrors.numberMaskingCount = "Masking Count is required.";
  }

  if (
    addFormData.isLowCreditAlert === "Yes" &&
    !addFormData.lowCreditAlertLimit
  ) {
    newErrors.lowCreditAlertLimit = "Credit Limit is required.";
  }

  setErrors(newErrors);
  return Object.keys(newErrors).length === 0;
};

const handleCreateUser = async () => {
  if (!validateForm()) return;

  try {
    const payload = {
      ...addFormData,
      loggedInUserName: userData?.username || "",
      operation: "addUser",
      orgId: selectedOrg || "1",
      deptId: selectedDept || "100",
      customerType: addFormData.customerType.toLowerCase(),
      billingType: addFormData.billingType.toLowerCase(),
      billingCycle: addFormData.billingCycle.toLowerCase(),
      senderIdType: addFormData.senderIdType.toLowerCase(),
      priority: addFormData.priority.toLowerCase(),
      status: addFormData.status.toLowerCase(),
      serviceType: addFormData.serviceType ? addFormData.serviceType : "null",
      userExpiryDate: "", // Always empty string as requested
    };

    const response = await Endpoints.post(
      "saveExternalUser",
      payload,
      userData.authJwtToken
    );

    if (response.code === 9001 || response.code === 200) {
      setShowAddExternalUser(false);
      // Reset form states here if needed
      setToastMessage(response.message || "User Added successfully");

      setTimeout(() => {
        setToastMessage("");
      }, 3000);
    } else {
      console.error(response.message);
    }
  } catch (error) {
    console.error("Error creating external user:", error);
  }
};


//==================Edit to change data in external user===================
const validateEditForm = () => {
  const newErrors = {};

  // Password validation (editable field)
  const password = editFormData.userPassword || editFormData.password;
  if (!password) {
    newErrors.password = "Password is required.";
  } else if (password.length < 6 || password.length > 20) {
    newErrors.password = "Password must be 6-20 characters long.";
  }

  // Email ID validation (editable field)
  const email = editFormData.email || editFormData.emailId;
  if (!email) {
    newErrors.email = "Email ID is required.";
  } else if (!/\S+@\S+\.\S+/.test(email)) {
    newErrors.email = "Enter a valid email address.";
  }

  // Mobile number validation (editable field)
  const mobile = editFormData.mobile || editFormData.mobileNumber;
  if (!mobile) {
    newErrors.mobile = "Mobile number is required.";
  } else if (String(mobile).length !== 10) {
    newErrors.mobile = "Mobile number must be exactly 10 digits.";
  }

  // Conditional credit limit validation
  const isLowCredit = editFormData.isLowCreditAlert || editFormData.lowCreditNotif;
  const creditLimit = editFormData.lowCreditAlertLimit || editFormData.creditThreshold;
  if (isLowCredit === "Yes" && !creditLimit) {
    newErrors.lowCreditAlertLimit = "Credit Limit is required.";
  }

  setErrors(newErrors);
  return Object.keys(newErrors).length === 0;
};

const handleUpdateUser = async () => {
  if (!validateEditForm()) return;

  try {
    const payload = {
      accountManagerName: editFormData.accountManagerName || editFormData.accountManager || "",
      billingCycle: (editFormData.billingCycle || "Monthly").toLowerCase(),
      billingType: (editFormData.billingType || "PREPAID").toLowerCase(),
      clientName: editFormData.clientName || editFormData.userName || editFormData.username || "",
      customerType: editFormData.customerType || editFormData.userType || "Client",
      deptId: Number(selectedDept || editFormData.deptId || 1),
      email: editFormData.email || editFormData.emailId || "",
      isCreditHistoryAllowed: editFormData.isCreditHistoryAllowed || editFormData.creditHistory || "No",
      isDndCheck: editFormData.isDndCheck || editFormData.dndCheck || "No",
      isIntlAllowed: editFormData.isIntlAllowed || "N",
      isLowCreditAlert: editFormData.isLowCreditAlert || editFormData.lowCreditNotif || "No",
      isNumberMasking: editFormData.isNumberMasking || editFormData.mobileMasking || "No",
      isVisualizeAllowed: editFormData.isVisualizeAllowed || "Yes",
      loggedInUserName: userData?.username || "telsp",
      lowCreditAlertLimit: editFormData.lowCreditAlertLimit || editFormData.creditThreshold || "0",
      mobile: editFormData.mobile || editFormData.mobileNumber || "",
      numberMaskingCount: editFormData.numberMaskingCount || "0",
      operation: "editUser",
      orgId: Number(selectedOrg || editFormData.orgId || 1),
      priority: (editFormData.priority || "High").toLowerCase(),
      rxSession: editFormData.rxSession || "0",
      senderIdType: (editFormData.senderIdType || "Static").toLowerCase(),
      smppCharset: editFormData.smppCharset || "ASCII",
      status: (editFormData.status || "Active").toLowerCase(),
      trxSession: editFormData.trxSession || "0",
      txSession: editFormData.txSession || "0",
      userAccountType: editFormData.userAccountType || editFormData.accountType || "API",
      userExpiryDate: editFormData.userExpiryDate || "2025-10-18 23:59:59",
      userName: editFormData.userName || editFormData.username || "",
      userPassword: editFormData.userPassword || editFormData.password || ""
    };

    const response = await Endpoints.post(
      "saveExternalUser",
      payload,
      userData.authJwtToken
    );

    if (response.code === 9003 || response.code === 9001 || response.code === 200) {
      setShowEditExternalUser(false);
      setToastMessage(response.message || "User Updated successfully");

      setTimeout(() => {
        setToastMessage("");
      }, 3000);
    } else {
      console.error(response.message);
    }
  } catch (error) {
    console.error("Error updating external user:", error);
  }
};

const [initialFormData, setInitialFormData] = useState(null);
const [showDiscardModal, setShowDiscardModal] = useState(false);

const hasFormChanged = () => {
  if (!initialFormData || !editFormData) return false;
  return JSON.stringify(initialFormData) !== JSON.stringify(editFormData);
};

// Call this when opening the Edit Drawer (e.g., inside handleOpenEditDrawer)
const handleOpenEditDrawer = (userData) => {
  setEditFormData(userData);
  setInitialFormData(userData); // Store initial snapshot
  setErrors({});
  setShowEditExternalUser(true);
};

// Triggered when user clicks Cross (X), Cancel, or Overlay in Edit Drawer
const handleAttemptClose = () => {
  if (hasFormChanged()) {
    setShowDiscardModal(true);
  } else {
    handleConfirmDiscard();
  }
};

// Reset state and close drawer on confirmed discard
const handleConfirmDiscard = () => {
  setShowDiscardModal(false);
  setShowEditExternalUser(false);
  setEditFormData({});
  setInitialFormData(null);
  setErrors({});
};

  return (
    <div className="external-user">
       {toastMessage && (
        <div className="toast-message">
            <i className="fa-regular fa-circle-check"></i>
            {toastMessage}
        </div>
        )}
      <div className="external-user-header">
        <div>
          <h1>External Users</h1>
          <p>
            Home / Management Console / User Management / External Users · All
            external accounts across your hierarchy
          </p>
        </div>

        <div className="wrap-add-external-user-btn">
          <button
            className="add-external-user-btn"
            onClick={() => setShowAddExternalUser(true)}
          >
            <i className="fa-solid fa-plus"></i>
            Add External User
          </button>
        </div>
      </div>

     {showAddExternalUser && (
      <div
        className="external-drawer-overlay"
        onClick={() => setShowAddExternalUser(false)}
      >
        <div
          className="external-user-drawer"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="external-drawer-header">
            <div>
              <h2>Add External User</h2>
              <p>Create a new external user account</p>
            </div>

            <button
              className="close-btn"
              onClick={() => setShowAddExternalUser(false)}
            >
              <i className="fa-solid fa-xmark"></i>
            </button>
          </div>

          {/* Body */}
          <div className="external-drawer-body">
            <div className="external-section">
              <h3 className="external-section-title">USER ACCOUNT</h3>

              <div className="external-form-grid">
                {/* Customer Type */}
                <div className="external-form-group">
                  <label>
                    User Type <span>*</span>
                  </label>
                  <select
                    value={addFormData.customerType}
                    onChange={(e) =>
                      setAddFormData({ ...addFormData, customerType: e.target.value })
                    }
                  >
                    <option value="client">Client</option>
                    <option value="admin">Admin</option>
                    <option value="reseller">Reseller</option>
                    <option value="seller">Seller</option>
                  </select>
                </div>

                {/* Username */}
                <div className="external-form-group">
                  <label>
                    Username <span>*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Enter username"
                    value={addFormData.userName || ""}
                    onChange={handleUsernameChange}
                    className={errors.userName ? "input-error" : ""}
                  />
                  {errors.userName && (
                    <div className="field-error">⚠ {errors.userName}</div>
                  )}
                  {checkingUsername && (
                    <div className="username-checking">Checking username...</div>
                  )}
                  {!checkingUsername && !errors.userName && usernameMessage && (
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
                <div className="external-form-group">
                  <label>
                    Password <span>*</span>
                  </label>
                  <input
                    type="password"
                    placeholder="Enter password"
                    value={addFormData.userPassword}
                    onChange={(e) => {
                      setAddFormData({ ...addFormData, userPassword: e.target.value });
                      if (errors.password) setErrors((prev) => ({ ...prev, password: "" }));
                    }}
                    className={errors.password ? "input-error" : ""}
                  />
                  {errors.password && (
                    <div className="field-error">⚠ {errors.password}</div>
                  )}
                </div>

                {/* Status */}
                <div className="external-form-group">
                  <label>Status</label>
                  <select
                    value={addFormData.status}
                    onChange={(e) =>
                      setAddFormData({ ...addFormData, status: e.target.value })
                    }
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>

                {/* Billing Type */}
                <div className="external-form-group">
                  <label>Billing Type</label>
                  <select
                    value={addFormData.billingType}
                    onChange={(e) =>
                      setAddFormData({ ...addFormData, billingType: e.target.value })
                    }
                  >
                    <option value="prepaid">PREPAID</option>
                    <option value="postpaid">POSTPAID</option>
                  </select>
                </div>

                {/* Billing Cycle */}
                <div className="external-form-group">
                  <label>Billing Cycle</label>
                  <select
                    value={addFormData.billingCycle}
                    onChange={(e) =>
                      setAddFormData({ ...addFormData, billingCycle: e.target.value })
                    }
                  >
                    <option value="monthly">Monthly</option>
                    <option value="quarterly">Quarterly</option>
                    <option value="yearly">Yearly</option>
                  </select>
                </div>

                {/* Sender ID Type */}
                <div className="external-form-group">
                  <label>Sender Id Type</label>
                  <select
                    value={addFormData.senderIdType}
                    onChange={(e) =>
                      setAddFormData({ ...addFormData, senderIdType: e.target.value })
                    }
                  >
                    <option value="dynamic">Dynamic</option>
                    <option value="static">Static</option>
                  </select>
                </div>

                {/* Priority */}
                <div className="external-form-group">
                  <label>Priority</label>
                  <select
                    value={addFormData.priority}
                    onChange={(e) =>
                      setAddFormData({ ...addFormData, priority: e.target.value })
                    }
                  >
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                </div>

                {/* Is Visualize Allowed */}
                <div className="external-form-group">
                  <label>Is Visualize Allowed</label>
                  <select
                    value={addFormData.isVisualizeAllowed}
                    onChange={(e) =>
                      setAddFormData({ ...addFormData, isVisualizeAllowed: e.target.value })
                    }
                  >
                    <option value="Yes">Yes</option>
                    <option value="No">No</option>
                  </select>
                </div>

                {/* Service Type */}
                <div className="external-form-group">
                  <label>
                    Service Type <span>*</span>
                  </label>
                  <select
                    value={addFormData.serviceType}
                    onChange={(e) => {
                      setAddFormData({ ...addFormData, serviceType: e.target.value });
                      if (errors.serviceType)
                        setErrors((prev) => ({ ...prev, serviceType: "" }));
                    }}
                    className={errors.serviceType ? "input-error" : ""}
                  >
                    <option value="null">-- Select --</option>
                    <option value="airtel-govt">airtel-govt</option>
                    <option value="premium">premium</option>
                    <option value="airtel">airtel</option>
                    <option value="mix">mix</option>
                    <option value="bsnl">bsnl</option>
                    <option value="sim">sim</option>
                    <option value="airtel-psu">airtel-psu</option>
                    <option value="ildo">ildo</option>
                    <option value="demo">demo</option>
                    <option value="videocon">videocon</option>
                  </select>
                  {errors.serviceType && (
                    <div className="field-error">⚠ {errors.serviceType}</div>
                  )}
                </div>

                {/* User Account Type */}
                <div className="external-form-group">
                  <label>Account Type</label>
                  <select
                    value={addFormData.userAccountType}
                    onChange={(e) =>
                      setAddFormData({ ...addFormData, userAccountType: e.target.value })
                    }
                  >
                    <option value="SMPP">SMPP</option>
                    <option value="WEB">WEB</option>
                    <option value="HTTP">API</option>
                  </select>
                </div>

                {/* SMPP Specific Fields */}
                {addFormData.userAccountType === "SMPP" && (
                  <>
                    <div className="external-form-group">
                      <label>SMPP Charset</label>
                      <select
                        value={addFormData.smppCharset}
                        onChange={(e) =>
                          setAddFormData({ ...addFormData, smppCharset: e.target.value })
                        }
                      >
                        <option value="ASCII">ASCII</option>
                        <option value="GSM">GSM</option>
                      </select>
                    </div>

                    <div className="external-form-group">
                      <label>Tx Session</label>
                      <select
                        value={addFormData.txSession}
                        onChange={(e) =>
                          setAddFormData({ ...addFormData, txSession: e.target.value })
                        }
                      >
                        {Array.from({ length: 21 }, (_, index) => (
                          <option key={index} value={String(index)}>
                            {index}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="external-form-group">
                      <label>Rx Session</label>
                      <select
                        value={addFormData.rxSession}
                        onChange={(e) =>
                          setAddFormData({ ...addFormData, rxSession: e.target.value })
                        }
                      >
                        {Array.from({ length: 21 }, (_, index) => (
                          <option key={index} value={String(index)}>
                            {index}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="external-form-group">
                      <label>TRx Session</label>
                      <select
                        value={addFormData.trxSession}
                        onChange={(e) =>
                          setAddFormData({ ...addFormData, trxSession: e.target.value })
                        }
                      >
                        {Array.from({ length: 21 }, (_, index) => (
                          <option key={index} value={String(index)}>
                            {index}
                          </option>
                        ))}
                      </select>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* User Profile */}
            <div className="external-section">
              <h3 className="external-section-title">USER PROFILE</h3>

              <div className="external-form-grid">
                {/* Organisation */}
               <div className="external-form-group">
                <label>
                  Organisation <span>*</span>
                </label>
                <select
                  value={selectedOrg}
                  onChange={handleOrgChange}
                  className={errors.orgId ? "input-error" : ""}
                >
                  <option value="">-- Select Organisation --</option>
                  {organizations.map((org) => (
                    <option key={org.orgId} value={org.orgId}>
                      {org.orgName}
                    </option>
                  ))}
                </select>
                {errors.orgId && (
                  <div className="field-error">⚠ {errors.orgId}</div>
                )}
              </div>

              {/* Department Dropdown */}
              <div className="external-form-group">
                <label>
                  Department <span>*</span>
                </label>
                <select
                  value={selectedDept}
                  onChange={(e) => {
                    setSelectedDept(e.target.value);
                    if (errors.deptId) setErrors((prev) => ({ ...prev, deptId: "" }));
                  }}
                  disabled={!selectedOrg} // Keep disabled until an organization is chosen
                  className={errors.deptId ? "input-error" : ""}
                >
                  <option value="">
                    {!selectedOrg ? "-- Select Organisation First --" : "-- Select Department --"}
                  </option>
                  {departments.map((dept) => (
                    <option key={dept.deptId} value={dept.deptId}>
                      {dept.deptName}
                    </option>
                  ))}
                </select>
                {errors.deptId && (
                  <div className="field-error">⚠ {errors.deptId}</div>
                )}
              </div>

                {/* Email */}
                <div className="external-form-group">
                  <label>
                    Email ID <span>*</span>
                  </label>
                  <input
                    type="email"
                    placeholder="name@company.com"
                    value={addFormData.email}
                    onChange={(e) => {
                      setAddFormData({ ...addFormData, email: e.target.value });
                      if (errors.email) setErrors((prev) => ({ ...prev, email: "" }));
                    }}
                    className={errors.email ? "input-error" : ""}
                  />
                  {errors.email && (
                    <div className="field-error">⚠ {errors.email}</div>
                  )}
                </div>

                {/* Mobile */}
                <div className="external-form-group">
                  <label>
                    Mobile Number <span>*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="10-digit mobile number"
                    maxLength={10}
                    value={addFormData.mobile}
                    onChange={(e) => {
                      setAddFormData({ ...addFormData, mobile: e.target.value });
                      if (errors.mobile) setErrors((prev) => ({ ...prev, mobile: "" }));
                    }}
                    className={errors.mobile ? "input-error" : ""}
                  />
                  {errors.mobile && (
                    <div className="field-error">⚠ {errors.mobile}</div>
                  )}
                </div>

                {/* Account Manager */}
                <div className="external-form-group full-width">
                  <label>Account Manager</label>
                  <select
                    value={addFormData.accountManagerName}
                    onChange={(e) =>
                      setAddFormData({ ...addFormData, accountManagerName: e.target.value })
                    }
                  >
                    <option value="">-- Select Account Manager --</option>
                    {internalUsers.map((manager) => (
                      <option key={manager.userId} value={manager.userName}>
                        {manager.userName}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Permissions */}
            <div className="external-section">
              <h3 className="external-section-title">USER PERMISSIONS</h3>

              <div className="external-permissions-grid">
                {/* DND Check */}
                <div className="external-permission-group">
                  <label>DND Check</label>
                  <div className="permission-toggle">
                    <div
                      className={`permission-option ${
                        addFormData.isDndCheck === "Yes" ? "selected" : ""
                      }`}
                      onClick={() =>
                        setAddFormData({ ...addFormData, isDndCheck: "Yes" })
                      }
                    >
                      {addFormData.isDndCheck === "Yes" && (
                        <span className="permission-dot"></span>
                      )}
                      Yes
                    </div>
                    <div
                      className={`permission-option ${
                        addFormData.isDndCheck === "No" ? "selected" : ""
                      }`}
                      onClick={() =>
                        setAddFormData({ ...addFormData, isDndCheck: "No" })
                      }
                    >
                      {addFormData.isDndCheck === "No" && (
                        <span className="permission-dot"></span>
                      )}
                      No
                    </div>
                  </div>
                </div>

                {/* Credit History */}
                <div className="external-permission-group">
                  <label>Credit History</label>
                  <div className="permission-toggle">
                    <div
                      className={`permission-option ${
                        addFormData.isCreditHistoryAllowed === "Yes" ? "selected" : ""
                      }`}
                      onClick={() =>
                        setAddFormData({ ...addFormData, isCreditHistoryAllowed: "Yes" })
                      }
                    >
                      {addFormData.isCreditHistoryAllowed === "Yes" && (
                        <span className="permission-dot"></span>
                      )}
                      Yes
                    </div>
                    <div
                      className={`permission-option ${
                        addFormData.isCreditHistoryAllowed === "No" ? "selected" : ""
                      }`}
                      onClick={() =>
                        setAddFormData({ ...addFormData, isCreditHistoryAllowed: "No" })
                      }
                    >
                      {addFormData.isCreditHistoryAllowed === "No" && (
                        <span className="permission-dot"></span>
                      )}
                      No
                    </div>
                  </div>
                </div>

                {/* Mobile Masking */}
                <div className="external-permission-group">
                  <label>Mobile Number Masking</label>
                  <div className="permission-toggle">
                    <div
                      className={`permission-option ${
                        addFormData.isNumberMasking === "Yes" ? "selected" : ""
                      }`}
                      onClick={() =>
                        setAddFormData({ ...addFormData, isNumberMasking: "Yes" })
                      }
                    >
                      {addFormData.isNumberMasking === "Yes" && (
                        <span className="permission-dot"></span>
                      )}
                      Yes
                    </div>
                    <div
                      className={`permission-option ${
                        addFormData.isNumberMasking === "No" ? "selected" : ""
                      }`}
                      onClick={() =>
                        setAddFormData({ ...addFormData, isNumberMasking: "No" })
                      }
                    >
                      {addFormData.isNumberMasking === "No" && (
                        <span className="permission-dot"></span>
                      )}
                      No
                    </div>
                  </div>
                </div>

                {/* Masking Count */}
                {addFormData.isNumberMasking === "Yes" && (
                  <div className="external-form-group">
                    <label>
                      Masking Count <span>*</span>
                    </label>
                    <select
                      value={addFormData.numberMaskingCount}
                      onChange={(e) =>
                        setAddFormData({ ...addFormData, numberMaskingCount: e.target.value })
                      }
                    >
                      {Array.from({ length: 6 }, (_, index) => (
                        <option key={index} value={String(index)}>
                          {index}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Low Credit Notification */}
                <div className="external-permission-group">
                  <label>Low Credit Notification</label>
                  <div className="permission-toggle">
                    <div
                      className={`permission-option ${
                        addFormData.isLowCreditAlert === "Yes" ? "selected" : ""
                      }`}
                      onClick={() =>
                        setAddFormData({ ...addFormData, isLowCreditAlert: "Yes" })
                      }
                    >
                      {addFormData.isLowCreditAlert === "Yes" && (
                        <span className="permission-dot"></span>
                      )}
                      Yes
                    </div>
                    <div
                      className={`permission-option ${
                        addFormData.isLowCreditAlert === "No" ? "selected" : ""
                      }`}
                      onClick={() =>
                        setAddFormData({
                          ...addFormData,
                          isLowCreditAlert: "No",
                        })
                      }
                    >
                      {addFormData.isLowCreditAlert === "No" && (
                        <span className="permission-dot"></span>
                      )}
                      No
                    </div>
                  </div>
                </div>

                {/* Credit Limit */}
                {addFormData.isLowCreditAlert === "Yes" && (
                  <div className="external-form-group">
                    <label>
                      Credit Limit <span>*</span>
                    </label>
                    <input
                      type="number"
                      placeholder="Enter credit limit"
                      value={addFormData.lowCreditAlertLimit}
                      onChange={(e) =>
                        setAddFormData({
                          ...addFormData,
                          lowCreditAlertLimit: e.target.value,
                        })
                      }
                    />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="external-drawer-footer">
            <button
              className="cancel-btn"
              onClick={() => setShowAddExternalUser(false)}
            >
              Cancel
            </button>

            <button className="create-btn" onClick={handleCreateUser}>
              Create User
            </button>
          </div>
        </div>
      </div>
    )}

      <div className="external-card">
        <div className="external-toolbar">
          <div className="external-toolbar-left">
            <div className="search-box">
              <i className="fa-solid fa-magnifying-glass"></i>
              <input
                type="text"
                placeholder="Search username, email or mobile..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <select
              value={selectedUserType}
              onChange={(e) => setSelectedUserType(e.target.value)}
            >
              <option value="">All user types</option>
              {userTypeOptions.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>

            <select
              value={selectedAccountType}
              onChange={(e) => setSelectedAccountType(e.target.value)}
            >
              <option value="">All account types</option>
              {accountTypeOptions.map((type) => (
                <option key={type} value={type}>
                  {type.toUpperCase()}
                </option>
              ))}
            </select>

            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
            >
              <option value="">All statuses</option>
              {statusOptions.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </div>

          <div className="external-toolbar-right">
            <span>
              {filteredExternalUsers.length} of {filteredExternalUsers.length}{" "}
              users
            </span>
          </div>
        </div>

        <div>
          <table className="external-table">
            <thead>
              <tr>
                <th>USER</th>
                <th>CONTACT</th>
                <th>USER TYPE</th>
                <th>ACCOUNT TYPE</th>
                <th>ORGANISATION</th>
                <th>CREATED</th>
                <th>STATUS</th>
                <th>ACTIONS</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="8">
                    <div className="table-loader">
                      <div className="spinner"></div>
                      <p>Loading External Users...</p>
                    </div>
                  </td>
                </tr>
              ) : currentTableData.length > 0 ? (
                currentTableData.map((user, index) => {
                  const avatarLetter = user.userName
                    ? user.userName.charAt(0).toUpperCase()
                    : "-";

                  const formattedDate = user.creationDate
                    ? user.creationDate
                        .split(" ")[0]
                        .split("-")
                        .reverse()
                        .join("-")
                    : "-";

                  const accountType = user.userAccountType
                    ? user.userAccountType.toUpperCase()
                    : "-";

                  return (
                    <tr key={user.userId || index}>
                      <td>
                        <div className="user-info">
                          <div className="user-avatar">{avatarLetter}</div>
                          <div className="user-name">{user.userName || "-"}</div>
                        </div>
                      </td>

                      <td>
                        <div className="contact-info">
                          <div className="mobile">
                            {user.contactNumber || "-"}
                          </div>
                          <div className="email">{user.emailId || "-"}</div>
                        </div>
                      </td>

                      <td>
                        <span
                          className={`external-badge ${
                            user.customerType
                              ? `external-badge-${user.customerType.toLowerCase()}`
                              : "external-badge-empty"
                          }`}
                        >
                          {user.customerType || "-"}
                        </span>
                      </td>

                      <td>
                        <span
                          className={`external-badge ${
                            accountType !== "-"
                              ? `external-badge-${accountType.toLowerCase()}`
                              : "badge-empty"
                          }`}
                        >
                          {accountType}
                        </span>
                      </td>

                      <td>
                        <span className="organisation">
                          {user.provider || "-"}
                        </span>
                      </td>

                      <td>
                        <span className="created-date">{formattedDate}</span>
                      </td>

                      <td>
                        <span
                          className={`status ${
                            user.status?.toLowerCase() === "active"
                              ? "active"
                              : "inactive"
                          }`}
                        >
                          {user.status || "-"}
                        </span>
                      </td>

                      <td>
                      <button
                        className="action-btn"
                        title="Edit User"
                        onClick={() => handleEditClick(user)}
                      >
                        <i className="fa-regular fa-pen-to-square"></i>
                      </button>
                    </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="8" className="no-users">
                    No External Users Found
                  </td>
                </tr>
              )}
            </tbody>
          </table>

       {showEditExternalUser && (
          <div
            className="external-drawer-overlay"
            onClick={handleAttemptClose}
          >
            <div
              className="external-user-drawer"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="external-drawer-header">
                <div>
                  <h2>Edit External User</h2>
                  <p>Update existing external user details</p>
                </div>

                <button
                  className="close-btn"
                  onClick={handleAttemptClose}
                >
                  <i className="fa-solid fa-xmark"></i>
                </button>
              </div>

              {/* Body */}
              <div className="external-drawer-body">
                <div className="external-section">
                  <h3 className="external-section-title">USER ACCOUNT</h3>

                  <div className="external-form-grid">
                    {/* Customer Type (Frozen/Disabled - Skipped Validation) */}
                    <div className="external-form-group">
                      <label>
                        User Type <span>*</span>
                      </label>
                      <select
                        value={editFormData.userType?.toLowerCase() || "client"}
                        disabled
                      >
                        <option value="client">Client</option>
                        <option value="admin">Admin</option>
                        <option value="reseller">Reseller</option>
                        <option value="seller">Seller</option>
                      </select>
                      <Lock size={18} className="dept-lock-icon" />
                    </div>

                    {/* Username (Frozen/Disabled - Skipped Validation) */}
                    <div className="external-form-group">
                      <label>
                        Username <span>*</span>
                      </label>
                      <input
                        type="text"
                        value={editFormData.username || ""}
                        disabled
                      />
                      <Lock size={18} className="dept-lock-icon" />
                    </div>

                    {/* Password */}
                    <div className="external-form-group">
                      <label>
                        Password <span>*</span>
                      </label>
                      <input
                        type="password"
                        className={errors.password ? "input-error" : ""}
                        placeholder="Enter password"
                        value={editFormData.password || ""}
                        onChange={(e) => {
                          setEditFormData({ ...editFormData, password: e.target.value });
                          if (errors.password) setErrors({ ...errors, password: "" });
                        }}
                      />
                      {errors.password && (
                        <span className="error-message">
                          <i className="fa-solid fa-triangle-exclamation"></i> {errors.password}
                        </span>
                      )}
                    </div>

                    {/* Status */}
                    <div className="external-form-group">
                      <label>Status</label>
                      <select
                        value={editFormData.status || "Active"}
                        onChange={(e) =>
                          setEditFormData({ ...editFormData, status: e.target.value })
                        }
                      >
                        <option value="Active">Active</option>
                        <option value="Inactive">Inactive</option>
                      </select>
                    </div>

                    {/* Billing Type */}
                    <div className="external-form-group">
                      <label>Billing Type</label>
                      <select
                        value={editFormData.billingType || "PREPAID"}
                        onChange={(e) =>
                          setEditFormData({ ...editFormData, billingType: e.target.value })
                        }
                        disabled
                      >
                        <option value="PREPAID">PREPAID</option>
                        <option value="POSTPAID">POSTPAID</option>
                      </select>
                      <Lock size={18} className="dept-lock-icon" />
                    </div>

                    {/* Billing Cycle */}
                    <div className="external-form-group">
                      <label>Billing Cycle</label>
                      <select
                        value={editFormData.billingCycle || "Monthly"}
                        onChange={(e) =>
                          setEditFormData({ ...editFormData, billingCycle: e.target.value })
                        }
                      >
                        <option value="Monthly">Monthly</option>
                        <option value="Quarterly">Quarterly</option>
                        <option value="Yearly">Yearly</option>
                      </select>
                    </div>

                    {/* Sender ID Type */}
                    <div className="external-form-group">
                      <label>Sender Id Type</label>
                      <select
                        value={editFormData.senderIdType || "Dynamic"}
                        onChange={(e) =>
                          setEditFormData({ ...editFormData, senderIdType: e.target.value })
                        }
                      >
                        <option value="Dynamic">Dynamic</option>
                        <option value="Static">Static</option>
                      </select>
                    </div>

                    {/* Priority */}
                    <div className="external-form-group">
                      <label>Priority</label>
                      <select
                        value={editFormData.priority || "High"}
                        onChange={(e) =>
                          setEditFormData({ ...editFormData, priority: e.target.value })
                        }
                      >
                        <option value="High">High</option>
                        <option value="Medium">Medium</option>
                        <option value="Low">Low</option>
                      </select>
                    </div>

                    {/* Is Visualize Allowed */}
                    <div className="external-form-group">
                      <label>Is Visualize Allowed</label>
                      <select
                        value={editFormData.isVisualizeAllowed || "No"}
                        onChange={(e) =>
                          setEditFormData({ ...editFormData, isVisualizeAllowed: e.target.value })
                        }
                      >
                        <option value="Yes">Yes</option>
                        <option value="No">No</option>
                      </select>
                    </div>

                    {/* Service Type (Disabled - Skipped Validation) */}
                    <div className="external-form-group">
                      <label>
                        Service Type <span>*</span>
                      </label>
                      <select
                        value={editFormData.serviceType || "demo"}
                        onChange={(e) =>
                          setEditFormData({ ...editFormData, serviceType: e.target.value })
                        }
                        disabled
                      >
                        <option value="null">-- Select --</option>
                        <option value="airtel-govt">airtel-govt</option>
                        <option value="premium">premium</option>
                        <option value="airtel">airtel</option>
                        <option value="mix">mix</option>
                        <option value="bsnl">bsnl</option>
                        <option value="sim">sim</option>
                        <option value="airtel-psu">airtel-psu</option>
                        <option value="ildo">ildo</option>
                        <option value="demo">demo</option>
                        <option value="videocon">videocon</option>
                      </select>
                      <Lock size={18} className="dept-lock-icon" />
                    </div>

                    {/* User Account Type */}
                    <div className="external-form-group">
                      <label>Account Type</label>
                      <select
                        value={editFormData.accountType || editFormData.userAccountType || "API"}
                        onChange={(e) =>
                          setEditFormData({ ...editFormData, accountType: e.target.value, userAccountType: e.target.value })
                        }
                        disabled
                      >
                        <option value="SMPP">SMPP</option>
                        <option value="WEB">WEB</option>
                        <option value="API">API</option>
                      </select>
                      <Lock size={18} className="dept-lock-icon" />
                    </div>

                    {/* SMPP Specific Fields */}
                    {(editFormData.accountType === "SMPP" || editFormData.userAccountType === "SMPP") && (
                      <>
                        <div className="external-form-group">
                          <label>SMPP Charset</label>
                          <select
                            value={editFormData.smppCharset || "ASCII"}
                            onChange={(e) =>
                              setEditFormData({ ...editFormData, smppCharset: e.target.value })
                            }
                          >
                            <option value="ASCII">ASCII</option>
                            <option value="GSM">GSM</option>
                          </select>
                        </div>

                        <div className="external-form-group">
                          <label>Tx Session</label>
                          <select
                            value={editFormData.txSession || "0"}
                            onChange={(e) =>
                              setEditFormData({ ...editFormData, txSession: e.target.value })
                            }
                          >
                            {Array.from({ length: 21 }, (_, index) => (
                              <option key={index} value={String(index)}>
                                {index}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className="external-form-group">
                          <label>Rx Session</label>
                          <select
                            value={editFormData.rxSession || "0"}
                            onChange={(e) =>
                              setEditFormData({ ...editFormData, rxSession: e.target.value })
                            }
                          >
                            {Array.from({ length: 21 }, (_, index) => (
                              <option key={index} value={String(index)}>
                                {index}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className="external-form-group">
                          <label>TRx Session</label>
                          <select
                            value={editFormData.trxSession || "0"}
                            onChange={(e) =>
                              setEditFormData({ ...editFormData, trxSession: e.target.value })
                            }
                          >
                            {Array.from({ length: 21 }, (_, index) => (
                              <option key={index} value={String(index)}>
                                {index}
                              </option>
                            ))}
                          </select>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* User Profile */}
                <div className="external-section">
                  <h3 className="external-section-title">USER PROFILE</h3>

                  <div className="external-form-grid">
                    {/* Organisation (Disabled) */}
                    <div className="external-form-group">
                      <label>
                        Organisation <span>*</span>
                      </label>
                      <input
                        type="text"
                        value={editFormData.organisation || ""}
                        disabled
                      />
                      <Lock size={18} className="dept-lock-icon" />
                    </div>

                    {/* Department (Disabled) */}
                    <div className="external-form-group">
                      <label>
                        Department <span>*</span>
                      </label>
                      <input
                        type="text"
                        value={editFormData.department || ""}
                        disabled
                      />
                      <Lock size={18} className="dept-lock-icon" />
                    </div>

                    {/* Email */}
                    <div className="external-form-group">
                      <label>
                        Email ID <span>*</span>
                      </label>
                      <input
                        type="email"
                        placeholder="name@company.com"
                        className={errors.email ? "input-error" : ""}
                        value={editFormData.emailId || editFormData.email || ""}
                        onChange={(e) => {
                          setEditFormData({ ...editFormData, emailId: e.target.value, email: e.target.value });
                          if (errors.email) setErrors({ ...errors, email: "" });
                        }}
                      />
                      {errors.email && (
                        <span className="error-message">
                          <i className="fa-solid fa-triangle-exclamation"></i> {errors.email}
                        </span>
                      )}
                    </div>

                    {/* Mobile */}
                    <div className="external-form-group">
                      <label>
                        Mobile Number <span>*</span>
                      </label>
                      <input
                        type="text"
                        maxLength={10}
                        placeholder="10-digit mobile number"
                        className={errors.mobile ? "input-error" : ""}
                        value={editFormData.mobileNumber || editFormData.mobile || ""}
                        onChange={(e) => {
                          setEditFormData({ ...editFormData, mobileNumber: e.target.value, mobile: e.target.value });
                          if (errors.mobile) setErrors({ ...errors, mobile: "" });
                        }}
                      />
                      {errors.mobile && (
                        <span className="error-message">
                          <i className="fa-solid fa-triangle-exclamation"></i> {errors.mobile}
                        </span>
                      )}
                    </div>

                    {/* Account Manager */}
                    <div className="external-form-group full-width">
                      <label>Account Manager</label>
                      <select
                        value={editFormData.accountManagerName || editFormData.accountManager || ""}
                        onChange={(e) =>
                          setEditFormData({
                            ...editFormData,
                            accountManagerName: e.target.value,
                            accountManager: e.target.value
                          })
                        }
                      >
                        <option value="">-- Select Account Manager --</option>
                        {internalUsers.map((manager) => (
                          <option key={manager.userId} value={manager.userName}>
                            {manager.userName}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Permissions */}
                <div className="external-section">
                  <h3 className="external-section-title">USER PERMISSIONS</h3>

                  <div className="external-permissions-grid">
                    {/* DND Check */}
                    <div className="external-permission-group">
                      <label>DND Check</label>
                      <div className="permission-toggle">
                        <div
                          className={`permission-option ${
                            (editFormData.isDndCheck || editFormData.dndCheck) === "Yes" ? "selected" : ""
                          }`}
                          onClick={() =>
                            setEditFormData({ ...editFormData, dndCheck: "Yes", isDndCheck: "Yes" })
                          }
                        >
                          {(editFormData.isDndCheck || editFormData.dndCheck) === "Yes" && (
                            <span className="permission-dot"></span>
                          )}
                          Yes
                        </div>
                        <div
                          className={`permission-option ${
                            (editFormData.isDndCheck || editFormData.dndCheck) === "No" ? "selected" : ""
                          }`}
                          onClick={() =>
                            setEditFormData({ ...editFormData, dndCheck: "No", isDndCheck: "No" })
                          }
                        >
                          {(editFormData.isDndCheck || editFormData.dndCheck) === "No" && (
                            <span className="permission-dot"></span>
                          )}
                          No
                        </div>
                      </div>
                    </div>

                    {/* Credit History */}
                    <div className="external-permission-group">
                      <label>Credit History</label>
                      <div className="permission-toggle">
                        <div
                          className={`permission-option ${
                            (editFormData.isCreditHistoryAllowed || editFormData.creditHistory) === "Yes" ? "selected" : ""
                          }`}
                          onClick={() =>
                            setEditFormData({ ...editFormData, creditHistory: "Yes", isCreditHistoryAllowed: "Yes" })
                          }
                        >
                          {(editFormData.isCreditHistoryAllowed || editFormData.creditHistory) === "Yes" && (
                            <span className="permission-dot"></span>
                          )}
                          Yes
                        </div>
                        <div
                          className={`permission-option ${
                            (editFormData.isCreditHistoryAllowed || editFormData.creditHistory) === "No" ? "selected" : ""
                          }`}
                          onClick={() =>
                            setEditFormData({ ...editFormData, creditHistory: "No", isCreditHistoryAllowed: "No" })
                          }
                        >
                          {(editFormData.isCreditHistoryAllowed || editFormData.creditHistory) === "No" && (
                            <span className="permission-dot"></span>
                          )}
                          No
                        </div>
                      </div>
                    </div>

                    {/* Mobile Masking */}
                    <div className="external-permission-group">
                      <label>Mobile Number Masking</label>
                      <div className="permission-toggle">
                        <div
                          className={`permission-option ${
                            (editFormData.isNumberMasking || editFormData.mobileMasking) === "Yes" ? "selected" : ""
                          }`}
                          onClick={() =>
                            setEditFormData({ ...editFormData, mobileMasking: "Yes", isNumberMasking: "Yes" })
                          }
                        >
                          {(editFormData.isNumberMasking || editFormData.mobileMasking) === "Yes" && (
                            <span className="permission-dot"></span>
                          )}
                          Yes
                        </div>
                        <div
                          className={`permission-option ${
                            (editFormData.isNumberMasking || editFormData.mobileMasking) === "No" ? "selected" : ""
                          }`}
                          onClick={() =>
                            setEditFormData({ ...editFormData, mobileMasking: "No", isNumberMasking: "No" })
                          }
                        >
                          {(editFormData.isNumberMasking || editFormData.mobileMasking) === "No" && (
                            <span className="permission-dot"></span>
                          )}
                          No
                        </div>
                      </div>
                    </div>

                    {/* Low Credit Notification */}
                    <div className="external-permission-group">
                      <label>Low Credit Notification</label>
                      <div className="permission-toggle">
                        <div
                          className={`permission-option ${
                            (editFormData.isLowCreditAlert || editFormData.lowCreditNotif) === "Yes" ? "selected" : ""
                          }`}
                          onClick={() =>
                            setEditFormData({ ...editFormData, lowCreditNotif: "Yes", isLowCreditAlert: "Yes" })
                          }
                        >
                          {(editFormData.isLowCreditAlert || editFormData.lowCreditNotif) === "Yes" && (
                            <span className="permission-dot"></span>
                          )}
                          Yes
                        </div>
                        <div
                          className={`permission-option ${
                            (editFormData.isLowCreditAlert || editFormData.lowCreditNotif) === "No" ? "selected" : ""
                          }`}
                          onClick={() =>
                            setEditFormData({ ...editFormData, lowCreditNotif: "No", isLowCreditAlert: "No" })
                          }
                        >
                          {(editFormData.isLowCreditAlert || editFormData.lowCreditNotif) === "No" && (
                            <span className="permission-dot"></span>
                          )}
                          No
                        </div>
                      </div>
                    </div>

                    {/* Credit Threshold / Limit */}
                    {(editFormData.isLowCreditAlert === "Yes" || editFormData.lowCreditNotif === "Yes") && (
                      <div className="external-form-group">
                        <label>
                          Credit Limit <span>*</span>
                        </label>
                        <input
                          type="text"
                          className={errors.lowCreditAlertLimit ? "input-error" : ""}
                          value={editFormData.lowCreditAlertLimit || editFormData.creditThreshold || ""}
                          onChange={(e) => {
                            setEditFormData({
                              ...editFormData,
                              lowCreditAlertLimit: e.target.value,
                              creditThreshold: e.target.value
                            });
                            if (errors.lowCreditAlertLimit) setErrors({ ...errors, lowCreditAlertLimit: "" });
                          }}
                        />
                        {errors.lowCreditAlertLimit && (
                          <span className="error-message">
                            <i className="fa-solid fa-triangle-exclamation"></i> {errors.lowCreditAlertLimit}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="external-drawer-footer">
                <button
                  className="cancel-btn"
                  onClick={handleAttemptClose}
                >
                  Cancel
                </button>

                <button className="create-btn" onClick={handleUpdateUser}>
                  Update User
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

          <div className="table-footer">
            <span>
              Showing {filteredExternalUsers.length === 0 ? 0 : 1}–
              {filteredExternalUsers.length} of {filteredExternalUsers.length}
            </span>

            {filteredExternalUsers.length > 0 && (
              <div className="pagination">
                <button
                  className="page-btn"
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(prev - 1, 1))
                  }
                  disabled={currentPage === 1}
                >
                  <i className="fa-solid fa-chevron-left"></i>
                </button>

                {getPageNumbers().map((page, idx) =>
                  page === "..." ? (
                    <span
                      key={`ellipsis-${idx}`}
                      className="pagination-ellipsis"
                    >
                      ...
                    </span>
                  ) : (
                    <button
                      key={page}
                      className={`page-btn ${
                        currentPage === page ? "active" : ""
                      }`}
                      onClick={() => setCurrentPage(page)}
                    >
                      {page}
                    </button>
                  )
                )}

                <button
                  className="page-btn"
                  onClick={() =>
                    setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                  }
                  disabled={currentPage === totalPages}
                >
                  <i className="fa-solid fa-chevron-right"></i>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExternalUsers;