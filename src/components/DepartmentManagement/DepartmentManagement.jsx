import React, { useState, useEffect, useContext } from "react";
import "./DepartmentManagement.css";
import Endpoints from "../../api/endpoint";
import { AuthContext } from "../../context/AuthContext";

const DepartmentManagement = () => {

    const { userData } = useContext(AuthContext);

    const [deptOrganizationList, setDeptOrganizationList] = useState([]);

    const [showOrgDropdown, setShowOrgDropdown] = useState(false);

    const [departmentList, setDepartmentList] = useState([]);
    const [loading, setLoading] = useState(false);

    const [currentPage, setCurrentPage] = useState(1);
    const rowsPerPage = 10;

    const [statusFilter, setStatusFilter] = useState("All");

    const [showAddDepartment, setShowAddDepartment] = useState(false);
    const [showEditDepartment, setShowEditDepartment] = useState(false);
    const [searchDepartment, setSearchDepartment] = useState("");

    const [toastMessage, setToastMessage] = useState("");

    const [selectedOrganizations, setSelectedOrganizations] = useState(
    deptOrganizationList.map((org) => org.orgId)
    );

    const initialDeptForm = {
    orgId: "",
    deptName: "",
    deptEmailId: "",
    deptContactNumber: "",
    deptStatus: "active",
    };

    const [editDeptForm, setEditDeptForm] = useState({
    deptId: "",
    orgId: "",
    deptName: "",
    deptEmailId: "",
    deptContactNumber: "",
    deptStatus: "active",
    });

    const [deptForm, setDeptForm] = useState(initialDeptForm);

    //==============To get all Organization list data==================
    const getOrganizationList = async () => {
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
    }
  };
    
  useEffect(() => {
    getOrganizationList();
  }, []);

  //To get all department list data 
  const getDepartmentList = async () => {
     setLoading(true);
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
  } finally {
    setLoading(false);
  }
};

useEffect(() => {
  if (selectedOrganizations.length > 0) {
    getDepartmentList();
  } else {
    setDepartmentList([]);
  }
}, [selectedOrganizations]);

//=================== API to add new department=======================
const saveDepartment = async () => {
  if (
    !deptForm.orgId ||
    !deptForm.deptName ||
    !deptForm.deptEmailId ||
    !deptForm.deptContactNumber
  ) {
    alert("Please fill all mandatory fields.");
    return;
  }

  if (deptForm.deptContactNumber.length !== 10) {
    alert("Mobile Number must be 10 digits.");
    return;
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailRegex.test(deptForm.deptEmailId)) {
    alert("Please enter a valid email address.");
    return;
  }

  try {
    const payload = {
      loggedInUserName: userData.username,
      operation: "addDepartment",
      orgId: deptForm.orgId,
      deptName: deptForm.deptName,
      deptEmailId: deptForm.deptEmailId,
      deptContactNumber: deptForm.deptContactNumber,
      deptStatus: deptForm.deptStatus,
    };

    const response = await Endpoints.post(
      "saveDepartment",
      payload,
      userData.authJwtToken
    );

    if (response.code === 6001) {
      setToastMessage(response.message);

      setTimeout(() => {
        setToastMessage("");
      }, 2000);

      setShowAddDepartment(false);
      setDeptForm(initialDeptForm);

      getDepartmentList(); 
    } else {
      alert(response.message);
    }
  } catch (error) {
    console.error(error);
  }
};

//=================To edit info of a created department====================
const editDepartmentData = async () => {
  if (
    !editDeptForm.orgId ||
    !editDeptForm.deptName ||
    !editDeptForm.deptEmailId ||
    !editDeptForm.deptContactNumber
  ) {
    alert("Please fill all mandatory fields.");
    return;
  }

  if (editDeptForm.deptContactNumber.length !== 10) {
    alert("Mobile Number must be 10 digits.");
    return;
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailRegex.test(editDeptForm.deptEmailId)) {
    alert("Please enter a valid email address.");
    return;
  }

  try {
    const payload = {
      loggedInUserName: userData.username,
      operation: "editOrganisation", // as per your API
      deptId: editDeptForm.deptId,
      orgId: editDeptForm.orgId,
      deptName: editDeptForm.deptName,
      deptEmailId: editDeptForm.deptEmailId,
      deptContactNumber: editDeptForm.deptContactNumber,
      deptStatus: editDeptForm.deptStatus,
    };

    const response = await Endpoints.post(
      "saveDepartment",
      payload,
      userData.authJwtToken
    );

    // Success response:
    // { code:0,result:null,message:null,data:null }

    if (response.code === 0) {
      setToastMessage("Changes Saved");

      setTimeout(() => {
        setToastMessage("");
      }, 2000);

      setShowEditDepartment(false);

      getDepartmentList();
    } else {
      alert(response.message || "Unable to save changes.");
    }
  } catch (error) {
    console.error(error);
  }
};

//Filter Status code
const filteredDepartments = departmentList
  .filter((dept) => {
    const statusMatch =
      statusFilter === "All" ||
      dept.deptStatus.toLowerCase() === statusFilter.toLowerCase();

    const searchMatch =
      dept.deptName
        ?.toLowerCase()
        .includes(searchDepartment.toLowerCase());

    return statusMatch && searchMatch;
  })
  .slice()
  .reverse();

// Pagination Code
const departmentRows = filteredDepartments.length;
const totalPages = Math.ceil(departmentRows / rowsPerPage);

const indexOfLastRow = currentPage * rowsPerPage;
const indexOfFirstRow = indexOfLastRow - rowsPerPage;

const currentDepartments = filteredDepartments.slice(
  indexOfFirstRow,
  indexOfLastRow
);

  return (
    <div className="department-management">
        {toastMessage && (
        <div className="toast-message">
            <i className="fa-solid fa-circle-check"></i>
            {toastMessage}
        </div>
        )}
        <div className="department-management-header">
         <div>
            <h1>Department Management</h1>
            <p>Home / Management Console / Departments</p>
         </div>

           <div className="wrap-add-department-btn">
             <button
                className="add-department-btn"
                onClick={() => setShowAddDepartment(true)}
            >
                <i className="fa-solid fa-plus"></i>
                Add Department
            </button>
            </div>
            {showAddDepartment && (
            <div
                className="drawer-overlay"
                onClick={() => setShowAddDepartment(false)}
            >
                <div
                className="department-drawer"
                onClick={(e) => e.stopPropagation()}
                >
                <div className="drawer-header">
                    <div>
                    <h2>Add Department</h2>
                    <p>Create a new department</p>
                    </div>

                    <button
                    className="close-btn"
                    onClick={() => setShowAddDepartment(false)}
                    >
                    <i className="fa-solid fa-xmark"></i>
                    </button>
                </div>

                <div className="drawer-body">

                    {/* Organization */}
                    <div className="dept-form-group">
                    <label>
                        Organization <span>*</span>
                    </label>

                    <select
                    value={deptForm.orgId}
                    onChange={(e) =>
                        setDeptForm({
                        ...deptForm,
                        orgId: Number(e.target.value),
                        })
                    }
                    >
                    <option value="">Select organization</option>

                    {deptOrganizationList.map((org) => (
                        <option key={org.orgId} value={org.orgId}>
                        {org.orgName}
                        </option>
                    ))}
                    </select>
                    </div>

                    {/* Department Name */}
                    <div className="dept-form-group">
                    <label>
                        Department Name <span>*</span>
                    </label>

                    <input
                        type="text"
                        placeholder="Your Department Name"
                        value={deptForm.deptName}
                        onChange={(e) =>
                            setDeptForm({
                            ...deptForm,
                            deptName: e.target.value,
                            })
                        }
                        />
                    </div>

                    {/* Email */}
                    <div className="dept-form-group">
                    <label>
                        Email ID <span>*</span>
                    </label>

                    <input
                    type="email"
                    placeholder="dept@company.com"
                    value={deptForm.deptEmailId}
                    onChange={(e) =>
                        setDeptForm({
                        ...deptForm,
                        deptEmailId: e.target.value,
                        })
                    }
                    />
                    </div>

                    {/* Mobile */}
                    <div className="dept-form-group">
                    <label>
                        Mobile Number <span>*</span>
                    </label>

                    <div className="phone-input">
                        <span className="country-code">+91</span>
                        <input
                        type="text"
                        placeholder="10-digit number"
                        maxLength={10}
                        value={deptForm.deptContactNumber}
                        onChange={(e) => {
                            const value = e.target.value.replace(/\D/g, "");

                            setDeptForm({
                            ...deptForm,
                            deptContactNumber: value,
                            });
                        }}
                        />
                    </div>
                    </div>

                    {/* Status */}
                    <div className="dept-form-group">
                    <label>Status</label>
                    <select
                    value={deptForm.deptStatus}
                    onChange={(e) =>
                        setDeptForm({
                        ...deptForm,
                        deptStatus: e.target.value,
                        })
                    }
                    >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    </select>
                    </div>
                </div>

                <div className="drawer-footer-org">
                    <button
                    className="cancel-btn"
                    onClick={() => setShowAddDepartment(false)}
                    >
                    Cancel
                    </button>

                    <button
                    className="create-btn"
                    onClick={saveDepartment}
                    >
                    Create Department
                    </button>
                </div>
                </div>
            </div>
            )}
        </div>

      <div className="department-card">
        <div className="department-toolbar">

            <div className="department-toolbar-left">
             <div className="search-box">
              <i className="fa-solid fa-magnifying-glass"></i>

               <input
                    type="text"
                    placeholder="Search Departments..."
                    value={searchDepartment}
                    onChange={(e) => {
                    setSearchDepartment(e.target.value);
                    setCurrentPage(1);
                    }}
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
                    <div className="department-dropdown-menu">

                    <label className="department-option">
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
                        className="department-option"
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

              <select
                value={statusFilter}
                onChange={(e) => {
                    setStatusFilter(e.target.value);
                    setCurrentPage(1);
                }}
                >
                <option value="All">All Status</option>
                <option value="active">Active</option>
                <option value="Inactive">Inactive</option>
                </select>
            </div>

            <span className="count">
                 {departmentRows === 0
                ? 0
                : Math.min(indexOfLastRow, departmentRows)
            }{" "}
            of {departmentRows} organizations
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
        {loading ? (
            <tr>
            <td colSpan="5">
                <div className="table-loader">
                <div className="spinner"></div>
                <p>Loading department data...</p>
                </div>
            </td>
            </tr>
        ) : currentDepartments.length > 0 ? (
            currentDepartments.map((dept) => (
            <tr key={dept.deptId}>
                <td>
                <div className="dept-info">
                    <div className="avatar">
                    {dept.deptName
                        ?.split(" ")
                        .map((word) => word[0])
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

                <td>{dept.orgName}</td>

                <td>{dept.deptContactNumber}</td>

                <td>
                <span className={`status ${dept.deptStatus.toLowerCase()}`}>
                    {dept.deptStatus}
                </span>
                </td>

                <td>
               <button
                className="edit-btn"
                onClick={() => {
                const selectedOrg = deptOrganizationList.find(
                    (org) => org.orgName === dept.orgName
                );

                setEditDeptForm({
                    deptId: dept.deptId,
                    orgId: selectedOrg?.orgId || "",
                    deptName: dept.deptName,
                    deptEmailId: dept.deptEmail,
                    deptContactNumber: dept.deptContactNumber.replace(/^91/, ""),
                    deptStatus: dept.deptStatus.toLowerCase(),
                });

                setShowEditDepartment(true);
                }}
                >
                <i className="fa-regular fa-pen-to-square"></i>
                </button>
                </td>
            </tr>
            ))
        ) : (
            <tr>
             <td colSpan="5">
                <div className="no-department-data">
                <div className="no-data-icon">
                    <i className="fa-solid fa-magnifying-glass"></i>
                </div>

                <h3>No matches found</h3>

                <p>
                    No departments match your search or filters. Try adjusting them.
                </p>
                </div>
            </td>
            </tr>  
        )}
         {showEditDepartment && (
            <div
                className="drawer-overlay"
                onClick={() => setShowEditDepartment(false)}
            >
                <div
                className="department-drawer"
                onClick={(e) => e.stopPropagation()}
                >
                <div className="drawer-header">
                    <div>
                    <h2>Edit Department</h2>
                    <p>{editDeptForm.deptName}</p>
                    </div>

                    <button
                    className="close-btn"
                    onClick={() => setShowEditDepartment(false)}
                    >
                    <i className="fa-solid fa-xmark"></i>
                    </button>
                </div>

                <div className="drawer-body">

                    {/* Organization */}
                    <div className="dept-form-group">
                    <label>
                        Organization <span>*</span>
                    </label>

                    <div className="locked-select">
                        <select value={editDeptForm.orgId} disabled>
                        {deptOrganizationList.map((org) => (
                            <option key={org.orgId} value={org.orgId}>
                            {org.orgName}
                            </option>
                        ))}
                        </select>

                        <i className="fa-solid fa-lock lock-icon"></i>
                    </div>
                    </div>

                    {/* Department Name */}
                    <div className="dept-form-group">
                    <label>
                        Department Name <span>*</span>
                    </label>

                    <input
                        type="text"
                        value={editDeptForm.deptName}
                        onChange={(e) =>
                        setEditDeptForm({
                            ...editDeptForm,
                            deptName: e.target.value,
                        })
                        }
                    />
                    </div>

                    {/* Email */}
                    <div className="dept-form-group">
                    <label>
                        Email ID <span>*</span>
                    </label>

                    <input
                        type="email"
                        value={editDeptForm.deptEmailId}
                        onChange={(e) =>
                        setEditDeptForm({
                            ...editDeptForm,
                            deptEmailId: e.target.value,
                        })
                        }
                    />
                    </div>

                    {/* Mobile */}
                    <div className="dept-form-group">
                    <label>
                        Mobile Number <span>*</span>
                    </label>

                    <div className="phone-input">
                        <span className="country-code">+91</span>

                        <input
                        type="text"
                        maxLength={10}
                        value={editDeptForm.deptContactNumber}
                        onChange={(e) => {
                            const value = e.target.value.replace(/\D/g, "");

                            setEditDeptForm({
                            ...editDeptForm,
                            deptContactNumber: value,
                            });
                        }}
                        />
                    </div>
                    </div>

                    {/* Status */}
                    <div className="dept-form-group">
                    <label>Status</label>

                    <select
                        value={editDeptForm.deptStatus}
                        onChange={(e) =>
                        setEditDeptForm({
                            ...editDeptForm,
                            deptStatus: e.target.value,
                        })
                        }
                    >
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                    </select>
                    </div>

                </div>

                <div className="drawer-footer-org">
                    <button
                    className="cancel-btn"
                    onClick={() => setShowEditDepartment(false)}
                    >
                    Cancel
                    </button>

                    <button className="create-btn" onClick={editDepartmentData}>
                    Save Changes
                    </button>
                </div>
                </div>
            </div>
            )}
        </tbody>
        </table>
        <div className="pagination">
        <span>
            Showing{" "}
            {departmentRows === 0 ? 0 : indexOfFirstRow + 1}
            –
            {Math.min(indexOfLastRow, departmentRows)}
            {" "}of {departmentRows}
        </span>

        <div>

            <button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(currentPage - 1)}
            >
            <i className="fa-solid fa-chevron-left"></i>
            </button>

            {(() => {
            const buttons = [];

            let startPage = Math.max(1, currentPage - 1);
            let endPage = Math.min(totalPages, startPage + 2);

            if (endPage - startPage < 2) {
                startPage = Math.max(1, endPage - 2);
            }

            for (let page = startPage; page <= endPage; page++) {
                buttons.push(
                <button
                    key={page}
                    className={currentPage === page ? "active-page" : ""}
                    onClick={() => setCurrentPage(page)}
                >
                    {page}
                </button>
                );
            }

            if (endPage < totalPages) {
                buttons.push(
                <span key="dots" className="pagination-dots">
                    ...
                </span>
                );

                buttons.push(
                <button
                    key={totalPages}
                    className={currentPage === totalPages ? "active-page" : ""}
                    onClick={() => setCurrentPage(totalPages)}
                >
                    {totalPages}
                </button>
                );
            }

            return buttons;
            })()}

            <button
            disabled={currentPage === totalPages || totalPages === 0}
            onClick={() => setCurrentPage(currentPage + 1)}
            >
            <i className="fa-solid fa-chevron-right"></i>
            </button>

        </div>
        </div>
      </div>
    </div>
  )
}

export default DepartmentManagement
