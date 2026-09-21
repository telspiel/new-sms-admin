import React, { useState, useEffect, useContext } from "react";
import "./GlobalBlacklist.css";
import "@fortawesome/fontawesome-free/css/all.min.css";
import Endpoints from "../../api/endpoint";
import { AuthContext } from "../../context/AuthContext";


const GlobalBlacklist = () => {

    const { userData } = useContext(AuthContext);
    
    const [mobileNumber, setMobileNumber] = useState("");
    const [blacklistData, setBlacklistData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [searched, setSearched] = useState(false);

    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [selectedNumber, setSelectedNumber] = useState(null);
    const [deleteLoading, setDeleteLoading] = useState(false);

    const [showAddDrawer, setShowAddDrawer] = useState(false);
    const [activeTab, setActiveTab] = useState("single");

    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState("");

    const [showEditModal, setShowEditModal] = useState(false);
    const [editNumber, setEditNumber] = useState("");
    const [editDescription, setEditDescription] = useState("");
    const [editLoading, setEditLoading] = useState(false);


    //Add Blacklist number
    const [addMobileNumber, setAddMobileNumber] = useState("");
    const [addDescription, setAddDescription] = useState("");

    const [errors, setErrors] = useState({
        addMobileNumber: "",
        addDescription: "",
        uploadFile: "",
        uploadDescription: "",
    });

    const addBlacklistNumber = async () => {
    let newErrors = {};

    if (!addMobileNumber) {
        newErrors.addMobileNumber = "Mobile number is required.";
    } else if (addMobileNumber.length !== 10) {
        newErrors.addMobileNumber = "Please enter a valid 10-digit mobile number.";
    }

    if (!addDescription.trim()) {
        newErrors.addDescription = "Description is required.";
    }

    if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors);
        return;
    }

    // Clear previous errors if validation passes
    setErrors({});

    try {
        const response = await fetch(Endpoints.get("addBlacklistNumber"), {
        method: "POST",
        headers: {
            Authorization: `${userData.authJwtToken}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            phoneNumber: `91${addMobileNumber}`,
            description: addDescription.trim(),
        }),
        });

        if (!response.ok) {
        throw new Error(`HTTP Error: ${response.status}`);
        }

        const data = await response.text();

        setToastMessage(data);
        setShowToast(true);

        setTimeout(() => {
        setShowToast(false);
        }, 2000);

        // Reset form and close drawer
        setAddMobileNumber("");
        setAddDescription("");
        setErrors({});
        setShowAddDrawer(false);
    } catch (error) {
        console.error(error);
        alert("Failed to add blacklist number.");
    }
    };

    //Upload Blacklist Number
    const [uploadFile, setUploadFile] = useState(null);
    const [uploadDescription, setUploadDescription] = useState("");  
    
    const uploadBlacklist = async () => {
        let newErrors = {};

        if (!uploadFile) {
            newErrors.uploadFile = "Please choose a file to upload.";
        }

        if (!uploadDescription.trim()) {
            newErrors.uploadDescription = "Description is required.";
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        // Clear errors when validation passes
        setErrors({});

        try {
            const fileExtension = uploadFile.name.split(".").pop().toLowerCase();

            const formData = new FormData();
            formData.append("file", uploadFile);

            const response = await fetch(
            `${Endpoints.get(
                "uploadBlacklistNumber"
            )}?fileType=${fileExtension}&uploadDescription=${encodeURIComponent(
                uploadDescription
            )}`,
            {
                method: "POST",
                headers: {
                Authorization: userData.authJwtToken,
                },
                body: formData,
            }
            );

            if (!response.ok) {
            throw new Error(`HTTP Error: ${response.status}`);
            }

            const data = await response.json();

            setToastMessage(`Successfully uploaded ${data.totalNumberSave} numbers`);
            setShowToast(true);

            setTimeout(() => {
            setShowToast(false);
            }, 2000);

            // Reset fields and close drawer
            setUploadFile(null);
            setUploadDescription("");
            setErrors({});
            setShowAddDrawer(false);
        } catch (error) {
            console.error(error);
            alert("Failed to upload blacklist.");
        }
        };

    // search blacklist number api
     const getBlacklistNumber = async () => {
        if (mobileNumber.length !== 10) {
            alert("Please enter a valid 10-digit mobile number.");
            return;
        }

        setLoading(true);
        setSearched(true);

        try {

            const response = await fetch(
            `${Endpoints.get(
                "searchMobileNumber"
            )}?mobileNumber=91${mobileNumber}`,
            {
                method: "GET",
                headers: {
                Authorization: `${userData.authJwtToken}`,
                "Content-Type": "application/json",
                },
            }
            );

            if (!response.ok) {
            throw new Error(`HTTP Error: ${response.status}`);
            }

            const data = await response.json();

            setBlacklistData(data);

        } catch (error) {
            console.error(error);
            setBlacklistData(null);
        } finally {
            setLoading(false);
        }
        };

    //delete blacklist number api
    const deleteBlacklistNumber = async () => {
        setDeleteLoading(true);

        try {
            const response = await fetch(
            `${Endpoints.get(
                "deleteBlacklistNumber"
            )}?mobileNumber=${selectedNumber}`,
            {
                method: "POST",
                headers: {
                Authorization: `${userData.authJwtToken}`,
                "Content-Type": "application/json",
                },
            }
            );

            if (!response.ok) {
            throw new Error(`HTTP Error: ${response.status}`);
            }

            const data = await response.text();

            console.log(data);

            // Remove deleted row
            setBlacklistData(null);

            setShowDeleteModal(false);

            setMobileNumber("");

            setSearched(false);

        } catch (error) {
            console.error("Delete Failed", error);
        } finally {
            setDeleteLoading(false);
        }
        };    

    //=========API to update blacklist number============
    const updateBlacklistNumber = async () => {
    let newErrors = {};

    if (!editNumber) {
        newErrors.editNumber = "Mobile number is required.";
    } else if (editNumber.length !== 10) {
        newErrors.editNumber = "Please enter a valid 10-digit mobile number.";
    }

    if (!editDescription.trim()) {
        newErrors.editDescription = "Description is required.";
    }

    if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors);
        return;
    }

    setErrors({});

    try {
        setEditLoading(true);

        const payload = {
        phoneNumber: `91${editNumber}`,
        description: editDescription.trim(),
        };

        const response = await fetch(
        `${Endpoints.get("editBlacklistNumber")}?mobNum=${selectedNumber}`,
        {
            method: "POST",
            headers: {
            Authorization: `${userData.authJwtToken}`,
            "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
        }
        );

        if (!response.ok) {
        throw new Error(`HTTP Error: ${response.status}`);
        }

        const data = await response.text();

        console.log("Blacklist number updated:", data);

        setBlacklistData((prev) => ({
        ...prev,
        phoneNumber: editNumber,
        description: editDescription,
        }));

        // Reset and close
        setShowEditModal(false);
        setEditNumber("");
        setEditDescription("");
        setErrors({});
    } catch (error) {
        console.error("Update Failed", error);
    } finally {
        setEditLoading(false);
    }
    };    

    const [showDiscardModal, setShowDiscardModal] = useState(false);

    // Triggers when user clicks Cancel, Close (X), or Overlay
    const handleCloseEditDrawer = () => {
        if (editLoading) return;

        // Always show the discard modal on close/cancel action
        setShowDiscardModal(true);
        };

        // Resets form fields and closes the edit drawer
        const resetAndCloseEditDrawer = () => {
        setShowEditModal(false);
        setEditNumber("");
        setEditDescription("");
        setErrors({});
        };

        // Triggered when clicking "Discard" on the discard modal
        const handleConfirmDiscard = () => {
        setShowDiscardModal(false);
        resetAndCloseEditDrawer();
    };


  return (
    <div className="global-blacklist">
        {showToast && (
        <div className="toast-message">
            <i className="fa-regular fa-circle-check"></i>
            <span>{toastMessage}</span>
        </div>
        )}

      {/* Header */}
      <div className="global-blacklist-header">
        <div>
          <h1>Global Blacklist</h1>
          <p>
            Home / Config / Global Blacklist · Numbers that will never receive
            traffic
          </p>
        </div>

        <div className="wrap-add-button">
        <button
            className="add-btn"
            onClick={() => {
            setShowAddDrawer(true);
            setActiveTab("single");
            }}
        >
            <i className="fa-solid fa-plus"></i>
            Add Number
        </button>
        </div>
      </div>

      {/* Main Card */}
      <div className="blacklist-card">

        {/* Search section*/}
        <div className="search-section">
        <div className="search-box">

            <i className="fa-solid fa-magnifying-glass"></i>

            <input
            type="text"
            value={mobileNumber}
            placeholder="Search Number"
            maxLength={10}
            onChange={(e) => {
                const value = e.target.value.replace(/\D/g, "");
                setMobileNumber(value);
            }}
            />

        </div>

        <button
            className="search-btn"
            onClick={getBlacklistNumber}
            disabled={loading}
        >
            {loading ? "Searching..." : "Search"}
        </button>

        {searched && blacklistData && blacklistData.phoneNumber !== null && (
            <div className="match-count">
            1 number matched
            </div>
        )}
        </div>

        <div className="divider"></div>

        {showDeleteModal && (
        <div className="modal-overlay">
            <div className="delete-modal">

            <div className="modal-icon">
                <i className="fa-solid fa-trash"></i>
            </div>

            <h3>Delete Blacklist Number?</h3>

            <p>
                Are you sure you want to delete
                <br />
                <strong>+{selectedNumber}</strong> ?
            </p>

            <div className="blacklist-modal-buttons">

                <button
                className="cancel-btn"
                onClick={() => setShowDeleteModal(false)}
                >
                No
                </button>

                <button
                className="confirm-btn"
                onClick={deleteBlacklistNumber}
                disabled={deleteLoading}
                >
                {deleteLoading ? "Deleting..." : "Yes"}
                </button>

            </div>

            </div>
        </div>
        )}

       {showEditModal && (
        <>
            <div
            className="drawer-overlay"
            onClick={handleCloseEditDrawer}
            ></div>

            <div className="blacklist-add-drawer">
            <div className="drawer-header">
                <div>
                <h2>Edit Number</h2>
                <p>Update the blacklisted number details</p>
                </div>

                <button
                className="close-drawer"
                onClick={handleCloseEditDrawer}
                >
                <i className="fa-solid fa-xmark"></i>
                </button>
            </div>

            <div className="drawer-body">
                {/* Mobile Number Group */}
                <div className="form-group">
                <label>
                    Mobile Number <span>*</span>
                </label>

                <div className="mobile-input">
                    <div className="country-code">+91</div>

                    <input
                    type="text"
                    maxLength={10}
                    placeholder="10-digit mobile number"
                    className={errors.editNumber ? "error-input" : ""}
                    value={editNumber}
                    onChange={(e) => {
                        setEditNumber(e.target.value.replace(/\D/g, ""));
                        if (errors.editNumber) {
                        setErrors((prev) => ({ ...prev, editNumber: "" }));
                        }
                    }}
                    disabled={editLoading}
                    />
                </div>
                {errors.editNumber && (
                    <span className="error-text">
                    ⚠{" "}
                    {errors.editNumber}
                    </span>
                )}
                </div>

                {/* Description Group */}
                <div className="form-group">
                <label>
                    Description <span>*</span>
                </label>

                <input
                    type="text"
                    placeholder="Why is this number blocked?"
                    className={errors.editDescription ? "error-input" : ""}
                    value={editDescription}
                    onChange={(e) => {
                    setEditDescription(e.target.value);
                    if (errors.editDescription) {
                        setErrors((prev) => ({ ...prev, editDescription: "" }));
                    }
                    }}
                    disabled={editLoading}
                />
                {errors.editDescription && (
                    <span className="error-text">
                    ⚠{" "}
                    {errors.editDescription}
                    </span>
                )}
                </div>
            </div>

            <div className="drawer-footer">
                <button
                className="cancel-button"
                onClick={handleCloseEditDrawer}
                disabled={editLoading}
                >
                Cancel
                </button>

                <button
                className="submit-button"
                onClick={updateBlacklistNumber}
                disabled={editLoading}
                >
                {editLoading ? "Updating..." : "Update Number"}
                </button>
            </div>
            </div>
        </>
        )}

        {showDiscardModal && (
        <div className="discard-modal-overlay">
            <div className="discard-modal">
            {/* Header */}
            <div className="discard-modal-header">
                <div className="trash-icon-container">
                <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#e5484d"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                >
                    <path d="M3 6h18" />
                    <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                    <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                </svg>
                </div>
                <h2>Discard changes?</h2>
            </div>

            {/* Content */}
            <div className="discard-modal-body">
                <p>You have unsaved changes. Discard them?</p>
            </div>

            {/* Actions */}
            <div className="discard-modal-footer">
                <button
                className="btn-secondary"
                onClick={() => setShowDiscardModal(false)}
                >
                Cancel
                </button>
                <button className="btn-danger" onClick={handleConfirmDiscard}>
                Discard
                </button>
            </div>
            </div>
        </div>
        )}

        {/* Table */}
        <div className="table-wrapper">
        <table className="blacklist-table">
            {blacklistData && blacklistData.phoneNumber !== null && (
            <thead>
                <tr>
                <th>Phone Number</th>
                <th>Description</th>
                <th>Created Date</th>
                <th>Action</th>
                </tr>
            </thead>
            )}

            <tbody>
            {loading ? (
                <tr>
                <td colSpan="4">
                    <div className="table-loader">
                    <div className="spinner"></div>
                    <p>Loading Blacklist Number...</p>
                    </div>
                </td>
                </tr>
            ) : !searched || !blacklistData ? (
                <tr>
                <td colSpan="4" className="empty-table-blacklist">
                    <div className="empty-state-blacklist">
                    <div className="empty-icon">
                        <i className="fa-solid fa-magnifying-glass"></i>
                    </div>

                    <h2>Search to view blacklisted numbers</h2>

                    <p>
                        The global blacklist can hold millions of numbers, so it isn't
                        <br />
                        loaded by default. Search by phone number or description
                        <br />
                        to view matching entries.
                    </p>
                    </div>
                </td>
                </tr>
            ) : blacklistData.phoneNumber === null ? (
                /* Search executed but no match found */
                <tr>
                <td colSpan="4" className="empty-table-blacklist">
                    <div className="empty-state-blacklist not-found-state">
                    <div className="empty-icon not-found-icon">
                        <i className="fa-solid fa-magnifying-glass"></i>
                    </div>

                    <h2>No matches found</h2>

                    <p>
                        No blacklisted numbers match your search. Try a different
                        <br />
                        number or keyword.
                    </p>
                    </div>
                </td>
                </tr>
            ) : (
                /* Matching Record Found */
                <tr>
                <td>
                    <div className="phone-number-cell">
                    <span className="country-code">+91</span>
                    <span className="phone-number">
                        {blacklistData.phoneNumber
                        ? String(blacklistData.phoneNumber).replace(/^(\+?91)/, "")
                        : ""}
                    </span>
                    </div>
                </td>

                <td>{blacklistData.description}</td>

                <td>{blacklistData.createdDate}</td>

                <td>
                    <div className="blacklist-action-buttons">
                    <button
                        className="action-btn edit-btn"
                        onClick={() => {
                        setSelectedNumber(blacklistData.phoneNumber);
                        setEditNumber(
                            String(blacklistData.phoneNumber).replace(/^(\+?91)/, "")
                        );
                        setEditDescription(blacklistData.description || "");
                        setShowEditModal(true);
                        }}
                    >
                        <i className="fa-regular fa-pen-to-square"></i>
                    </button>

                    <button
                        className="action-btn delete-btn"
                        onClick={() => {
                        setSelectedNumber(blacklistData.phoneNumber);
                        setShowDeleteModal(true);
                        }}
                    >
                        <i className="fa-regular fa-trash-can"></i>
                    </button>
                    </div>
                </td>
                </tr>
            )}
            </tbody>
        </table>
        </div>

        {showAddDrawer && (
        <>
        <div
        className="drawer-overlay"
        onClick={() => setShowAddDrawer(false)}
        ></div>

        <div className="blacklist-add-drawer">

       {/* Header */}

       <div className="drawer-header">

        <div>
          <h2>Add Number</h2>
          <p>Block a number from receiving traffic</p>
        </div>

        <button
          className="close-drawer"
          onClick={() => setShowAddDrawer(false)}
        >
          <i className="fa-solid fa-xmark"></i>
        </button>

      </div>

      {/* Tabs */}

      <div className="drawer-tabs">

        <button
          className={activeTab === "single" ? "active" : ""}
          onClick={() => setActiveTab("single")}
        >
          Single Number
        </button>

        <button
          className={activeTab === "bulk" ? "active" : ""}
          onClick={() => setActiveTab("bulk")}
        >
          Bulk Upload
        </button>

      </div>

      {/* Body */}
      <div className="drawer-body">
        {activeTab === "single" ? (
          <>
            <div className="form-group">
            <label>
                Mobile Number <span>*</span>
            </label>

            <div className="mobile-input">
                <div className="country-code">+91</div>

                <input
                type="text"
                maxLength={10}
                placeholder="10-digit mobile number"
                className={errors.addMobileNumber ? "error-input" : ""}
                value={addMobileNumber}
                onChange={(e) => {
                    setAddMobileNumber(e.target.value.replace(/\D/g, ""));
                    if (errors.addMobileNumber) {
                    setErrors((prev) => ({ ...prev, addMobileNumber: "" }));
                    }
                }}
                />
            </div>
            {errors.addMobileNumber && (
                <span className="error-text">
                ⚠{" "}
                {errors.addMobileNumber}
                </span>
            )}
            </div>

            <div className="form-group">
            <label>
                Description <span>*</span>
            </label>

            <input
                type="text"
                placeholder="Why is this number blocked?"
                className={errors.addDescription ? "error-input" : ""}
                value={addDescription}
                onChange={(e) => {
                setAddDescription(e.target.value);
                if (errors.addDescription) {
                    setErrors((prev) => ({ ...prev, addDescription: "" }));
                }
                }}
            />
            {errors.addDescription && (
                <span className="error-text">
                ⚠{" "}
                {errors.addDescription}
                </span>
            )}
            </div>
          </>

        ) : (

          <>
            <div className="form-group">
            <label>
                Upload File <span>*</span>
            </label>

            <div className={`global-upload-box ${errors.uploadFile ? "error-upload-box" : ""}`}>
                <input
                type="file"
                accept=".txt,.csv,.xlsx"
                onChange={(e) => {
                    setUploadFile(e.target.files[0]);
                    if (errors.uploadFile) {
                    setErrors((prev) => ({ ...prev, uploadFile: "" }));
                    }
                }}
                />
                <p>
                Only .txt, .csv or .xlsx files are allowed · max 50,000 numbers per file
                </p>
            </div>
            
            {errors.uploadFile && (
                <span className="error-text">
                ⚠{" "}
                {errors.uploadFile}
                </span>
            )}
            </div>

            {/* Description Group */}
            <div className="form-group">
            <label>
                Description <span>*</span>
                <small> (applied to every number in the file)</small>
            </label>

            <input
                type="text"
                placeholder="e.g. Uploaded do-not-disturb list"
                className={errors.uploadDescription ? "error-input" : ""}
                value={uploadDescription}
                onChange={(e) => {
                setUploadDescription(e.target.value);
                if (errors.uploadDescription) {
                    setErrors((prev) => ({ ...prev, uploadDescription: "" }));
                }
                }}
            />
            {errors.uploadDescription && (
                <span className="error-text">
                ⚠{" "}
                {errors.uploadDescription}
                </span>
            )}
            </div>
          </>

        )}

      </div>


      <div className="drawer-footer">
        <button
            className="cancel-button"
            onClick={() => setShowAddDrawer(false)}
        >
            Cancel
        </button>

        {activeTab === "single" ? (
            <button
            className="submit-button"
            onClick={addBlacklistNumber}
            >
            Add to Blacklist
            </button>
        ) : (
            <button
            className="submit-button"
            onClick={uploadBlacklist}
            >
            Upload Blacklist
            </button>
        )}
        </div>

        </div>
       </>
      )}

        </div>

    </div>
  );
};

export default GlobalBlacklist
