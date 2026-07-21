import { Outlet } from "react-router-dom";
import Header from "../../pages/Header/Header";
import Sidebar from "../../pages/Sidebar/Sidebar";
import "./Layout.css";

function Layout() {
  return (
    <div className="app-layout">
      <Header />

      <div className="content-wrapper">
        <Sidebar />

        <div className="right-section">
          <main className="main-content">
            <Outlet />
          </main>

        </div>
      </div>
    </div>
  );
}

export default Layout;