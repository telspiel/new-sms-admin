import { useState, useContext, useRef, useEffect } from "react";
import { AuthContext } from "../../context/AuthContext";
import { useNavigate, useLocation  } from "react-router-dom";
import "@fortawesome/fontawesome-free/css/all.min.css";
import { TriangleAlert, Sparkles } from "lucide-react";
import "./Header.css";

function Header() {
  const navigate = useNavigate();
  const location = useLocation();

  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);


  const logout = () => {
    localStorage.clear();
    navigate("/");
  };

  const { userData, creditNotifications } = useContext(AuthContext);

const username =
  userData?.username || "User";

const lastLoginTime =
  userData?.lastLoginTime || "-";

const lastLoginIp =
  userData?.lastLoginIp || "-";

const logoUrl =
  userData?.logoUrl || "-";

  return (
    <header className="header">

      <div className="header-left">
         <div className="user-logo">
          <img
            src={logoUrl}
            alt="Company Logo"
            className="header-logo"
          />
        </div>
      </div>

      <div className="header-right">

        <div className="header-info">
            <span className="header-label">
            Last Login:
            </span>

            <span className="header-value">
             {lastLoginTime}
            </span>
        </div>

        <div className="header-info">
            <span className="header-label">
            Last Login IP:
            </span>

            <span className="header-value">
             {lastLoginIp}
            </span>
        </div>

       <div className="notification-wrapper">
          <div
            className={`notification ${
              showNotifications
                ? "notification-active"
                : ""
            }`}
            onClick={() =>
              setShowNotifications(
                !showNotifications
              )
            }
          >
            <i className="fa-regular fa-bell"></i>

            {creditNotifications.length > 0 && (
              <span className="badge">
                {creditNotifications.length}
              </span>
            )}
          </div>


          {showNotifications && (
            <div className="notification-dropdown">

              <div className="notification-header">

                <div>
                  <h3>
                    Notifications
                  </h3>

                  <p>
                    {creditNotifications.length}{" "}
                    {creditNotifications.length === 1
                      ? "account"
                      : "accounts"}{" "}
                    need attention
                  </p>
                </div>

                {/* <button
                  className="mark-read-btn"
                  onClick={() => {
                    setShowNotifications(false);
                  }}
                >
                  Mark all read
                </button> */}

              </div>

              <div className="notification-list">
                {creditNotifications.length === 0 ? (
                  <div className="no-notifications">
                    <i className="fa-regular fa-bell-slash"></i>
                    <p>
                      No credit notifications
                    </p>
                  </div>

                ) : (

                  creditNotifications.map(
                    (notification, index) => {

                      const isOutOfCredits =
                        Number(
                          notification.availableCredit
                        ) === 0;

                      return (
                        <div
                          className="credit-notification-item"
                          key={`${notification.userName}-${index}`}
                        >


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

                          <div className="credit-notification-content">
                            <div className="credit-notification-title">
                              <strong>
                                {notification.userName}
                              </strong>

                              <span>
                                {" "}
                                {isOutOfCredits
                                  ? " has run out of credits"
                                  : " has a low credit balance"}
                              </span>

                            </div>

                            <div className="credit-notification-bottom">

                              <span className="low-credit-text">
                                Low Available Credit
                              </span>

                              <span
                                className={`credit-value ${
                                  isOutOfCredits
                                    ? "credit-value-danger"
                                    : "credit-value-warning"
                                }`}
                              >
                                {notification.availableCredit}{" "}
                                credits
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    }
                  )
                )}

              </div>

              <div className="notification-footer">

                <button
                  onClick={() => {
                    setShowNotifications(false);
                    navigate(
                      "/credit-notifications"
                    );
                  }}
                >
                  View all notifications
                </button>

              </div>

            </div>
          )}
        </div>

        <div className="profile-wrapper">

          <div
            className="profile-section"
            onClick={() =>
              setShowProfileMenu(
                !showProfileMenu
              )
            }
          >
            <div className="avatar">
               {username.charAt(0).toUpperCase()}
            </div>

            <span className="username">
              {username}
            </span>

            <i
              className={`fa-solid ${
                showProfileMenu
                  ? "fa-chevron-up"
                  : "fa-chevron-down"
              }`}
            ></i>
          </div>

          {showProfileMenu && (
            <div className="profile-dropdown">

              {/* User Info */}

              <div className="profile-top">
                <div className="avatar large">
                    {username?.charAt(0).toUpperCase()}
                </div>

                <div>
                  <h4>{username}</h4>
                </div>
              </div>

              {/* Menu */}
               <div
                className={`dropdown-item ${
                  location.pathname === "/my-profile" ? "header-active-link" : ""
                }`}
                onClick={() => {
                  setShowProfileMenu(false);
                  navigate("/my-profile");
                }}
              >
                <i className="fa-regular fa-user"></i>
                <span>My Profile</span>
              </div>

              <div
                className={`dropdown-item ${
                  location.pathname === "/change-password" ? "header-active-link" : ""
                }`}
                onClick={() => {
                  setShowProfileMenu(false);
                  navigate("/change-password");
                }}
              >
                <i className="fa-solid fa-lock"></i>
                <span>Change Password</span>
              </div>

              <div
                className="dropdown-item logout"
                onClick={logout}
              >
                <i className="fa-solid fa-right-from-bracket"></i>
                <span>Logout</span>
              </div>

            </div>
          )}

        </div>

      </div>
    </header>
  );
}

export default Header;