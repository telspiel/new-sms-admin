import React, { useState, useEffect, useContext } from "react";
import "./OrganizationManagement.css";
import Endpoints from "../../api/endpoint";
import { AuthContext } from "../../context/AuthContext";

const OrganizationManagement = () => {

    const { userData } = useContext(AuthContext);

    const [showAddOrg, setShowAddOrg] = useState(false);
    const [showEditOrg, setShowEditOrg] = useState(false);
    const [selectedOrg, setSelectedOrg] = useState(null);

    const [organizationList, setOrganizationList] = useState([]);

    const [currentPage, setCurrentPage] = useState(1);
    const rowsPerPage = 10;

    const [statusFilter, setStatusFilter] = useState("All");
    const [billingFilter, setBillingFilter] = useState("All");
    const [loading, setLoading] = useState(false);
    const [toastMessage, setToastMessage] = useState("");

    const [searchOrgName, setSearchOrgName] = useState("");


    //Filter data based on table
    const filteredOrganizations = organizationList
    .filter((org) => {
        const searchMatch =
        org.orgName
            ?.toLowerCase()
            .includes(searchOrgName.toLowerCase());

        const statusMatch =
        statusFilter === "All" || org.orgStatus === statusFilter;

        const billingMatch =
        billingFilter === "All" || org.orgBillingType === billingFilter;

        return searchMatch && statusMatch && billingMatch;
    })
    .slice()
    .reverse();

    //Pagination structure
    const totalRows = filteredOrganizations.length;
    const totalPages = Math.ceil(totalRows / rowsPerPage);

    const indexOfLastRow = currentPage * rowsPerPage;
    const indexOfFirstRow = indexOfLastRow - rowsPerPage;

    const currentOrganizations = filteredOrganizations.slice(
    indexOfFirstRow,
    indexOfLastRow
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
      setOrganizationList(response.data.organisationList || []);
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

const initialOrgForm = {
  orgName: "",
  orgEmailId: "",
  orgContactNumber: "",
  orgPrimaryContact: "",
  orgGstNumber: "",
  orgBillingCycle: "monthly",
  orgBillingType: "prepaid",
  orgStatus: "active",
  orgAddress: "",
};

const [orgForm, setOrgForm] = useState(initialOrgForm);
const [editOrgForm, setEditOrgForm] = useState(initialOrgForm);

//===========Add new organization API=================
const saveOrganization = async () => {

    if (
        !orgForm.orgName ||
        !orgForm.orgEmailId ||
        !orgForm.orgContactNumber ||
        !orgForm.orgPrimaryContact ||
        !orgForm.orgAddress
    ) {
        alert("Please fill all mandatory fields.");
        return;
    }

    if (orgForm.orgGstNumber.length < 12) {
        alert("GST Number must be at least 12 characters.");
        return;
    }

    if (orgForm.orgContactNumber.length !== 10) {
    alert("Phone Number must be 10 digits.");
    return;
    }

    if (orgForm.orgPrimaryContact.length !== 10) {
    alert("Primary Contact Number must be 10 digits.");
    return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(orgForm.orgEmailId)) {
    alert("Please enter a valid email address.");
    return;
    }

    try {
        const payload = {
            loggedInUserName: userData.username,
            operation: "addOrganisation",
            ...orgForm,
            orgContactNumber: `91${orgForm.orgContactNumber}`,
            orgPrimaryContact: `91${orgForm.orgPrimaryContact}`,
        };
        const response = await Endpoints.post(
            "saveOrganization",
            payload,
            userData.authJwtToken
        );
        if (response.code === 5001) {
            setToastMessage(response.message);
            setTimeout(() => {
                setToastMessage("");
            }, 2000);

            setShowAddOrg(false);
            setOrgForm(initialOrgForm);
            getOrganizationList();

        } else {
            alert(response.message);
        }

    } catch (error) {
        console.error(error);
    }
};

//=============Edit existing org name API====================
const editOrganization = async () => {

    if (
        !editOrgForm.orgName ||
        !editOrgForm.orgEmailId ||
        !editOrgForm.orgContactNumber ||
        !editOrgForm.orgPrimaryContact ||
        !editOrgForm.orgAddress
    ) {
        alert("Please fill all mandatory fields.");
        return;
    }

    if (editOrgForm.orgGstNumber.length < 12) {
        alert("GST Number must be at least 12 characters.");
        return;
    }

    if (editOrgForm.orgContactNumber.length !== 10) {
        alert("Phone Number must be 10 digits.");
        return;
    }

    if (editOrgForm.orgPrimaryContact.length !== 10) {
        alert("Primary Contact Number must be 10 digits.");
        return;
    }

    const emailRegex=/^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if(!emailRegex.test(editOrgForm.orgEmailId)){
        alert("Please enter a valid email address.");
        return;
    }

    try{

        const payload={

            loggedInUserName:userData.username,

            operation:"editOrganisation",

            orgId:editOrgForm.orgId,

            ...editOrgForm,

            orgContactNumber:`91${editOrgForm.orgContactNumber}`,

            orgPrimaryContact:`91${editOrgForm.orgPrimaryContact}`,

        };

        const response=await Endpoints.post(
            "saveOrganization",
            payload,
            userData.authJwtToken
        );

        if(response.code===5001){

            setToastMessage(response.message);

            setTimeout(()=>{
                setToastMessage("");
            },2000);

            setShowEditOrg(false);

            getOrganizationList();

        }else{
            alert(response.message);
        }

    }catch(error){
        console.error(error);
    }

};

  return (
     <div className="org-management">
        {toastMessage && (
        <div className="toast-message">
            <i className="fa-solid fa-circle-check"></i>
            {toastMessage}
        </div>
        )}
      <div className="org-management-header">
        <div>
          <h1>Organization Management</h1>
          <p>Home / Management Console / Organizations</p>
        </div>

        <div className="wrap-add-org-btn">
        <button
            className="add-org-btn"
            onClick={() => setShowAddOrg(true)}
        >
            <i className="fa-solid fa-plus"></i>
            Add Organization
        </button>
        </div>

        {showAddOrg && (
        <div
            className="drawer-overlay"
            onClick={() => setShowAddOrg(false)}
        >
            <div
            className="organization-drawer"
            onClick={(e) => e.stopPropagation()}
            >
            <div className="drawer-header">
              <div>
                <h2>Add Organization</h2>
                <p>Create a new organization</p>
              </div>

              <button
                className="close-btn"
                onClick={() => setShowAddOrg(false)}
              >
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>

            <div className="drawer-body">

            <div className="org-form-group">
                <label>
                Organization Name <span>*</span>
                </label>
                <input
                type="text"
                placeholder="Org name"
                value={orgForm.orgName}
                onChange={(e) =>
                    setOrgForm({ ...orgForm, orgName: e.target.value })
                }
            />
            </div>

            <div className="org-form-row">
                <div className="org-form-group">
                <label>
                    Email ID <span>*</span>
                </label>
                <input
                    type="email"
                    placeholder="name@company.com"
                    value={orgForm.orgEmailId}
                    onChange={(e) =>
                    setOrgForm({
                        ...orgForm,
                        orgEmailId: e.target.value,
                    })
                    }
                    required
                />
                </div>

                <div className="org-form-group">
            <label>
                Phone Number <span>*</span>
            </label>

            <div className="phone-input">
                <span className="country-code">+91</span>

                <input
                type="text"
                placeholder="9876543210"
                maxLength={10}
                value={orgForm.orgContactNumber}
                onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, "");
                    setOrgForm({
                    ...orgForm,
                    orgContactNumber: value,
                    });
                }}
                />
            </div>
            </div>
            </div>

            <div className="org-form-row">
               <div className="org-form-group">
                <label>
                    Primary Contact Number <span>*</span>
                </label>

                <div className="phone-input">
                    <span className="country-code">+91</span>

                    <input
                    type="text"
                    placeholder="9876543210"
                    maxLength={10}
                    value={orgForm.orgPrimaryContact}
                    onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, "");
                        setOrgForm({
                        ...orgForm,
                        orgPrimaryContact: value,
                        });
                    }}
                    />
                </div>
                </div>

                <div className="org-form-group">
                <label>GST Number</label>
               <input
                    type="text"
                    placeholder="GST Number"
                    value={orgForm.orgGstNumber}
                    onChange={(e) =>
                        setOrgForm({
                            ...orgForm,
                            orgGstNumber: e.target.value,
                        })
                    }
                />
                </div>
            </div>

            <div className="org-form-row">
                <div className="org-form-group">
                <label>Billing Cycle</label>

                <select
                    value={orgForm.orgBillingCycle}
                    onChange={(e) =>
                        setOrgForm({
                            ...orgForm,
                            orgBillingCycle: e.target.value,
                        })
                    }
                >
                    <option value="monthly">Monthly</option>
                    <option value="quarterly">Quarterly</option>
                    <option value="yearly">Yearly</option>
                </select>
                </div>

                <div className="org-form-group">
                <label>Billing Type</label>

                <select
                    value={orgForm.orgBillingType}
                    onChange={(e) =>
                        setOrgForm({
                            ...orgForm,
                            orgBillingType: e.target.value,
                        })
                    }
                >
                    <option value="prepaid">PREPAID</option>
                    <option value="postpaid">POSTPAID</option>
                </select>
                </div>
            </div>

            <div className="org-form-row">
                <div className="org-form-group">
                <label>Status</label>

                <select
                    value={orgForm.orgStatus}
                    onChange={(e) =>
                        setOrgForm({
                            ...orgForm,
                            orgStatus: e.target.value,
                        })
                    }
                >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                </select>
                </div>
            </div>

            <div className="org-form-group">
                <label>Address</label>

                <textarea
                    rows="5"
                    placeholder="Organization address"
                    value={orgForm.orgAddress}
                    onChange={(e) =>
                        setOrgForm({
                            ...orgForm,
                            orgAddress: e.target.value,
                        })
                    }
                />
            </div>

            </div>

            <div className="drawer-footer-org">
              <button
                className="cancel-btn"
                onClick={() => setShowAddOrg(false)}
              >
                Cancel
              </button>

              <button
                className="create-btn"
                onClick={saveOrganization}
            >
                Create Organization
            </button>
            </div>

          </div>
        </div>
      )}
      </div>

      <div className="org-card">
        <div className="org-toolbar">
          <div className="org-toolbar-left">

            <div className="search-box">
            <i className="fa-solid fa-magnifying-glass"></i>

            <input
                type="text"
                placeholder="Search organizations..."
                value={searchOrgName}
                onChange={(e) => {
                setSearchOrgName(e.target.value);
                setCurrentPage(1); // Optional: go back to first page while searching
                }}
            />
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

            <select
            value={billingFilter}
            onChange={(e) => {
                setBillingFilter(e.target.value);
                setCurrentPage(1);
            }}
            >
            <option value="All">All Billing</option>
            <option value="prepaid">Prepaid</option>
            <option value="postpaid">Postpaid</option>
            </select>

          </div>

         <span className="count">
            {totalRows === 0
                ? 0
                : Math.min(indexOfLastRow, totalRows)
            }{" "}
            of {totalRows} organizations
          </span>

        </div>

        <table className='org-data-table'>

          <thead>
            <tr>
              <th>ORGANIZATION</th>
              <th>CONTACT</th>
              <th>BILLING</th>
              <th>STATUS</th>
              <th>ACTIONS</th>
            </tr>
          </thead>

          <tbody>

            {loading ? (
                <tr>
                <td colSpan="5">
                    <div className="table-loader">
                    <div className="spinner"></div>
                    <p>Loading organization data...</p>
                    </div>
                </td>
                </tr>
            ) : currentOrganizations.length > 0 ? (
                currentOrganizations.map((org, index) => (
                <tr key={index}>

                    <td>
                    <div className="org-info">
                        <div className="avatar">
                        {org.orgName
                            ?.split(" ")
                            .map(word => word[0])
                            .join("")
                            .substring(0, 2)
                            .toUpperCase()}
                        </div>

                        <div>
                        <h4>{org.orgName}</h4>
                        <p>
                            {org.orgGstNumber || "No GST"} · {org.orgAddress}
                        </p>
                        </div>
                    </div>
                    </td>

                    <td>
                    <h4>{org.orgEmailId}</h4>
                    <p>{org.orgContactNumber}</p>
                    </td>

                    <td>
                    <span
                        className={`billing ${org.orgBillingType.toLowerCase()}`}
                    >
                        {org.orgBillingType.toUpperCase()}
                    </span>

                    <p>{org.orgBillingCycle}</p>
                    </td>

                    <td>
                    <span
                        className={`status ${org.orgStatus.toLowerCase()}`}
                    >
                        {org.orgStatus}
                    </span>
                    </td>

                    <td>
                    <button
                        className="edit-btn"
                        onClick={() => {
                        setSelectedOrg(org);

                        setEditOrgForm({
                            orgId: org.orgId,
                            orgName: org.orgName,
                            orgEmailId: org.orgEmailId,
                            orgContactNumber: org.orgContactNumber.replace(/^91/, ""),
                            orgPrimaryContact: org.orgPrimaryContact.replace(/^91/, ""),
                            orgGstNumber: org.orgGstNumber || "",
                            orgBillingCycle: org.orgBillingCycle,
                            orgBillingType: org.orgBillingType,
                            orgStatus: org.orgStatus.toLowerCase(),
                            orgAddress: org.orgAddress,
                        });

                        setShowEditOrg(true);
                    }}
                    >
                        <i className="fa-regular fa-pen-to-square"></i>
                    </button>
                    </td>

                </tr>
                ))
            ) : (
                <tr>
                <td colSpan="5" className="no-org-data">
                    <p>
                    No organizations found.
                    </p>
                </td>
                </tr>
            )}
            {showEditOrg && selectedOrg && (
            <div
                className="drawer-overlay"
                onClick={() => setShowEditOrg(false)}
            >
                <div
                className="organization-drawer"
                onClick={(e) => e.stopPropagation()}
                >
                <div className="drawer-header">
                    <div>
                    <h2>Edit Organization</h2>
                    <p>{selectedOrg.orgName}</p>
                    </div>

                    <button
                    className="close-btn"
                    onClick={() => setShowEditOrg(false)}
                    >
                    <i className="fa-solid fa-xmark"></i>
                    </button>
                </div>

                <div className="drawer-body">

                    <div className="org-form-group">
                    <label>
                        Organization Name <span>*</span>
                    </label>
                    <input
                        type="text"
                        value={editOrgForm.orgName}
                        disabled
                        onChange={(e)=>
                            setEditOrgForm({
                                ...editOrgForm,
                                orgName:e.target.value
                            })
                        }
                    />
                    </div>

                    <div className="org-form-row">

                    <div className="org-form-group">
                        <label>
                        Email ID <span>*</span>
                        </label>
                        <input
                        type="email"
                       value={editOrgForm.orgEmailId}
                        onChange={(e)=>
                        setEditOrgForm({
                            ...editOrgForm,
                            orgEmailId:e.target.value
                        })
                        }
                        />
                    </div>

                    <div className="org-form-group">
                        <label>
                        Phone Number <span>*</span>
                        </label>
                        <input
                        type="text"
                        value={editOrgForm.orgContactNumber}
                        onChange={(e)=>{
                        const value=e.target.value.replace(/\D/g,"");
                        setEditOrgForm({
                            ...editOrgForm,
                            orgContactNumber:value
                        });
                        }}
                        />
                    </div>

                    </div>

                    <div className="org-form-row">

                    <div className="org-form-group">
                    <label>
                        Primary Contact Number <span>*</span>
                    </label>

                    <input
                        type="text"
                        value={editOrgForm.orgPrimaryContact}
                        onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, "");
                        setEditOrgForm({
                            ...editOrgForm,
                            orgPrimaryContact: value,
                        });
                        }}
                    />
                    </div>

                    <div className="org-form-group">
                    <label>GST Number</label>

                    <input
                        type="text"
                        value={editOrgForm.orgGstNumber}
                        onChange={(e) =>
                        setEditOrgForm({
                            ...editOrgForm,
                            orgGstNumber: e.target.value,
                        })
                        }
                    />
                    </div>

                    </div>

                    <div className="org-form-row">

                    <div className="org-form-group">
                    <label>Billing Cycle</label>

                    <select
                        value={editOrgForm.orgBillingCycle}
                        onChange={(e) =>
                        setEditOrgForm({
                            ...editOrgForm,
                            orgBillingCycle: e.target.value,
                        })
                        }
                    >
                        <option value="monthly">Monthly</option>
                        <option value="quarterly">Quarterly</option>
                        <option value="yearly">Yearly</option>
                        <option value="NA">NA</option>
                    </select>
                    </div>

                    <div className="org-form-group">
                    <label>Billing Type</label>

                    <select
                        value={editOrgForm.orgBillingType}
                        onChange={(e) =>
                        setEditOrgForm({
                            ...editOrgForm,
                            orgBillingType: e.target.value,
                        })
                        }
                    >
                        <option value="prepaid">PREPAID</option>
                        <option value="postpaid">POSTPAID</option>
                    </select>
                    </div>

                    </div>

                    <div className="org-form-row">

                    <div className="org-form-group">
                    <label>Status</label>

                    <select
                        value={editOrgForm.orgStatus}
                        onChange={(e) =>
                        setEditOrgForm({
                            ...editOrgForm,
                            orgStatus: e.target.value,
                        })
                        }
                    >
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                    </select>
                    </div>

                    </div>

                   <div className="org-form-group">
                    <label>Address</label>

                    <textarea
                        rows="5"
                        value={editOrgForm.orgAddress}
                        onChange={(e) =>
                        setEditOrgForm({
                            ...editOrgForm,
                            orgAddress: e.target.value,
                        })
                        }
                    />
                    </div>

                </div>

                <div className="drawer-footer-org">

                    <button
                    className="cancel-btn"
                    onClick={() => setShowEditOrg(false)}
                    >
                    Cancel
                    </button>

                    <button
                    className="create-btn"
                    onClick={editOrganization}
                >
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
                {totalRows === 0
                ? 0
                : indexOfFirstRow + 1}
                –
                {Math.min(indexOfLastRow, totalRows)}
                {" "}of {totalRows}
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

            // Always show 3 page numbers when possible
            if (endPage - startPage < 2) {
                startPage = Math.max(1, endPage - 2);
            }

            // Page buttons
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

            // Show dots + last page
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

export default OrganizationManagement
