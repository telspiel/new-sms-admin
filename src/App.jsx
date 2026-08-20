import { BrowserRouter, Routes, Route } from "react-router-dom";

import Login from "./pages/Login/Login";

import Layout from "./components/Layout/Layout";

import Profile from "./components/Profile/Profile";
import CreditNotifications from "./components/CreditNotifications/CreditNotifications";
import ChangePassword from "./components/ChangePassword/ChangePassword";
import Dashboard from "./components/Dashboard/Dashboard";
import OrganizationManagement from "./components/OrganizationManagement/OrganizationManagement";
import DepartmentManagement from "./components/DepartmentManagement/DepartmentManagement";
import ExternalUsers from "./components/ExternalUsers/ExternalUsers";
import InternalUsers from "./components/InternalUsers/InternalUsers";
import CreditsManagement from "./components/CreditsManagement/CreditsManagement";
import GenerateApiKey from "./components/GenerateApiKey/GenerateApiKey";
import DetailedMis from "./components/DetailedMis/DetailedMis";
import SummaryReport from "./components/SummaryReport/SummaryReport";
import ErrorCodeReport from "./components/ErrorCodeReport/ErrorCodeReport";
import DownloadReport from "./components/DownloadReport/DownloadReport";
import DRSummary from "./components/DRSummary/DRSummary";
import ManageConnect from "./components/ManageConnect/ManageConnect";
import NewUserRouting from "./components/NewUserRouting/NewUserRouting";
import SwitchGateway from "./components/SwitchGateway/SwitchGateway";
import UserwiseRouting from "./components/UserwiseRouting/UserwiseRouting";
import SmppManagement from "./components/SmppManagement/SmppManagement";
import OperatorTraffic from "./components/OperatorTraffic/OperatorTraffic";
import GlobalBlacklist from "./components/GlobalBlacklist/GlobalBlacklist";
import UserPremiumRouting from "./components/UserPremiumRouting/UserPremiumRouting";
import AppearanceBranding from "./components/AppearanceBranding/AppearanceBranding";

function App() {

  const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem("authJwtToken");

  return token ? children : <Navigate to="/" replace />;
};

  return (
    <BrowserRouter>
      <Routes>

        <Route path="/" element={<Login />} />

        <Route element={<Layout />}>

          <Route
            path="/my-profile"
            element={<Profile />}
          />

          <Route
            path="/credit-notifications"
            element={<CreditNotifications />}
          />

          <Route
            path="/change-password"
            element={<ChangePassword />}
          />

          <Route
            path="/dashboard"
            element={<Dashboard />}
          />

          <Route
            path="/organization-management"
            element={<OrganizationManagement />}
          />

          <Route
            path="/department-management"
            element={<DepartmentManagement />}
          />

          <Route
            path="/external-users"
            element={<ExternalUsers />}
          />

          <Route
            path="/internal-users"
            element={<InternalUsers />}
          />

          <Route
            path="/credits-management"
            element={<CreditsManagement />}
          />

          <Route
            path="/generate-api-key"
            element={<GenerateApiKey />}
          />

          <Route
            path="/detailed-mis"
            element={<DetailedMis />}
          />

          <Route
            path="/summary-report"
            element={<SummaryReport />}
          />

          <Route
            path="/error-code-report"
            element={<ErrorCodeReport />}
          />

          <Route
            path="/download-report"
            element={<DownloadReport />}
          />

          <Route
            path="/dr-summary"
            element={<DRSummary />}
          />

          <Route
            path="/manage-connect"
            element={<ManageConnect />}
          />

          <Route
            path="/new-user-routing"
            element={<NewUserRouting />}
          />


          <Route
            path="/switch-gateway"
            element={<SwitchGateway />}
          />

          <Route
            path="/userwise-routing"
            element={<UserwiseRouting />}
          />

          <Route
            path="/smpp-session-management"
            element={<SmppManagement />}
          />

          <Route
            path="/operator-traffic"
            element={<OperatorTraffic />}
          />

          <Route
            path="/global-blacklist"
            element={<GlobalBlacklist />}
          />

          <Route
            path="/user-premium-routing"
            element={<UserPremiumRouting />}
          />

          <Route
            path="/appearance-branding"
            element={<AppearanceBranding />}
          />

        </Route>

      </Routes>
    </BrowserRouter>
  );
}

export default App;