import { useState, useContext } from "react";
import { AuthContext } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import "@fortawesome/fontawesome-free/css/all.min.css";
import "./Header.css";

function Header() {
  const navigate = useNavigate();

  const [showProfileMenu, setShowProfileMenu] =
    useState(false);

  const logout = () => {
    localStorage.clear();
    navigate("/");
  };

  const { userData } =
  useContext(AuthContext);

const username =
  userData?.username || "User";

const lastLoginTime =
  userData?.lastLoginTime || "-";

const lastLoginIp =
  userData?.lastLoginIp || "-";

  return (
    <header className="header">

      <div className="header-left"></div>

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

        <div className="notification">
          <i className="fa-regular fa-bell"></i>
          <span className="badge">2</span>
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

                  <p>
                    vinod@onextel.com
                  </p>
                </div>
              </div>

              {/* Menu */}

              <div className="dropdown-item">
                <i className="fa-regular fa-user"></i>
                <span>My Profile</span>
              </div>

              <div className="dropdown-item">
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