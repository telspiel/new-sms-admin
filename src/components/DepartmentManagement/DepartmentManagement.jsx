import React, { useState, useEffect, useContext } from "react";
import "./DepartmentManagement.css";
import Endpoints from "../../api/endpoint";
import { AuthContext } from "../../context/AuthContext";

const DepartmentManagement = () => {

    const { userData } = useContext(AuthContext);

    const [deptOrganizationList, setDeptOrganizationList] = useState([]);
    const [loading, setLoading] = useState(false);

    const [showOrgDropdown, setShowOrgDropdown] = useState(false);

    const [departmentList, setDepartmentList] = useState([]);

    const [selectedOrganizations, setSelectedOrganizations] = useState(
    deptOrganizationList.map((org) => org.orgId)
    );

    //==============To get all Organization list data==================
    const getOrganizationList = async () => {
        setLoading(true);
    try {
    const payload = {
        loggedInUserName: userData.username,
    };

    const response = await Endpoints.post(
        "getAllOrganization",
        payload,
        userData.authJwtToken
    );

    if (response.code === 11000) {
    const orgs = response.data.organisationList || [];

    setDeptOrganizationList(orgs);

    // Select all by default
    setSelectedOrganizations(orgs.map((org) => org.orgId));
    } else {
        alert(response.message);
    }
    } catch (error) {
    console.error(error);
    } finally {
    setLoading(false);
    }
  };
    
  useEffect(() => {
    getOrganizationList();
  }, []);

  //To get all department list data 
  const getDepartmentList = async () => {
  try {
    const payload = {
      loggedInUserName: userData.username,
      orgId: selectedOrganizations,
    };

    const response = await Endpoints.post(
      "getAlldepartment",
      payload,
      userData.authJwtToken
    );

    if (response.code === 4003) {
      setDepartmentList(response.data.departmentList || []);
    } else {
      alert(response.message || "Unable to fetch departments.");
    }
  } catch (error) {
    console.error(error);
  }
};

useEffect(() => {
  if (selectedOrganizations.length > 0) {
    getDepartmentList();
  } else {
    setDepartmentList([]);
  }
}, [selectedOrganizations]);

  return (
    <div className="department-management">
        <div className="department-management-header">
         <div>
            <h1>Department Management</h1>
            <p>Home / Management Console / Departments</p>
         </div>

           <div className="wrap-add-department-btn">
            <button
                className="add-department-btn"
                onClick={() => setShowAddOrg(true)}
            >
                <i className="fa-solid fa-plus"></i>
                Add Department
            </button>
        </div>
      </div>

      <div className="department-card">
        <div className="department-toolbar">

            <div className="department-toolbar-left">
             <div className="search-box">
              <i className="fa-solid fa-magnifying-glass"></i>

              <input
                type="text"
                placeholder="Search Departments..."
              />
             </div>

              <div className="org-dropdown">
                <div
                    className="org-dropdown-header"
                    onClick={() => setShowOrgDropdown(!showOrgDropdown)}
                >
                    {selectedOrganizations.length === deptOrganizationList.length
                    ? "All Organizations"
                    : `${selectedOrganizations.length} Selected`}

                    <i className="fa-solid fa-chevron-down"></i>
                </div>

                {showOrgDropdown && (
                    <div className="org-dropdown-menu">

                    <label className="org-option">
                        <input
                        type="checkbox"
                        checked={
                            selectedOrganizations.length ===
                            deptOrganizationList.length
                        }
                        onChange={(e) => {
                            if (e.target.checked) {
                            setSelectedOrganizations(
                                deptOrganizationList.map((org) => org.orgId)
                            );
                            } else {
                            setSelectedOrganizations([]);
                            }
                        }}
                        />

                        All Organizations
                    </label>

                    {/* Organization List */}

                    {deptOrganizationList.map((org) => (
                        <label
                        key={org.orgId}
                        className="org-option"
                        >
                        <input
                            type="checkbox"
                            checked={selectedOrganizations.includes(org.orgId)}
                            onChange={(e) => {

                            if (e.target.checked) {

                                setSelectedOrganizations([
                                ...selectedOrganizations,
                                org.orgId,
                                ]);

                            } else {

                                setSelectedOrganizations(
                                selectedOrganizations.filter(
                                    (id) => id !== org.orgId
                                )
                                );

                            }

                            }}
                        />

                        {org.orgName}
                        </label>
                    ))}

                    </div>
                )}

                </div>

              <select>
                <option value="All">All Statuses</option>
                <option value="prepaid">Prepaid</option>
                <option value="postpaid">Postpaid</option>
              </select>
            </div>

            <span className="count">
                8 of 8 Departments
           </span>
        </div>

        <table className='department-data-table'>

            <thead>
                <tr>
                <th>Department</th>
                <th>Organization</th>
                <th>Mobile</th>
                <th>Status</th>
                <th>Actions</th>
                </tr>
          </thead>

        <tbody>
        {departmentList.length > 0 ? (
            departmentList.map((dept) => (
            <tr key={dept.deptId}>

                <td>
                <div className="dept-info">
                    <div className="avatar">
                    {dept.deptName
                        ?.split(" ")
                        .map(word => word[0])
                        .join("")
                        .substring(0, 2)
                        .toUpperCase()}
                    </div>

                    <div>
                    <h4>{dept.deptName}</h4>
                    <p>{dept.deptEmail}</p>
                    </div>
                </div>
                </td>

                <td>
                {/* Replace this with orgName if your API returns it */}
                -
                </td>

                <td>{dept.deptContactNumber}</td>

                <td>
                <span className={`status ${dept.deptStatus.toLowerCase()}`}>
                    {dept.deptStatus}
                </span>
                </td>

                <td>
                <button className="edit-btn">
                    <i className="fa-regular fa-pen-to-square"></i>
                </button>
                </td>

            </tr>
            ))
        ) : (
            <tr>
            <td colSpan="5" className="no-data">
                No departments found.
            </td>
            </tr>
        )}
        </tbody>
        </table>
      </div>
    </div>
  )
}

export default DepartmentManagement
