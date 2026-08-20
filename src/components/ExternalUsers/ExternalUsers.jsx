import React, { useEffect, useState, useContext } from "react";
import "./ExternalUsers.css";
import Endpoints from "../../api/endpoint";
import { AuthContext } from "../../context/AuthContext";

const ExternalUsers = () => {
  const { userData } = useContext(AuthContext);

  const [loading, setLoading] = useState(false);
  const [externalUsers, setExternalUsers] = useState([]);
  const [toastMessage, setToastMessage] = useState("");

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUserType, setSelectedUserType] = useState("");
  const [selectedAccountType, setSelectedAccountType] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");

  const [showAddExternalUser, setShowAddExternalUser] = useState(false);

  const getExternalUsers = async () => {
    setLoading(true);

    try {
        const payload = {
        loggedInUserName: userData.username,
        pageNumber: 1
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
        console.error(error);
    } finally {
        setLoading(false);
     }
    };

    useEffect(() => {
     getExternalUsers();
    }, []);

  //Filter search table
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

const userTypeOptions = [
  ...new Set(
    externalUsers
      .map((user) => user.customerType)
      .filter(Boolean)
  ),
];

const accountTypeOptions = [
  ...new Set(
    externalUsers
      .map((user) => user.userAccountType)
      .filter(Boolean)
  ),
];

const statusOptions = [
  ...new Set(
    externalUsers
      .map((user) => user.status)
      .filter(Boolean)
  ),
];

  return (
    <div className="external-user">
         <div className="external-user-header">
            <div>
            <h1>External Users</h1>
            <p>Home / Management Console / User Management / External Users · All external accounts across your hierarchy</p>
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

                    <h3 className="external-section-title">
                    USER ACCOUNT
                    </h3>

                    <div className="external-form-grid">

                    {/* User Type */}
                    <div className="external-form-group">
                        <label>
                        User Type <span>*</span>
                        </label>

                        <select defaultValue="Client">
                        <option value="">-- Select --</option>
                        <option value="Client">Client</option>
                        <option value="Reseller">Reseller</option>
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
                        />

                        <small>
                        4-20 characters · letters, numbers, "." and "_" only ·
                        must start with a letter
                        </small>
                    </div>

                    {/* Password */}
                    <div className="external-form-group">
                        <label>
                        Password <span>*</span>
                        </label>

                        <input
                        type="password"
                        placeholder="Enter password"
                        />

                        <small>
                        6-20 characters · no spaces
                        </small>
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
                        <option value="SMS">SMS</option>
                        <option value="Voice">Voice</option>
                        <option value="Both">Both</option>
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

                    <h3 className="external-section-title">
                    USER PROFILE
                    </h3>

                    <div className="external-form-grid">

                    {/* Organisation */}
                    <div className="external-form-group">
                        <label>
                        Organisation <span>*</span>
                        </label>

                        <select defaultValue="">
                        <option value="">-- Select --</option>
                        <option value="Organization 1">
                            Organization 1
                        </option>
                        <option value="Organization 2">
                            Organization 2
                        </option>
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

                        <input
                        type="email"
                        placeholder="name@company.com"
                        />
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

                    {/* Account Manager - Full Width */}
                    <div className="external-form-group full-width">
                        <label>Account Manager</label>

                        <select defaultValue="operation">
                        <option value="operation">operation</option>
                        <option value="account-manager">
                            Account Manager
                        </option>
                        </select>
                    </div>

                    </div>
                </div>

                <div className="external-section">

                    <h3 className="external-section-title">
                    USER PERMISSIONS
                    </h3>

                    <div className="external-permissions-grid">

                    {/* DND Check */}
                    <div className="external-permission-group">
                        <label>DND Check</label>

                        <div className="permission-toggle">
                        <div className="permission-option">
                            Yes
                        </div>

                        <div className="permission-option selected">
                            <span className="permission-dot"></span>
                            No
                        </div>
                        </div>
                    </div>

                    {/* Credit History */}
                    <div className="external-permission-group">
                        <label>Credit History</label>

                        <div className="permission-toggle">
                        <div className="permission-option">
                            Yes
                        </div>

                        <div className="permission-option selected">
                            <span className="permission-dot"></span>
                            No
                        </div>
                        </div>
                    </div>

                    {/* Mobile Number Masking */}
                    <div className="external-permission-group">
                        <label>Mobile Number Masking</label>

                        <div className="permission-toggle">
                        <div className="permission-option">
                            Yes
                        </div>

                        <div className="permission-option selected">
                            <span className="permission-dot"></span>
                            No
                        </div>
                        </div>
                    </div>

                    {/* Low Credit Notification */}
                    <div className="external-permission-group">
                        <label>Low Credit Notification</label>

                        <div className="permission-toggle">
                        <div className="permission-option">
                            Yes
                        </div>

                        <div className="permission-option selected">
                            <span className="permission-dot"></span>
                            No
                        </div>
                        </div>
                    </div>

                    {/* Credit Alert Mode */}
                    <div className="external-permission-group">
                        <label>Credit Alert Mode</label>

                        <select defaultValue="Not Applicable">
                        <option value="Not Applicable">
                            Not Applicable
                        </option>

                        <option value="Email">
                            Email
                        </option>

                        <option value="SMS">
                            SMS
                        </option>

                        <option value="Both">
                            Both
                        </option>
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

                <button className="create-btn">
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
             {filteredExternalUsers.length} of {filteredExternalUsers.length} users
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
    ) : externalUsers.length > 0 ? (
      filteredExternalUsers.map((user, index) => {
        // Get first letter for avatar
        const avatarLetter = user.userName
          ? user.userName.charAt(0).toUpperCase()
          : "-";

        // Format creation date
        const formattedDate = user.creationDate
          ? user.creationDate.split(" ")[0].split("-").reverse().join("-")
          : "-";

        // Account type
        const accountType = user.userAccountType
        ? user.userAccountType.toUpperCase()
        : "-";

        return (
          <tr key={index}>

            {/* USER */}
            <td>
              <div className="user-info">
                <div className="user-avatar">
                  {avatarLetter}
                </div>

                <div className="user-name">
                  {user.userName || "-"}
                </div>
              </div>
            </td>

            {/* CONTACT */}
            <td>
              <div className="contact-info">
                <div className="mobile">
                  {user.contactNumber || "-"}
                </div>

                <div className="email">
                  {user.emailId || "-"}
                </div>
              </div>
            </td>

            {/* USER TYPE */}
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

            {/* ACCOUNT TYPE */}
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

            {/* ORGANISATION */}
            <td>
              <span className="organisation">
                {user.provider || "-"}
              </span>
            </td>

            {/* CREATED */}
            <td>
              <span className="created-date">
                {formattedDate}
              </span>
            </td>

            {/* STATUS */}
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

            {/* ACTIONS */}
            <td>
              <button
                className="action-btn"
                title="Edit User"
                onClick={() => {
                  console.log("Edit user:", user);
                }}
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

    <div className="table-footer">

    <span>
        Showing {filteredExternalUsers.length === 0 ? 0 : 1}–{filteredExternalUsers.length} of{" "}
        {filteredExternalUsers.length}
    </span>

    <div className="pagination">

        <button className="page-btn">
        <i className="fa-solid fa-chevron-left"></i>
        </button>

        <button className="page-btn active"> 1 </button>
        <button className="page-btn"> 2 </button>
        <button className="page-btn"> 3 </button>
        <button className="page-btn"> 4 </button>
        <button className="page-btn"> 5 </button>

        <button className="page-btn">
        <i className="fa-solid fa-chevron-right"></i>
        </button>

    </div>

    </div>
    </div>
    </div>
    </div>
  )
}

export default ExternalUsers
