import { useState } from "react";
import { Outlet } from "react-router-dom";
import Header from "../../pages/Header/Header";
import Sidebar from "../../pages/Sidebar/Sidebar";
import "./Layout.css";

function Layout() {

  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const toggleSidebar = () => {
    setIsSidebarOpen((prev) => !prev);
  };
  return (
    <div className="app-layout">
      <Header toggleSidebar={toggleSidebar} isSidebarOpen={isSidebarOpen}/>

      <div className="content-wrapper">
        <Sidebar isOpen={isSidebarOpen} />

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