import { useState } from "react";
import { NavLink } from "react-router-dom";
import "@fortawesome/fontawesome-free/css/all.min.css";
import "./Sidebar.css";

function Sidebar() {
 const [managementOpen, setManagementOpen] = useState(false);
 const [userManagementOpen, setUserManagementOpen] = useState(false);
 const [reportsOpen, setReportsOpen] = useState(false);
 const [routingOpen, setRoutingOpen] = useState(false);
 const [configOpen, setConfigOpen] = useState(false);

  return (
    <aside className="sidebar">
      <ul className="menu">

        {/* Dashboard */}
        <li className="menu-item">
          <NavLink
            to="/dashboard"
            className={({ isActive }) =>
              isActive ? "active-link" : ""
            }
          >
            <i className="fa-solid fa-table-cells-large"></i>
            <span>Dashboard</span>
          </NavLink>
        </li>

        {/* Management Console */}
        <li>
            <div
                className="menu-header"
                onClick={() => setManagementOpen(!managementOpen)}
            >
                <div>
                <i className="fa-solid fa-users"></i>
                <span>Management Console</span>
                </div>

                <i
                className={`fa-solid ${
                    managementOpen ? "fa-chevron-down" : "fa-chevron-right"
                }`}
                ></i>
            </div>

            {managementOpen && (
                <ul className="submenu">

                <li>
                    <NavLink
                    to="/organization-management"
                    className={({ isActive }) =>
                        isActive ? "active-link" : ""
                    }
                    >
                    Organization Management
                    </NavLink>
                </li>

                <li>
                    <NavLink
                    to="/department-management"
                    className={({ isActive }) =>
                        isActive ? "active-link" : ""
                    }
                    >
                    Department Management
                    </NavLink>
                </li>

                {/* User Management */}
                <li>
            <div
                className="submenu-header"
                onClick={() => setUserManagementOpen(!userManagementOpen)}
            >
                <div>
                <i className="fa-regular fa-user"></i>
                <span>User Management</span>
                </div>

                <i
                className={`fa-solid ${
                    userManagementOpen ? "fa-chevron-down" : "fa-chevron-right"
                }`}
                ></i>
            </div>

            {userManagementOpen && (
                <ul className="nested-submenu">
                <li>
                    <NavLink
                    to="/external-users"
                    className={({ isActive }) =>
                        isActive ? "active-link" : ""
                    }
                    >
                    External Users
                    </NavLink>
                </li>

                <li>
                    <NavLink
                    to="/internal-users"
                    className={({ isActive }) =>
                        isActive ? "active-link" : ""
                    }
                    >
                    Internal Users
                    </NavLink>
                </li>
                </ul>
            )}
            </li>

                </ul>
            )}
            </li>

        {/* Credits Management */}
        <li className="menu-item">
          <NavLink
            to="/credits-management"
            className={({ isActive }) =>
              isActive ? "active-link" : ""
            }
          >
            <i className="fa-solid fa-dollar-sign"></i>
            <span>Credits Management</span>
          </NavLink>
        </li>

        {/* Generate API Key */}
        <li className="menu-item">
          <NavLink
            to="/generate-api-key"
            className={({ isActive }) =>
              isActive ? "active-link" : ""
            }
          >
            <i className="fa-solid fa-key"></i>
            <span>Generate API Key</span>
          </NavLink>
        </li>

        {/* Reports */}
        <li>
          <div
            className="menu-header"
            onClick={() =>
              setReportsOpen(!reportsOpen)
            }
          >
            <div>
              <i className="fa-solid fa-chart-column"></i>
              <span>Reports</span>
            </div>

            <i
              className={`fa-solid ${
                reportsOpen
                  ? "fa-chevron-down"
                  : "fa-chevron-right"
              }`}
            ></i>
          </div>

          {reportsOpen && (
            <ul className="submenu">
              <li>
                <NavLink
                  to="/delivery-report"
                  className={({ isActive }) =>
                    isActive ? "active-link" : ""
                  }
                >
                  Delivery Report
                </NavLink>
              </li>

              <li>
                <NavLink
                  to="/summary-report"
                  className={({ isActive }) =>
                    isActive ? "active-link" : ""
                  }
                >
                  Summary Report
                </NavLink>
              </li>

              <li>
                <NavLink
                  to="/campaign-report"
                  className={({ isActive }) =>
                    isActive ? "active-link" : ""
                  }
                >
                  Campaign Report
                </NavLink>
              </li>
            </ul>
          )}
        </li>

        {/* DR Summary */}
        <li className="menu-item">
          <NavLink
            to="/dr-summary"
            className={({ isActive }) =>
              isActive ? "active-link" : ""
            }
          >
            <i className="fa-regular fa-file-lines"></i>
            <span>DR Summary</span>
          </NavLink>
        </li>

        {/* Routing Management */}
        <li>
          <div
            className="menu-header"
            onClick={() =>
              setRoutingOpen(!routingOpen)
            }
          >
            <div>
              <i className="fa-solid fa-shuffle"></i>
              <span>Routing Management</span>
            </div>

            <i
              className={`fa-solid ${
                routingOpen
                  ? "fa-chevron-down"
                  : "fa-chevron-right"
              }`}
            ></i>
          </div>

          {routingOpen && (
            <ul className="submenu">
              <li>
                <NavLink
                  to="/manage-connect"
                  className={({ isActive }) =>
                    isActive ? "active-link" : ""
                  }
                >
                  Manage Connect
                </NavLink>
              </li>

              <li>
                <NavLink
                  to="/new-user-routing"
                  className={({ isActive }) =>
                    isActive ? "active-link" : ""
                  }
                >
                  New User Routing
                </NavLink>
              </li>

              <li>
                <NavLink
                  to="/switch-gateway"
                  className={({ isActive }) =>
                    isActive ? "active-link" : ""
                  }
                >
                  Switch Gateway
                </NavLink>
              </li>

              <li>
                <NavLink
                  to="/userwise-routing"
                  className={({ isActive }) =>
                    isActive ? "active-link" : ""
                  }
                >
                  Userwise Routing
                </NavLink>
              </li>

              <li>
                <NavLink
                  to="/smpp-session-management"
                  className={({ isActive }) =>
                    isActive ? "active-link" : ""
                  }
                >
                  SMPP Session Management
                </NavLink>
              </li>
            </ul>
          )}
        </li>

        {/* Operator Summary */}
        <li className="menu-item">
          <NavLink
            to="/operator-traffic"
            className={({ isActive }) =>
              isActive ? "active-link" : ""
            }
          >
            <i className="fa-regular fa-window-maximize"></i>
            <span>Operator Traffic</span>
          </NavLink>
        </li>

        {/* Config */}
        <li>
          <div
            className="menu-header"
            onClick={() =>
              setConfigOpen(!configOpen)
            }
          >
            <div>
              <i className="fa-solid fa-gear"></i>
              <span>Config</span>
            </div>

            <i
              className={`fa-solid ${
                configOpen
                  ? "fa-chevron-down"
                  : "fa-chevron-right"
              }`}
            ></i>
          </div>

          {configOpen && (
            <ul className="submenu">
              <li>
                <NavLink
                  to="/global-blacklist"
                  className={({ isActive }) =>
                    isActive ? "active-link" : ""
                  }
                >
                  Global Blacklist
                </NavLink>
              </li>

              <li>
                <NavLink
                  to="/user-premium-routing"
                  className={({ isActive }) =>
                    isActive ? "active-link" : ""
                  }
                >
                  User Premium Routing
                </NavLink>
              </li>
            </ul>
          )}
        </li>

        {/* Logo Upload */}
        <li className="menu-item">
          <NavLink
            to="/logo-upload"
            className={({ isActive }) =>
              isActive ? "active-link" : ""
            }
          >
            <i className="fa-regular fa-message"></i>
            <span>Logo Upload</span>
          </NavLink>
        </li>

        {/* Error Code */}
        <li className="menu-item">
          <NavLink
            to="/error-code"
            className={({ isActive }) =>
              isActive ? "active-link" : ""
            }
          >
            <i className="fa-solid fa-triangle-exclamation"></i>
            <span>Error Code</span>
          </NavLink>
        </li>

      </ul>
    </aside>
  );
}

export default Sidebar;