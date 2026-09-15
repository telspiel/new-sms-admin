import React, { useEffect, useState, useContext } from "react";
import "./ExternalUsers.css";
import Endpoints from "../../api/endpoint";
import { AuthContext } from "../../context/AuthContext";
import { Lock } from "lucide-react";

const ExternalUsers = () => {
  const { userData } = useContext(AuthContext);

  const [loading, setLoading] = useState(false);
  const [externalUsers, setExternalUsers] = useState([]);
  const [internalUsers, setInternalUsers] = useState([]); // State for Account Managers
  const [toastMessage, setToastMessage] = useState("");

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUserType, setSelectedUserType] = useState("");
  const [selectedAccountType, setSelectedAccountType] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");

  const [showAddExternalUser, setShowAddExternalUser] = useState(false);
  const [addFormData, setAddFormData] = useState({
    dndCheck: "No",
    creditHistory: "No",
    mobileMasking: "No",
    lowCreditNotif: "No"
  });

  const [showEditExternalUser, setShowEditExternalUser] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [editFormData, setEditFormData] = useState({});

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

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
        setExternalUsers(response.data.listUserFormDataGrid || []);
      } else {
        setToastMessage(response.message);
      }
    } catch (error) {
      console.error("Error fetching external users:", error);
    } finally {
      setLoading(false);
    }
  };

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
    getExternalUsers();
    getInternalUsers();
  }, []);

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
const handleEditClick = (user) => {
  setSelectedUser(user);
  setEditFormData({
    userType: user.customerType || "Client",
    username: user.userName || "",
    password: user.password || "",
    status: user.status || "Active",
    billingType: user.billingType || "PREPAID",
    billingCycle: user.billingCycle || "Monthly",
    senderIdType: user.senderIdType || "Dynamic",
    priority: user.priority || "High",
    isVisualizeAllowed: user.isVisualizeAllowed || "No",
    serviceType: user.serviceType || "demo",
    accountType: user.userAccountType || "API",
    organisation: user.provider || "",
    department: user.department || "IT",
    emailId: user.emailId || "",
    mobileNumber: user.contactNumber || "",
    accountManager: user.accountManager || "",
    dndCheck: user.dndCheck || "Yes",
    creditHistory: user.creditHistory || "No",
    mobileMasking: user.mobileMasking || "No",
    lowCreditNotif: user.lowCreditNotif || "No",
    creditThreshold: user.creditThreshold || "-",
    creditAlertMode: user.creditAlertMode || "-"
  });
  setShowEditExternalUser(true);
};

  return (
    <div className="external-user">
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
                  {/* User Type */}
                  <div className="external-form-group">
                    <label>
                      User Type <span>*</span>
                    </label>

                    <select defaultValue="Client">
                      <option value="">-- Select --</option>
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

                    <input type="text" placeholder="Enter username" />

                    <small>
                      4-20 characters · letters, numbers, "." and "_" only · must
                      start with a letter
                    </small>
                  </div>

                  {/* Password */}
                  <div className="external-form-group">
                    <label>
                      Password <span>*</span>
                    </label>

                    <input type="password" placeholder="Enter password" />

                    <small>6-20 characters · no spaces</small>
                  </div>

                  {/* Status */}
                  <div className="external-form-group">
                    <label>Status</label>

                    <select defaultValue="Active">
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                    </select>
                  </div>

                  {/* Billing Type */}
                  <div className="external-form-group">
                    <label>Billing Type</label>

                    <select defaultValue="PREPAID">
                      <option value="PREPAID">PREPAID</option>
                      <option value="POSTPAID">POSTPAID</option>
                    </select>
                  </div>

                  {/* Billing Cycle */}
                  <div className="external-form-group">
                    <label>Billing Cycle</label>

                    <select defaultValue="Monthly">
                      <option value="Monthly">Monthly</option>
                      <option value="Quarterly">Quarterly</option>
                      <option value="Yearly">Yearly</option>
                    </select>
                  </div>

                  {/* Sender ID Type */}
                  <div className="external-form-group">
                    <label>Sender Id Type</label>

                    <select defaultValue="Dynamic">
                      <option value="Dynamic">Dynamic</option>
                      <option value="Static">Static</option>
                    </select>
                  </div>

                  {/* Priority */}
                  <div className="external-form-group">
                    <label>Priority</label>

                    <select defaultValue="High">
                      <option value="High">High</option>
                      <option value="Medium">Medium</option>
                      <option value="Low">Low</option>
                    </select>
                  </div>

                  {/* Is Visualize Allowed */}
                  <div className="external-form-group">
                    <label>Is Visualize Allowed</label>

                    <select defaultValue="Yes">
                      <option value="Yes">Yes</option>
                      <option value="No">No</option>
                    </select>
                  </div>

                  {/* Service Type */}
                  <div className="external-form-group">
                    <label>
                      Service Type <span>*</span>
                    </label>

                    <select defaultValue="">
                      <option value="">-- Select --</option>
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
                  </div>

                  {/* Account Type */}
                  <div className="external-form-group">
                    <label>Account Type</label>

                    <select defaultValue="SMPP">
                      <option value="SMPP">SMPP</option>
                      <option value="HTTP">HTTP</option>
                    </select>
                  </div>

                  {/* SMPP Charset */}
                  <div className="external-form-group">
                    <label>SMPP Charset</label>

                    <select defaultValue="ASCII">
                      <option value="ASCII">ASCII</option>
                      <option value="UTF-8">UTF-8</option>
                      <option value="UCS2">UCS2</option>
                    </select>
                  </div>

                  {/* Tx Session */}
                  <div className="external-form-group">
                    <label>Tx Session</label>

                    <select defaultValue="0">
                      <option value="0">0</option>
                      <option value="1">1</option>
                      <option value="2">2</option>
                      <option value="5">5</option>
                      <option value="10">10</option>
                    </select>
                  </div>

                  {/* Rx Session */}
                  <div className="external-form-group">
                    <label>Rx Session</label>

                    <select defaultValue="0">
                      <option value="0">0</option>
                      <option value="1">1</option>
                      <option value="2">2</option>
                      <option value="5">5</option>
                      <option value="10">10</option>
                    </select>
                  </div>

                  {/* TRx Session */}
                  <div className="external-form-group">
                    <label>TRx Session</label>

                    <select defaultValue="0">
                      <option value="0">0</option>
                      <option value="1">1</option>
                      <option value="2">2</option>
                      <option value="5">5</option>
                      <option value="10">10</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="external-section">
                <h3 className="external-section-title">USER PROFILE</h3>

                <div className="external-form-grid">
                  {/* Organisation */}
                  <div className="external-form-group">
                    <label>
                      Organisation <span>*</span>
                    </label>

                    <select defaultValue="">
                      <option value="">-- Select --</option>
                      <option value="Organization 1">Organization 1</option>
                      <option value="Organization 2">Organization 2</option>
                    </select>
                  </div>

                  {/* Department */}
                  <div className="external-form-group">
                    <label>
                      Department <span>*</span>
                    </label>

                    <select defaultValue="">
                      <option value="">-- Select --</option>
                      <option value="IT">IT</option>
                      <option value="Finance">Finance</option>
                      <option value="Operations">Operations</option>
                    </select>
                  </div>

                  {/* Email */}
                  <div className="external-form-group">
                    <label>
                      Email ID <span>*</span>
                    </label>

                    <input type="email" placeholder="name@company.com" />
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
                    />
                  </div>

                  {/* Account Manager - Dynamically Populated */}
                  <div className="external-form-group full-width">
                    <label>Account Manager</label>

                    <select defaultValue="">
                      <option value="">-- Select Account Manager --</option>
                      {internalUsers.map((manager) => (
                        <option key={manager.userId} value={manager.userId}>
                          {manager.userName}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <div className="external-section">
                <h3 className="external-section-title">USER PERMISSIONS</h3>

                <div className="external-permissions-grid">
                  {/* DND Check */}
                <div className="external-permission-group">
                  <label>DND Check</label>
                  <div className="permission-toggle">
                    <div
                      className={`permission-option ${
                        addFormData.dndCheck === "Yes" ? "selected" : ""
                      }`}
                      onClick={() =>
                        setAddFormData({ ...addFormData, dndCheck: "Yes" })
                      }
                    >
                      {addFormData.dndCheck === "Yes" && (
                        <span className="permission-dot"></span>
                      )}
                      Yes
                    </div>
                    <div
                      className={`permission-option ${
                        addFormData.dndCheck === "No" ? "selected" : ""
                      }`}
                      onClick={() =>
                        setAddFormData({ ...addFormData, dndCheck: "No" })
                      }
                    >
                      {addFormData.dndCheck === "No" && (
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
                        addFormData.creditHistory === "Yes" ? "selected" : ""
                      }`}
                      onClick={() =>
                        setAddFormData({ ...addFormData, creditHistory: "Yes" })
                      }
                    >
                      {addFormData.creditHistory === "Yes" && (
                        <span className="permission-dot"></span>
                      )}
                      Yes
                    </div>
                    <div
                      className={`permission-option ${
                        addFormData.creditHistory === "No" ? "selected" : ""
                      }`}
                      onClick={() =>
                        setAddFormData({ ...addFormData, creditHistory: "No" })
                      }
                    >
                      {addFormData.creditHistory === "No" && (
                        <span className="permission-dot"></span>
                      )}
                      No
                    </div>
                  </div>
                </div>

                {/* Mobile Number Masking */}
                <div className="external-permission-group">
                  <label>Mobile Number Masking</label>
                  <div className="permission-toggle">
                    <div
                      className={`permission-option ${
                        addFormData.mobileMasking === "Yes" ? "selected" : ""
                      }`}
                      onClick={() =>
                        setAddFormData({ ...addFormData, mobileMasking: "Yes" })
                      }
                    >
                      {addFormData.mobileMasking === "Yes" && (
                        <span className="permission-dot"></span>
                      )}
                      Yes
                    </div>
                    <div
                      className={`permission-option ${
                        addFormData.mobileMasking === "No" ? "selected" : ""
                      }`}
                      onClick={() =>
                        setAddFormData({ ...addFormData, mobileMasking: "No" })
                      }
                    >
                      {addFormData.mobileMasking === "No" && (
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
                        addFormData.lowCreditNotif === "Yes" ? "selected" : ""
                      }`}
                      onClick={() =>
                        setAddFormData({ ...addFormData, lowCreditNotif: "Yes" })
                      }
                    >
                      {addFormData.lowCreditNotif === "Yes" && (
                        <span className="permission-dot"></span>
                      )}
                      Yes
                    </div>
                    <div
                      className={`permission-option ${
                        addFormData.lowCreditNotif === "No" ? "selected" : ""
                      }`}
                      onClick={() =>
                        setAddFormData({ ...addFormData, lowCreditNotif: "No" })
                      }
                    >
                      {addFormData.lowCreditNotif === "No" && (
                        <span className="permission-dot"></span>
                      )}
                      No
                    </div>
                  </div>
                </div>

                  {/* Credit Alert Mode */}
                  <div className="external-permission-group">
                    <label>Credit Alert Mode</label>

                    <select defaultValue="Not Applicable">
                      <option value="Not Applicable">Not Applicable</option>
                      <option value="Email">Email</option>
                      <option value="SMS">SMS</option>
                      <option value="Both">Both</option>
                    </select>
                  </div>
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

              <button className="create-btn">Create User</button>
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
            onClick={() => setShowEditExternalUser(false)}
          >
            <div
              className="external-user-drawer"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="external-drawer-header">
                <div>
                  <h2>Edit External User</h2>
                  <p className="subtitle-username">{selectedUser?.userName}</p>
                </div>

                <button
                  className="close-btn"
                  onClick={() => setShowEditExternalUser(false)}
                >
                  <i className="fa-solid fa-xmark"></i>
                </button>
              </div>

              {/* Body */}
              <div className="external-drawer-body">
                {/* SECTION 1: USER ACCOUNT */}
                <div className="external-section">
                  <h3 className="external-section-title">USER ACCOUNT</h3>

                  <div className="external-form-grid">
                    {/* User Type (Locked) */}
                    <div className="external-form-group">
                      <label>
                        User Type <span>*</span>
                      </label>
                      <div className="locked-input-wrapper">
                        <input
                          type="text"
                          value={editFormData.userType}
                          disabled
                          className="disabled-input"
                        />
                        <Lock size={18} className="input-lock-icon"/>
                      </div>
                    </div>

                    {/* Username (Locked) */}
                    <div className="external-form-group">
                      <label>
                        Username <span>*</span>
                      </label>
                      <div className="locked-input-wrapper">
                        <input
                          type="text"
                          value={editFormData.username}
                          disabled
                          className="disabled-input"
                        />
                        <Lock size={18} className="input-lock-icon"/>
                      </div>
                      <small>
                        4-20 characters · letters, numbers, "." and "_" only · must start with a letter
                      </small>
                    </div>

                    {/* Password */}
                    <div className="external-form-group">
                      <label>
                        Password <span>*</span>
                      </label>
                      <input
                        type="text"
                        value={editFormData.password}
                        onChange={(e) =>
                          setEditFormData({ ...editFormData, password: e.target.value })
                        }
                      />
                      <small>6-20 characters · no spaces</small>
                    </div>

                    {/* Status */}
                    <div className="external-form-group">
                      <label>Status</label>
                      <select
                        value={editFormData.status}
                        onChange={(e) =>
                          setEditFormData({ ...editFormData, status: e.target.value })
                        }
                      >
                        <option value="Active">Active</option>
                        <option value="Inactive">Inactive</option>
                      </select>
                    </div>

                    {/* Billing Type (Locked) */}
                    <div className="external-form-group">
                      <label>Billing Type</label>
                      <div className="locked-input-wrapper">
                        <input
                          type="text"
                          value={editFormData.billingType}
                          disabled
                          className="disabled-input"
                        />
                        <Lock size={18} className="input-lock-icon"/>
                      </div>
                    </div>

                    {/* Billing Cycle */}
                    <div className="external-form-group">
                      <label>Billing Cycle</label>
                      <select
                        value={editFormData.billingCycle}
                        onChange={(e) =>
                          setEditFormData({ ...editFormData, billingCycle: e.target.value })
                        }
                      >
                        <option value="Monthly">Monthly</option>
                        <option value="Quarterly">Quarterly</option>
                        <option value="Yearly">Yearly</option>
                      </select>
                    </div>

                    {/* Sender Id Type */}
                    <div className="external-form-group">
                      <label>Sender Id Type</label>
                      <select
                        value={editFormData.senderIdType}
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
                        value={editFormData.priority}
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
                        value={editFormData.isVisualizeAllowed}
                        onChange={(e) =>
                          setEditFormData({
                            ...editFormData,
                            isVisualizeAllowed: e.target.value
                          })
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
                        value={editFormData.serviceType}
                        onChange={(e) =>
                          setEditFormData({ ...editFormData, serviceType: e.target.value })
                        }
                      >
                        <option value="demo">demo</option>
                        <option value="airtel-govt">airtel-govt</option>
                        <option value="premium">premium</option>
                        <option value="airtel">airtel</option>
                        <option value="mix">mix</option>
                      </select>
                    </div>

                    {/* Account Type (Locked) */}
                    <div className="external-form-group">
                      <label>Account Type</label>
                      <div className="locked-input-wrapper">
                        <input
                          type="text"
                          value={editFormData.accountType}
                          disabled
                          className="disabled-input"
                        />
                        <Lock size={18} className="input-lock-icon"/>
                      </div>
                    </div>
                  </div>
                </div>

                {/* SECTION 2: USER PROFILE */}
                <div className="external-section">
                  <h3 className="external-section-title">USER PROFILE</h3>

                  <div className="external-form-grid">
                    {/* Organisation (Locked) */}
                    <div className="external-form-group">
                      <label>
                        Organisation <span>*</span>
                      </label>
                      <div className="locked-input-wrapper">
                        <input
                          type="text"
                          value={editFormData.organisation}
                          disabled
                          className="disabled-input"
                        />
                        <Lock size={18} className="input-lock-icon"/>
                      </div>
                    </div>

                    {/* Department (Locked) */}
                    <div className="external-form-group">
                      <label>
                        Department <span>*</span>
                      </label>
                      <div className="locked-input-wrapper">
                        <input
                          type="text"
                          value={editFormData.department}
                          disabled
                          className="disabled-input"
                        />
                        <Lock size={18} className="input-lock-icon"/>
                      </div>
                    </div>

                    {/* Email ID */}
                    <div className="external-form-group">
                      <label>
                        Email ID <span>*</span>
                      </label>
                      <input
                        type="email"
                        value={editFormData.emailId}
                        onChange={(e) =>
                          setEditFormData({ ...editFormData, emailId: e.target.value })
                        }
                      />
                    </div>

                    {/* Mobile Number */}
                    <div className="external-form-group">
                      <label>
                        Mobile Number <span>*</span>
                      </label>
                      <input
                        type="text"
                        value={editFormData.mobileNumber}
                        maxLength={10}
                        onChange={(e) =>
                          setEditFormData({ ...editFormData, mobileNumber: e.target.value })
                        }
                      />
                    </div>

                    {/* Account Manager */}
                    <div className="external-form-group full-width">
                      <label>Account Manager</label>
                      <select
                        value={editFormData.accountManager}
                        onChange={(e) =>
                          setEditFormData({
                            ...editFormData,
                            accountManager: e.target.value
                          })
                        }
                      >
                        <option value="">-- Select Account Manager --</option>
                        {internalUsers.map((manager) => (
                          <option key={manager.userId} value={manager.userId}>
                            {manager.userName}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* SECTION 3: USER PERMISSIONS */}
                <div className="external-section">
                  <h3 className="external-section-title">USER PERMISSIONS</h3>

                  <div className="external-permissions-grid">
                    {/* DND Check */}
                    <div className="external-permission-group">
                      <label>DND Check</label>
                      <div className="permission-toggle">
                        <div
                          className={`permission-option ${
                            editFormData.dndCheck === "Yes" ? "selected" : ""
                          }`}
                          onClick={() =>
                            setEditFormData({ ...editFormData, dndCheck: "Yes" })
                          }
                        >
                          {editFormData.dndCheck === "Yes" && (
                            <span className="permission-dot"></span>
                          )}
                          Yes
                        </div>
                        <div
                          className={`permission-option ${
                            editFormData.dndCheck === "No" ? "selected" : ""
                          }`}
                          onClick={() =>
                            setEditFormData({ ...editFormData, dndCheck: "No" })
                          }
                        >
                          {editFormData.dndCheck === "No" && (
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
                            editFormData.creditHistory === "Yes" ? "selected" : ""
                          }`}
                          onClick={() =>
                            setEditFormData({ ...editFormData, creditHistory: "Yes" })
                          }
                        >
                          {editFormData.creditHistory === "Yes" && (
                            <span className="permission-dot"></span>
                          )}
                          Yes
                        </div>
                        <div
                          className={`permission-option ${
                            editFormData.creditHistory === "No" ? "selected" : ""
                          }`}
                          onClick={() =>
                            setEditFormData({ ...editFormData, creditHistory: "No" })
                          }
                        >
                          {editFormData.creditHistory === "No" && (
                            <span className="permission-dot"></span>
                          )}
                          No
                        </div>
                      </div>
                    </div>

                    {/* Mobile Number Masking */}
                    <div className="external-permission-group">
                      <label>Mobile Number Masking</label>
                      <div className="permission-toggle">
                        <div
                          className={`permission-option ${
                            editFormData.mobileMasking === "Yes" ? "selected" : ""
                          }`}
                          onClick={() =>
                            setEditFormData({ ...editFormData, mobileMasking: "Yes" })
                          }
                        >
                          {editFormData.mobileMasking === "Yes" && (
                            <span className="permission-dot"></span>
                          )}
                          Yes
                        </div>
                        <div
                          className={`permission-option ${
                            editFormData.mobileMasking === "No" ? "selected" : ""
                          }`}
                          onClick={() =>
                            setEditFormData({ ...editFormData, mobileMasking: "No" })
                          }
                        >
                          {editFormData.mobileMasking === "No" && (
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
                            editFormData.lowCreditNotif === "Yes" ? "selected" : ""
                          }`}
                          onClick={() =>
                            setEditFormData({ ...editFormData, lowCreditNotif: "Yes" })
                          }
                        >
                          {editFormData.lowCreditNotif === "Yes" && (
                            <span className="permission-dot"></span>
                          )}
                          Yes
                        </div>
                        <div
                          className={`permission-option ${
                            editFormData.lowCreditNotif === "No" ? "selected" : ""
                          }`}
                          onClick={() =>
                            setEditFormData({ ...editFormData, lowCreditNotif: "No" })
                          }
                        >
                          {editFormData.lowCreditNotif === "No" && (
                            <span className="permission-dot"></span>
                          )}
                          No
                        </div>
                      </div>
                    </div>

                    {/* Credit Threshold Value */}
                    <div className="external-form-group">
                      <label>Notify if credit value reaches</label>
                      <input
                        type="text"
                        value={editFormData.creditThreshold}
                        onChange={(e) =>
                          setEditFormData({
                            ...editFormData,
                            creditThreshold: e.target.value
                          })
                        }
                      />
                      <small>Whole numbers only</small>
                    </div>

                    {/* Credit Alert Mode */}
                    <div className="external-form-group">
                      <label>Credit Alert Mode</label>
                      <select
                        value={editFormData.creditAlertMode}
                        onChange={(e) =>
                          setEditFormData({
                            ...editFormData,
                            creditAlertMode: e.target.value
                          })
                        }
                      >
                        <option value="Not Applicable">Not Applicable</option>
                        <option value="Email">Email</option>
                        <option value="SMS">SMS</option>
                        <option value="Both">Both</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="external-drawer-footer">
                <button
                  className="cancel-btn"
                  onClick={() => setShowEditExternalUser(false)}
                >
                  Cancel
                </button>
                <button className="create-btn">Save Changes</button>
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