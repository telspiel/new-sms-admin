import React, { useContext, useMemo, useState } from "react";
import { AuthContext } from "../../context/AuthContext";
import {
  RefreshCw,
  Check,
  Search,
  X,
  TriangleAlert,
  Sparkles,
  Plus,
} from "lucide-react";

import "./CreditNotifications.css";

const CreditNotifications = () => {
  const {
    creditNotifications,
    setCreditNotifications,
  } = useContext(AuthContext);

  const [activeTab, setActiveTab] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedNotifications, setSelectedNotifications] =
    useState([]);

  const allCount = creditNotifications.length;

  const criticalCount = creditNotifications.filter(
    (notification) =>
      Number(notification.availableCredit) === 0
  ).length;

  const lowCount = creditNotifications.filter(
    (notification) =>
      Number(notification.availableCredit) > 0
  ).length;


  const filteredNotifications = useMemo(() => {
    let filtered = [...creditNotifications];


    if (activeTab === "critical") {
      filtered = filtered.filter(
        (notification) =>
          Number(notification.availableCredit) === 0
      );
    }

    if (activeTab === "low") {
      filtered = filtered.filter(
        (notification) =>
          Number(notification.availableCredit) > 0
      );
    }


    if (searchTerm.trim()) {
      const search = searchTerm
        .toLowerCase()
        .trim();

      filtered = filtered.filter((notification) =>
        notification.userName
          ?.toLowerCase()
          .includes(search)
      );
    }

    return filtered;
  }, [
    creditNotifications,
    activeTab,
    searchTerm,
  ]);


  const handleSelectNotification = (userName) => {
    setSelectedNotifications((previous) => {
      if (previous.includes(userName)) {
        return previous.filter(
          (item) => item !== userName
        );
      }

      return [...previous, userName];
    });
  };


  const handleSelectAll = () => {
    const visibleUsernames =
      filteredNotifications.map(
        (notification) =>
          notification.userName
      );

    const allSelected =
      visibleUsernames.length > 0 &&
      visibleUsernames.every((userName) =>
        selectedNotifications.includes(userName)
      );

    if (allSelected) {
      setSelectedNotifications((previous) =>
        previous.filter(
          (userName) =>
            !visibleUsernames.includes(userName)
        )
      );
    } else {
      setSelectedNotifications((previous) => [
        ...new Set([
          ...previous,
          ...visibleUsernames,
        ]),
      ]);
    }
  };


  const isAllSelected =
    filteredNotifications.length > 0 &&
    filteredNotifications.every(
      (notification) =>
        selectedNotifications.includes(
          notification.userName
        )
    );


  const handleRefresh = () => {
    setSearchTerm("");
    setActiveTab("all");
  };


  const handleMarkAllRead = () => {
    setSelectedNotifications([]);
  };


  const handleRemoveNotification = (
    userName
  ) => {
    const updatedNotifications =
      creditNotifications.filter(
        (notification) =>
          notification.userName !== userName
      );

    setCreditNotifications(
      updatedNotifications
    );

    localStorage.setItem(
      "creditNotifications",
      JSON.stringify(
        updatedNotifications
      )
    );

    setSelectedNotifications((previous) =>
      previous.filter(
        (item) => item !== userName
      )
    );
  };


  const handleAddCredits = (userName) => {
    console.log(
      "Add credits for:",
      userName
    );

  };


  return (
    <div className="credit-notifications">


      <div className="credit-notifications-header">

        <div>
          <h1>
            Notifications
          </h1>

          <p>
            Home / Notifications · Users with low or depleted credit
          </p>
        </div>


        <div className="credit-notification-actions">

          <button
            className="refresh-btn"
            onClick={handleRefresh}
          >
            <RefreshCw
              size={17}
              strokeWidth={2}
            />

            <span>
              Refresh
            </span>
          </button>


          {/* <button
            className="mark-all-btn"
            onClick={handleMarkAllRead}
          >
            <Check
              size={17}
              strokeWidth={2.5}
            />

            <span>
              Mark all read
            </span>
          </button> */}

        </div>

      </div>

      <div className="credit-notifications-card">

        <div className="notification-filter-bar">

          <div className="notification-tabs">

            <button
              className={`notification-tab ${
                activeTab === "all"
                  ? "active"
                  : ""
              }`}
              onClick={() =>
                setActiveTab("all")
              }
            >
              <span>
                All
              </span>

              <span className="tab-count all-count">
                {allCount}
              </span>
            </button>


            <button
              className={`notification-tab ${
                activeTab === "critical"
                  ? "active"
                  : ""
              }`}
              onClick={() =>
                setActiveTab("critical")
              }
            >
              <span>
                Critical
              </span>

              <span className="tab-count critical-count">
                {criticalCount}
              </span>
            </button>


            <button
              className={`notification-tab ${
                activeTab === "low"
                  ? "active"
                  : ""
              }`}
              onClick={() =>
                setActiveTab("low")
              }
            >
              <span>
                Low
              </span>

              <span className="tab-count low-count">
                {lowCount}
              </span>
            </button>

          </div>


          {/* Search */}

          <div className="notification-search">

            <Search
              size={18}
              strokeWidth={1.8}
            />

            <input
              type="text"
              placeholder="Search by username..."
              value={searchTerm}
              onChange={(e) =>
                setSearchTerm(
                  e.target.value
                )
              }
            />

          </div>

        </div>

        <div className="notification-table-header">

          <div className="notification-checkbox">

            <input
              type="checkbox"
              checked={isAllSelected}
              onChange={handleSelectAll}
            />

          </div>

          <div className="notification-user-heading">
            USER NAME
          </div>

        </div>

        <div className="notification-table-body">

          {filteredNotifications.length === 0 ? (

            <div className="empty-notifications">

              <div className="empty-icon">
                <Search
                  size={24}
                />
              </div>

              <h3>
                No notifications found
              </h3>

              <p>
                No credit notifications
                match your current filter.
              </p>

            </div>

          ) : (

            filteredNotifications.map(
              (notification, index) => {

                const isOutOfCredits =
                  Number(
                    notification.availableCredit
                  ) === 0;

                const isSelected =
                  selectedNotifications.includes(
                    notification.userName
                  );

                const notificationTime =
                  notification.notificationTime ||
                  notification.updatedAt ||
                  notification.createdAt ||
                  "";

                const notifyBelow =
                  notification.notifyBelow ||
                  notification.threshold ||
                  "";

                return (
                  <div
                    className={`notification-table-row ${
                      isSelected
                        ? "notification-row-selected"
                        : ""
                    }`}
                    key={`${notification.userName}-${index}`}
                  >

                    {/* Checkbox */}

                    <div className="notification-checkbox">

                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() =>
                          handleSelectNotification(
                            notification.userName
                          )
                        }
                      />

                    </div>


                    {/* Alert Icon */}

                    <div
                      className={`credit-alert-icon ${
                        isOutOfCredits
                          ? "credit-alert-danger"
                          : "credit-alert-warning"
                      }`}
                    >

                      {isOutOfCredits ? (
                        <TriangleAlert
                          size={20}
                          strokeWidth={2}
                        />
                      ) : (
                        <Sparkles
                          size={19}
                          strokeWidth={2}
                        />
                      )}

                    </div>


                    {/* Main Content */}

                    <div className="notification-row-content">

                      <div className="notification-title">

                        <strong>
                          {notification.userName}
                        </strong>

                        <span>
                          {" "}
                          {isOutOfCredits
                            ? "has run out of credits"
                            : "has a low credit balance"}
                        </span>

                      </div>


                      <div className="notification-meta">

                        <span className="low-credit-label">
                          Low Available Credit
                        </span>

                        <span
                          className={`credit-value ${
                            isOutOfCredits
                              ? "credit-value-danger"
                              : "credit-value-warning"
                          }`}
                        >
                          {
                            notification.availableCredit
                          }{" "}
                          credits
                        </span>


                        {notifyBelow && (
                          <span className="notify-threshold">
                            Notify below{" "}
                            {Number(
                              notifyBelow
                            ).toLocaleString()}{" "}
                            credits
                          </span>
                        )}

                      </div>

                    </div>


                    {/* Right Side */}

                    <div className="notification-row-actions">

                      {notificationTime && (
                        <span className="notification-time">
                          {notificationTime}
                        </span>
                      )}


                      <button
                        className="add-credits-btn"
                        onClick={() =>
                          handleAddCredits(
                            notification.userName
                          )
                        }
                      >
                        Add credits
                      </button>


                      <button
                        className="remove-notification-btn"
                        onClick={() =>
                          handleRemoveNotification(
                            notification.userName
                          )
                        }
                        title="Remove notification"
                      >
                        <X
                          size={18}
                          strokeWidth={1.8}
                        />
                      </button>

                    </div>

                  </div>
                );
              }
            )

          )}

        </div>
      </div>
    </div>
  );
};

export default CreditNotifications;