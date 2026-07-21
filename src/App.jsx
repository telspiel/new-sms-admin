import { BrowserRouter, Routes, Route } from "react-router-dom";

import Login from "./pages/Login/Login";

import Layout from "./components/Layout/Layout";

import Dashboard from "./components/Dashboard/Dashboard";
import OrganizationManagement from "./components/OrganizationManagement/OrganizationManagement";
import DepartmentManagement from "./components/DepartmentManagement/DepartmentManagement";
import ExternalUsers from "./components/ExternalUsers/ExternalUsers";
import InternalUsers from "./components/InternalUsers/InternalUsers";
import CreditsManagement from "./components/CreditsManagement/CreditsManagement";
import GenerateApiKey from "./components/GenerateApiKey/GenerateApiKey";
import DRSummary from "./components/DRSummary/DRSummary";
import ManageConnect from "./components/ManageConnect/ManageConnect";
import OperatorTraffic from "./components/OperatorTraffic/OperatorTraffic";
import GlobalBlacklist from "./components/GlobalBlacklist/GlobalBlacklist";
import UserPremiumRouting from "./components/UserPremiumRouting/UserPremiumRouting";

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
            path="/dr-summary"
            element={<DRSummary />}
          />

          <Route
            path="/manage-connect"
            element={<ManageConnect />}
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

        </Route>

      </Routes>
    </BrowserRouter>
  );
}

export default App;