import { useState, useEffect, useContext } from "react";
import { AuthContext } from "../../context/AuthContext";
import Endpoints from "../../api/endpoint";
import "./GenerateApiKey.css";
import Select from "react-select";

const GenerateApiKey = () => {

const { userData } = useContext(AuthContext);

const [selectedClient, setSelectedClient] = useState(null);
const [apiKey, setApiKey] = useState(null);

const [showApiKey, setShowApiKey] = useState(true);

const [showRegenerateModal, setShowRegenerateModal] = useState(false);

const [toastMessage, setToastMessage] = useState("");

const [userLists, setUserLists] = useState({
    clientList: [],
});

const toOptions = (list = []) =>
  list.map((item) => ({
    label: item,
    value: item,
  }));


// ================Get all users data API=========================
const getUserLists = async () => {
    try {
    const payload = {
        loggedInUserName: userData.username,
    };

    const response = await Endpoints.post(
        "getAllUsers",
        payload,
        userData.authJwtToken
    );

    if (response.code === 14000) {
        setUserLists({
        clientList: response.data.clientList || [],
        });
    } else {
        alert(response.message);
    }
    } catch (error) {
    console.error(error);
    }
};

useEffect(() => {
    getUserLists();
}, []);

// ================Get API key of selected user API==================
const getUserApiKey = async (userName) => {
  try {
    const payload = {
      loggedInUserName: userData.username,
      operation: "getUserApiKey",
      userName: userName,
    };

    const response = await Endpoints.post(
      "getUserApiKey",
      payload,
      userData.authJwtToken
    );

    if (Number(response.code) === 4001) {
    setApiKey(response.data?.apiKey ?? "");
    } else {
      setApiKey(null);
      alert(response.message);
    }
  } catch (error) {
    console.error(error);
    setApiKey(null);
  }
};

//=================Get new Key API================
const generateNewApiKey = async () => {
  if (!selectedClient) {
    alert("Please select a client first.");
    return;
  }

  try {
    const payload = {
      loggedInUserName: userData.username,
      operation: "getUserApiKey",
      userName: selectedClient.value,
    };

    const response = await Endpoints.post(
      "generateNewApiKey",
      payload,
      userData.authJwtToken
    );

    if (Number(response.code) === 4001) {
      setApiKey(response.data?.apiKey ?? "");

       // Show success toast
      setToastMessage(`API Key generated for ${selectedClient.label}`);

      // Hide toast after 2 seconds
      setTimeout(() => {
        setToastMessage("");
      }, 2000);

    } else {
      alert(response.message);
    }
  } catch (error) {
    console.error(error);
  }
};

//===============function to copy API key============
const copyApiKey = async () => {
  if (!apiKey) return;

  try {
    await navigator.clipboard.writeText(apiKey);
    setToastMessage("API key copied successfully.");

    // Hide the toast after 3 seconds
    setTimeout(() => {
      setToastMessage("");
    }, 3000);
  } catch (error) {
    console.error("Failed to copy API key:", error);

    setToastMessage("Failed to copy API key.");

    setTimeout(() => {
      setToastMessage("");
    }, 2000);
  }
};

  return (
    <div className="generate-api-key">
        {toastMessage && (
        <div className="toast-message">
            <i className="fa-solid fa-circle-check"></i>
            {toastMessage}
        </div>
        )}

      <div className="generate-api-key-header">
        <h1>Generate API Key</h1>

        <p>
          Home / Generate API Key · Create or rotate API access keys for any
          account
        </p>
      </div>

      <div className="api-key-card">
        {/* Select Account */}
        <div className="section">
          <h3>SELECT ACCOUNT</h3>

        <div className="form-group">
            <label>Client name</label>

            <div className="select-wrapper">
                <Select
                className="field-select"
                classNamePrefix="react-select"
                options={toOptions(userLists.clientList)}
                value={selectedClient}
                onChange={(value) => {
                    setSelectedClient(value);

                    if (value) {
                    getUserApiKey(value.value);
                    } else {
                    setApiKey(null);
                    }
                }}
                placeholder="Select client"
                isSearchable
                />
            </div>
            </div>
        </div>

        <hr />

        {/* API Key */}
        <div className="section">
          <h3>API KEY</h3>

         <div className="form-group">
            <label>Existing API Key</label>

            <div className="key-row">
               <input
                type={showApiKey ? "text" : "password"}
                value={apiKey || ""}
                placeholder={
                    !selectedClient
                    ? "Select an account to view its key"
                    : "No API key generated yet"
                }
                readOnly
                />

                <button
                className="icon-btn"
                onClick={() => setShowApiKey(!showApiKey)}
                >
                <i
                    className={`fa-regular ${
                    showApiKey ? "fa-eye-slash" : "fa-eye"
                    }`}y
                ></i>
                </button>

                <button
                    className="icon-btn"
                    onClick={copyApiKey}
                    disabled={!apiKey}
                    >
                    <i className="fa-regular fa-copy"></i>
                </button>
            </div>
            {apiKey && (
                <div className="api-key-status">
                <i className="fa-solid fa-circle-check"></i>
                <span>Active key on file for this account</span>
                </div>
            )}
            </div>


          <div className="generate-btn-wrapper">
           {!apiKey ? (
              <button
                className="generate-btn"
                onClick={generateNewApiKey}
                disabled={!selectedClient}
                >
                <i className="fa-solid fa-key"></i>
                Generate API Key
                </button>
            ) : (
               <button
                className="regenerate-btn"
                onClick={() => setShowRegenerateModal(true)}
                >
                <i className="fa-solid fa-rotate"></i>
                Regenerate API Key
                </button>
            )}
            </div>

            <p className="regenerate-warning">
            {apiKey ? (
            <>
                Regenerating will immediately invalidate the current key for{" "}
                <strong>{selectedClient?.label}</strong> — anything using it will need
                to be updated.
            </>
            ) : (
                <p className="helper-text">
                Select an account above to enable this.
                </p>
            )}
        </p>

        </div>
      </div>
      {showRegenerateModal && (
        <div
            className="modal-overlay"
            onClick={() => setShowRegenerateModal(false)}
        >
            <div
            className="regenerate-modal"
            onClick={(e) => e.stopPropagation()}
            >
            <div className="modal-header">
                <div className="warning-icon">
                <i className="fa-regular fa-trash-can"></i>
                </div>

                <h2>Regenerate API key?</h2>
            </div>

            <div className="modal-body">
                <p>
                This will immediately invalidate the current API key for{" "}
                <strong>{selectedClient?.label}</strong> Any integration still 
                using the old key will stop working until it's updated with the 
                new one. This can't be undone..
                </p>
            </div>

            <div className="modal-footer">
                <button
                className="cancel-btn"
                onClick={() => setShowRegenerateModal(false)}
                >
                Cancel
                </button>

                <button
                className="confirm-btn"
                onClick={async () => {
                    await generateNewApiKey();
                    setShowRegenerateModal(false);
                }}
                >
                Regenerate key
                </button>
            </div>
            </div>
        </div>
        )}
    </div>
  );
};

export default GenerateApiKey;