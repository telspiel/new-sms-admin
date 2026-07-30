import { useState, useEffect } from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  UserRound,
  KeyRound,
  IndianRupee,
  BarChart3,
  FileText,
  ArrowLeftRight,
  Monitor,
  Settings,
  Image,
  TriangleAlert,
  ChevronRight,
  ChevronDown,
} from "lucide-react";
import "./Sidebar.css";

function Sidebar() {
  const location = useLocation();

  const [managementOpen, setManagementOpen] = useState(false);
  const [userManagementOpen, setUserManagementOpen] = useState(false);
  const [reportsOpen, setReportsOpen] = useState(false);
  const [routingOpen, setRoutingOpen] = useState(false);
  const [configOpen, setConfigOpen] = useState(false);

  useEffect(() => {
    // Management Console
    setManagementOpen(
      [
        "/organization-management",
        "/department-management",
        "/external-users",
        "/internal-users",
      ].includes(location.pathname)
    );

    // User Management
    setUserManagementOpen(
      ["/external-users", "/internal-users"].includes(location.pathname)
    );

    // Reports
    setReportsOpen(
      [
        "/delivery-report",
        "/summary-report",
        "/campaign-report",
      ].includes(location.pathname)
    );

    // Routing Management
    setRoutingOpen(
      [
        "/manage-connect",
        "/new-user-routing",
        "/switch-gateway",
        "/userwise-routing",
        "/smpp-session-management",
      ].includes(location.pathname)
    );

    // Config
    setConfigOpen(
      [
        "/global-blacklist",
        "/user-premium-routing",
      ].includes(location.pathname)
    );
  }, [location.pathname]);

  return (
    <aside className="sidebar">
      <ul className="menu">

        {/* Dashboard */}
        <li className="menu-item">
          <NavLink
            to="/dashboard"
            className={({ isActive }) => (isActive ? "active-link" : "")}
          >
            <LayoutDashboard size={20} strokeWidth={1.8} />
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
              <Users size={20} strokeWidth={1.8} />
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

              <li>
                <div
                  className="submenu-header"
                  onClick={() =>
                    setUserManagementOpen(!userManagementOpen)
                  }
                >
                  <div>
                    <i className="fa-regular fa-user"></i>
                    <span>User Management</span>
                  </div>

                  <i
                    className={`fa-solid ${
                      userManagementOpen
                        ? "fa-chevron-down"
                        : "fa-chevron-right"
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

        {/* Credits */}
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

        {/* API Key */}
        <li className="menu-item">
          <NavLink
            to="/generate-api-key"
            className={({ isActive }) =>
              isActive ? "active-link" : ""
            }
          >
            <KeyRound size={20} strokeWidth={1.8} />
            <span>Generate API Key</span>
          </NavLink>
        </li>

        {/* Reports */}
        <li>
          <div
            className="menu-header"
            onClick={() => setReportsOpen(!reportsOpen)}
          >
            <div>
              <BarChart3 size={20} strokeWidth={1.8} />
              <span>Reports</span>
            </div>

            <i
              className={`fa-solid ${
                reportsOpen ? "fa-chevron-down" : "fa-chevron-right"
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
            <FileText size={20} strokeWidth={1.8} />
            <span>DR Summary</span>
          </NavLink>
        </li>

        {/* Routing */}
        <li>
          <div
            className="menu-header"
            onClick={() => setRoutingOpen(!routingOpen)}
          >
            <div>
              <ArrowLeftRight size={20} strokeWidth={1.8} />
              <span>Routing Management</span>
            </div>

            <i
              className={`fa-solid ${
                routingOpen ? "fa-chevron-down" : "fa-chevron-right"
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

        {/* Operator Traffic */}
        <li className="menu-item">
          <NavLink
            to="/operator-traffic"
            className={({ isActive }) =>
              isActive ? "active-link" : ""
            }
          >
            <Monitor size={20} strokeWidth={1.8} />
            <span>Operator Traffic</span>
          </NavLink>
        </li>

        {/* Config */}
        <li>
          <div
            className="menu-header"
            onClick={() => setConfigOpen(!configOpen)}
          >
            <div>
              <Settings size={20} strokeWidth={1.8} />
              <span>Config</span>
            </div>

            <i
              className={`fa-solid ${
                configOpen ? "fa-chevron-down" : "fa-chevron-right"
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
            <Image size={20} strokeWidth={1.8} />
            <span>Logo Upload</span>
          </NavLink>
        </li>

      </ul>
    </aside>
  );
}

export default Sidebar;