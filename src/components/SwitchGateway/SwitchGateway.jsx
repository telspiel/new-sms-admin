import React, { useState, useEffect, useContext } from "react";
import "./SwitchGateway.css";
import Endpoints from "../../api/endpoint";
import { AuthContext } from "../../context/AuthContext";
import { RefreshCw } from "lucide-react";

const SwitchGateway = () => {
    const { userData } = useContext(AuthContext);

    const [operators, setOperators] = useState([]);
    const [fromOperator, setFromOperator] = useState("");
    const [toOperator, setToOperator] = useState("");

    const [showSwitchModal, setShowSwitchModal] = useState(false);
    const [toastMessage, setToastMessage] = useState("");

  //=============Function to get all Operator name API=============
  const getAllOperatorsName = async () => {
    try {
        const payload = {
        loggedInUserName: userData.username,
        };

    const response = await Endpoints.post(
      "getAllOperatorsName",
      payload,
      userData.authJwtToken
    );

    setOperators(response || []);
  } catch (error) {
    console.error(error);
    setOperators([]);
  }
};

useEffect(() => {
  getAllOperatorsName();
}, []);

//==================API to change operator==================
const switchGatewayOperator = async () => {
  try {
    const response = await fetch(
      `${Endpoints.get(
        "switchGatewayOperator"
      )}?oldOperator=${encodeURIComponent(
        fromOperator
      )}&newOperator=${encodeURIComponent(toOperator)}`,
      {
        method: "POST",
        headers: {
          Authorization: `${userData.authJwtToken}`,
        },
      }
    );

    const data = await response.text();

    if (!response.ok) {
      throw new Error(data || `HTTP Error: ${response.status}`);
    }

    setToastMessage(data);

    setTimeout(() => {
      setToastMessage("");
    }, 2000);

    setFromOperator("");
    setToOperator("");
  } catch (error) {
    console.error(error);
    alert(error.message || "Failed to switch gateway.");
  }
};

const handleReset = () => {
  setFromOperator("");
  setToOperator("");
};

  return (
    <div className="switch-gateway">
        {toastMessage && (
        <div className="toast-message">
            <i className="fa-regular fa-circle-check"></i>
            {toastMessage}
        </div>
        )}
      <div className="switch-gateway-header">
        <h1>Switch Gateway</h1>

        <p>
          Home / Routing Management / Switch Gateway · Move traffic from one operator gateway 
          to another
        </p>
      </div>

      <div className="switch-card">
        <h2>Switch Gateway</h2>

        <p className="switch-card-subtitle">
         Choose the gateway you want to move traffic away from, and the gateway it should move to.
        </p>

        <div className="gateway-warning">
          <i className="fa-solid fa-circle-info"></i>

          <span>
            Switching a gateway takes effect immediately and applies to all live
            traffic on that gateway. Double-check the direction before saving.
          </span>
        </div>

        <div className="gateway-row">
          <div className="gateway-field">
            <label>
                From <span>*</span>
            </label>

            <select
                value={fromOperator}
                onChange={(e) => setFromOperator(e.target.value)}
            >
                <option value="">-- Select --</option>

                {operators.map((operator, index) => (
                <option key={index} value={operator}>
                    {operator}
                </option>
                ))}
            </select>
            </div>

          <div className="gateway-switch-icon">
            <RefreshCw size={20} strokeWidth={1.8} />
         </div>

          <div className="gateway-field">
        <label>
            To <span>*</span>
        </label>

        <select
            value={toOperator}
            disabled={!fromOperator}
            onChange={(e) => setToOperator(e.target.value)}
        >
            <option value="">-- Select --</option>

            {operators.map((operator, index) => (
            <option
                key={index}
                value={operator}
                disabled={operator === fromOperator}
            >
                {operator}
            </option>
            ))}
        </select>
        </div>
        </div>

        <div className="gateway-divider"></div>

        <div className="gateway-actions">
          <button className="reset-btn" onClick={handleReset}>Reset</button>

          <button
            className="save-btn"
            onClick={() => {
                if (!fromOperator) {
                alert("Please select From operator.");
                return;
                }

                if (!toOperator) {
                alert("Please select To operator.");
                return;
                }

                setShowSwitchModal(true);
            }}
            >
            Save
          </button>
        </div>
        {showSwitchModal && (
        <div
            className="switch-modal-overlay"
            onClick={() => setShowSwitchModal(false)}
        >
            <div
            className="switch-modal"
            onClick={(e) => e.stopPropagation()}
            >
            <div className="switch-modal-icon">
                <i className="fa-solid fa-triangle-exclamation"></i>
            </div>

            <h2>Switch gateway?</h2>

            <p>
                All live traffic on <strong>{fromOperator}</strong> will immediately
                switch to <strong>{toOperator}</strong>. This cannot be undone.
                Continue?
            </p>

            <div className="switch-modal-actions">
                <button
                className="modal-cancel-btn"
                onClick={() => setShowSwitchModal(false)}
                >
                Cancel
                </button>

                <button
                className="modal-confirm-btn"
                onClick={async () => {
                    setShowSwitchModal(false);
                    await switchGatewayOperator();
                }}
                >
                Yes, switch it
                </button>
            </div>
            </div>
        </div>
        )}
      </div>
    </div>
  )
}

export default SwitchGateway
