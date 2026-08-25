import React, { useContext, useMemo, useState } from "react";
import { AuthContext } from "../../context/AuthContext";
import Endpoints from "../../api/endpoint";
import {
  Search,
  TriangleAlert,
  TrendingDown,
} from "lucide-react";

import "./CreditNotifications.css";

const CreditNotifications = () => {
  const { creditNotifications = [], userData } = useContext(AuthContext);

  const [activeTab, setActiveTab] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Modal & API States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [selectedUserCreditData, setSelectedUserCreditData] = useState(null);
  const [amountToAdd, setAmountToAdd] = useState("");

  const allCount = creditNotifications.length;
  const criticalCount = creditNotifications.filter(
    (n) => Number(n.availableCredit) === 0
  ).length;
  const lowCount = creditNotifications.filter(
    (n) => Number(n.availableCredit) > 0
  ).length;

  const filteredNotifications = useMemo(() => {
    let filtered = [...creditNotifications];

    if (activeTab === "critical") {
      filtered = filtered.filter((n) => Number(n.availableCredit) === 0);
    } else if (activeTab === "low") {
      filtered = filtered.filter((n) => Number(n.availableCredit) > 0);
    }

    if (searchTerm.trim()) {
      const search = searchTerm.toLowerCase().trim();
      filtered = filtered.filter((n) =>
        n.userName?.toLowerCase().includes(search)
      );
    }

    return filtered;
  }, [creditNotifications, activeTab, searchTerm]);

  // Pagination bounds
  const totalPages = Math.ceil(filteredNotifications.length / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedNotifications = filteredNotifications.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  // State to track the active row item selected when opening the modal
const [selectedNotification, setSelectedNotification] = useState(null);

const [toastMessage, setToastMessage] = useState("");

// Update handleAddCredits to save the selected notification item
const handleAddCredits = async (notification) => {
  setSelectedNotification(notification);
  setIsModalOpen(true);
  setModalLoading(true);
  setAmountToAdd("");

  try {
    const url = Endpoints.get("viewCreditForUser");

    const loggedInUser =
      userData?.username ||
      JSON.parse(sessionStorage.getItem("userData") || "{}")?.username ||
      JSON.parse(localStorage.getItem("userData") || "{}")?.username ||
      "";

    const token =
      userData?.authJwtToken ||
      JSON.parse(sessionStorage.getItem("userData") || "{}")?.authJwtToken ||
      JSON.parse(localStorage.getItem("userData") || "{}")?.authJwtToken ||
      "";

    const role = notification.userRole?.toLowerCase();

    const payload = {
      loggedInUserName: loggedInUser,
      ...(role === "client" && { clientName: notification.userName }),
      ...(role === "reseller" && { resellerName: notification.userName }),
      ...(role === "user" && { userName: notification.userName }),
    };

    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: token,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const resData = await response.json();

    if (resData?.code === 8007 || resData?.result === "Success") {
      setSelectedUserCreditData(resData.data?.userCredit);
    } else {
      alert(resData?.message || "Failed to fetch credit details.");
    }
  } catch (err) {
    console.error("Error fetching credit data:", err);
    alert("Error fetching user credit details");
  } finally {
    setModalLoading(false);
  }
};


const handleModalSubmit = async (e) => {
  e.preventDefault();

  if (!amountToAdd || Number(amountToAdd) <= 0) {
    alert("Please enter a valid credit amount.");
    return;
  }

  try {
    const url = Endpoints.get("updateCredit");

    const loggedInUser =
      userData?.username ||
      JSON.parse(sessionStorage.getItem("userData") || "{}")?.username ||
      JSON.parse(localStorage.getItem("userData") || "{}")?.username ||
      "";

    const token =
      userData?.authJwtToken ||
      JSON.parse(sessionStorage.getItem("userData") || "{}")?.authJwtToken ||
      JSON.parse(localStorage.getItem("userData") || "{}")?.authJwtToken ||
      "";

    const role = selectedNotification?.userRole?.toLowerCase();

    const payload = {
      loggedInUserName: loggedInUser,
      creditToBeAdded: Number(amountToAdd),
      operation: "addCredit",
      ...(role === "client" && { clientName: selectedNotification?.userName }),
      ...(role === "reseller" && { resellerName: selectedNotification?.userName }),
      ...(role === "user" && { userName: selectedNotification?.userName }),
    };

    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: token,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const resData = await response.json();

    if (resData?.code === 8007 || resData?.result === "Success") {
      setToastMessage("Credits added successfully!");
      
      // Close the modal instantly on success
      setIsModalOpen(false);

      // Auto-clear toast after 3 seconds
      setTimeout(() => setToastMessage(""), 3000);

      
    } else {
      alert(resData?.message || "Failed to add credits.");
    }
  } catch (err) {
    console.error("Error updating credit:", err);
    alert("An error occurred while updating credits.");
  }
};

  return (
    <div className="credit-notifications">
       {toastMessage && (
        <div className="toast-message">
            <i className="fa-solid fa-circle-check"></i>
            {toastMessage}
        </div>
        )}
      <div className="credits-management-header">
        <h1>Notifications</h1>
        <p>Home / Notifications · Users with low or depleted credit</p>
      </div>

      <div className="credit-notifications-card">
        {/* Top Filter Bar */}
        <div className="notification-filter-bar">
          <div className="notification-tabs">
            <button
              className={`notification-tab ${activeTab === "all" ? "active" : ""}`}
              onClick={() => {
                setActiveTab("all");
                setCurrentPage(1);
              }}
            >
              All <span className="tab-count">{allCount}</span>
            </button>

            <button
              className={`notification-tab ${activeTab === "critical" ? "active" : ""}`}
              onClick={() => {
                setActiveTab("critical");
                setCurrentPage(1);
              }}
            >
              Critical <span className="tab-count">{criticalCount}</span>
            </button>

            <button
              className={`notification-tab ${activeTab === "low" ? "active" : ""}`}
              onClick={() => {
                setActiveTab("low");
                setCurrentPage(1);
              }}
            >
              Low <span className="tab-count">{lowCount}</span>
            </button>
          </div>
        </div>

        {/* Rows List */}
        <div className="notification-table-body">
          {paginatedNotifications.length === 0 ? (
            <div className="empty-notifications">
              <Search size={24} />
              <h3>No notifications found</h3>
            </div>
          ) : (
            paginatedNotifications.map((notification, index) => {
              const isOutOfCredits = Number(notification.availableCredit) === 0;

              return (
                <div
                  className="notification-table-row"
                  key={`${notification.userName}-${index}`}
                >
                  {/* Status Dot */}
                  <span className="row-status-dot"></span>

                  {/* Icon */}
                  <div
                    className={`credit-alert-icon ${
                      isOutOfCredits ? "credit-alert-danger" : "credit-alert-warning"
                    }`}
                  >
                    {isOutOfCredits ? (
                      <TriangleAlert size={16} />
                    ) : (
                      <TrendingDown size={16} />
                    )}
                  </div>

                  {/* Content */}
                  <div className="notification-row-content">
                    <div className="notification-title">
                      <strong>{notification.userName}</strong>
                      <span>
                        {isOutOfCredits
                          ? " has run out of credits"
                          : " has a low credit balance"}
                      </span>
                    </div>

                    <div className="notification-meta">
                      <span className="low-credit-label">Low Available Credit</span>
                      <span
                        className={`credit-value ${
                          isOutOfCredits
                            ? "credit-value-danger"
                            : "credit-value-warning"
                        }`}
                      >
                        {notification.availableCredit} credits
                      </span>
                    </div>
                  </div>

                  {/* Right Actions */}
                  <div className="notification-row-actions">
                    {/* <span className="notification-time">
                      {notification.notificationTime || "Just now"}
                    </span> */}
                    <button
                      className="add-credits-btn"
                      onClick={() => handleAddCredits(notification)}
                    >
                      Add credits
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Add Credits Popup Modal */}
      {isModalOpen && (
        <div className="notification-modal-overlay">
          <div className="modal-container">
            <div className="notification-modal-header">
              <h2>Add credits</h2>
              <p>Top up the balance for this account</p>
            </div>

            {modalLoading ? (
              <div className="modal-loading">Loading account details...</div>
            ) : (
              <form onSubmit={handleModalSubmit}>
                <div className="credit-modal-body">
                  <div className="credit-modal-info-row">
                    <span className="modal-label">User Name</span>
                    <strong className="modal-value">
                      {selectedUserCreditData?.userName || "--"}
                    </strong>
                  </div>

                  <div className="credit-modal-info-row">
                    <span className="modal-label">Current balance</span>
                    <strong className="modal-value">
                      {Number(
                        selectedUserCreditData?.userAvailableCredit || 0
                      ).toLocaleString()}{" "}
                      credits
                    </strong>
                  </div>

                  <div className="credit-modal-info-row">
                    <span className="modal-label">Your Available Credit</span>
                    <strong className="modal-value">
                      {Number(
                        selectedUserCreditData?.loggedInUserCredit || 0
                      ).toLocaleString()}{" "}
                      credits
                    </strong>
                  </div>

                  <div className="credit-modal-input-group">
                    <label>
                      Amount to add <span className="required-asterisk">*</span>
                    </label>
                    <input
                      type="number"
                      placeholder="0"
                      value={amountToAdd}
                      onChange={(e) => setAmountToAdd(e.target.value)}
                      onKeyDown={(e) => ["-", "e", "E", "+"].includes(e.key) && e.preventDefault()}
                      required
                      min="1"
                    />
                  </div>
                </div>

                <div className="notification-modal-footer">
                  <button
                    type="button"
                    className="modal-cancel-btn"
                    onClick={() => setIsModalOpen(false)}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="modal-submit-btn">
                    Add credits
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CreditNotifications;