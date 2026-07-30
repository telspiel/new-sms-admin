import React, { useState, useEffect, useContext } from "react";
import "./InternalUsers.css";
import Endpoints from "../../api/endpoint";
import { AuthContext } from "../../context/AuthContext";

const InternalUsers = () => {
    const { userData } = useContext(AuthContext);

    const [internalUsers, setInternalUsers] = useState([]);

    const [loading, setLoading] = useState(false);

    const [searchTerm, setSearchTerm] = useState("");
    const [selectedUserType, setSelectedUserType] = useState("all");
    const [selectedStatus, setSelectedStatus] = useState("all");

    const [showAddInternalUser, setShowAddInternalUser] = useState(false);
    const [userType, setUserType] = useState("");

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
        setInternalUsers(response.data.userList || []);
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
      getInternalUsers();
    }, []);
    
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

  return (
    <div className="internal-user">
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
                    onChange={(e) => setUserType(e.target.value)}
                >
                    <option value="">-- Select --</option>
                    <option value="Account Manager">Account Manager</option>
                    <option value="Regional Manager">Regional Manager</option>
                    <option value="Support">Support</option>
                </select>
                </div>

                <div className="internal-form-group">
                <label>Status</label>

                <select>
                    <option>Active</option>
                    <option>Inactive</option>
                </select>
                </div>
            </div>

            {userType === "Account Manager" && (
            <div className="internal-form-row">

                <div className="internal-form-group">
                <label>Sr. Account Manager</label>

                <select>
                    <option value="">-- select --</option>
                    <option>Sr Manager 1</option>
                    <option>Sr Manager 2</option>
                </select>
                </div>

                <div className="internal-form-group">
                <label>Regional Manager</label>

                <select>
                    <option value="">-- select --</option>
                    <option>North Region</option>
                    <option>South Region</option>
                </select>
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
                />

                <small>
                4-20 characters · letters, numbers, "." and "_" only · must start with a
                letter
                </small>
            </div>

            {/* Password */}
            <div className="internal-form-group">
                <label>
                Password <span>*</span>
                </label>

                <input
                type="password"
                placeholder="Enter password"
                />

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
                />
                </div>

                <div className="internal-form-group">
                <label>
                    Mobile Number <span>*</span>
                </label>

                <input
                    type="text"
                    placeholder="10-digit mobile number"
                    maxLength={10}
                />
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

                <button className="create-btn">
                Create User
                </button>
            </div>

            </div>
        </div>
        )}
         </div>

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
                    className={`status-badge ${
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
                <button className="internal-action-btn">
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