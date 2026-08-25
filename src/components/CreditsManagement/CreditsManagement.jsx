import { useState, useEffect, useContext } from "react";
import "./CreditsManagement.css";
import { AuthContext } from "../../context/AuthContext";
import Endpoints from "../../api/endpoint";
import Select from "react-select";
import * as XLSX from "xlsx";

function CreditsManagement() {
const [userLists, setUserLists] = useState({
  adminList: [],
  resellerList: [],
  sellerList: [],
  clientList: [],
});

const [selectedUser, setSelectedUser] = useState({
  admin: null,
  reseller: null,
  seller: null,
  client: null,
});

const [creditData, setCreditData] = useState({
  userAvailableCredit: null,
  loggedInUserCredit: null,
});

  const { userData } = useContext(AuthContext);

  const [activeTab, setActiveTab] = useState("add");

  const today = new Date().toISOString().split("T")[0];

  const [fromDate, setFromDate] = useState(today);
  const [toDate, setToDate] = useState(today);
  const [creditHistory, setCreditHistory] = useState([]);
  const [allUsersData, setAllUsersData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [historyType, setHistoryType] = useState("All");

  //To add and deduct credits
  const [creditToAdd, setCreditToAdd] = useState("");
  const [creditToDeduct, setCreditToDeduct] = useState("");

  const [toastMessage, setToastMessage] = useState("");

  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmAction, setConfirmAction] = useState("");

  const [selectedAccount, setSelectedAccount] = useState({
  type: "",
  value: "",
});

const isUserSelected = !!selectedAccount.value;

  const [showExportMenu, setShowExportMenu] = useState(false);

  //===================Get Credit table data API==================
 const getCreditHistory = async (
  from = fromDate,
  to = toDate
) => {
  setLoading(true);

  try {
    const payload = {
      loggedInUserName: userData.username,
      fromDate: from,
      toDate: to,

      ...(selectedAccount.type &&
        selectedAccount.value && {
          [selectedAccount.type]: selectedAccount.value,
        }),
    };

    console.log("Credit History Payload:", payload);

    const response = await Endpoints.post(
      "getCreditHistory",
      payload,
      userData.authJwtToken
    );

    if (response.code === 16000) {
      setCreditHistory(response.data.grid || []);
    } else {
      setCreditHistory([]);
    }
  } catch (error) {
    console.error(error);
    setCreditHistory([]);
  } finally {
    setLoading(false);
  }
};

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
        adminList: response.data.adminList || [],
        resellerList: response.data.resellerList || [],
        sellerList: response.data.sellerList || [],
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
  if (activeTab === "history") {
    getCreditHistory();
  }
}, [activeTab]);

useEffect(() => {
  getUserLists();
}, []);

const toOptions = (list) =>
  list.map((item) => ({
    label: item,
    value: item,
  }));

//====================Get credit as per user API=====================
const getViewCreditForUser = async (
  type,
  value,
  includeDates = false
) => {
  if (!value) return;

  setSelectedAccount({
    type,
    value,
  });

  try {
    const payload = {
    loggedInUserName: userData.username,
    [type]: value,
    ...(includeDates && {
        fromDate,
        toDate,
    }),
    };

    const response = await Endpoints.post(
      "viewCreditForUser",
      payload,
      userData.authJwtToken
    );

    console.log("View Credit:", response);

    if (response.code === 8007) {
      setCreditData(response.data.userCredit);
    } else {
      setCreditData({
        userAvailableCredit: null,
        loggedInUserCredit: null,
      });
      alert(response.message);
    }
  } catch (error) {
    console.error(error);
  }
};

//=============To add credit==============
const addAmount = Number(creditToAdd) || 0;
const yourBalanceAfter =
  Number(creditData.loggedInUserCredit || 0) - addAmount;
const customerBalanceAfter =
  Number(creditData.userAvailableCredit || 0) + addAmount;

//=============To deduct credit==============
const deductAmount = Number(creditToDeduct) || 0;
const yourBalanceAfterDeduct =
  Number(creditData.loggedInUserCredit || 0) + deductAmount;
const customerBalanceAfterDeduct =
  Number(creditData.userAvailableCredit || 0) - deductAmount;  


//=====================Update credits value API==================
 const updateCredit = async (operation, creditValue) => {
  const amount = Number(creditValue);

    if (isNaN(amount) || amount <= 0) {
    alert("Please enter a valid credit.");
    return;
    }

    setLoading(true);

  try {
    const payload = {
    operation,
    loggedInUserName: userData.username,
    [selectedAccount.type]: selectedAccount.value,
    creditToBeAdded: amount,
    };

    const response = await Endpoints.post(
      "updateCredit",
      payload,
      userData.authJwtToken
    );

    if (response.code === 8007) {
      setCreditData(response.data.userCredit);

      setToastMessage(response.message);

      setTimeout(() => {
        setToastMessage("");
      }, 2000);

      setCreditToAdd("");
      setCreditToDeduct("");

     getViewCreditForUser(
        selectedAccount.type,
        selectedAccount.value,
        );
    } else {
      alert(response.message);
    }
  } catch (error) {
    console.error(error);
  }  finally {
    setLoading(false);
  }
};

// ============Filter based on credit and debit in table data====================
const filteredHistory = creditHistory.filter((item) => {
  if (historyType === "All") return true;

  if (historyType === "Credit") {
    return item.status === "Add";
  }

  if (historyType === "Debit") {
    return item.status === "Deduct";
  }

  return true;
});

//=====================Download in xlsx and csv functionality======================
const exportData = (type) => {
  if (!filteredHistory.length) {
    alert("No data to download.");
    return;
  }

  const data = filteredHistory.map((item) => ({
    "Created Date": item.createdDate,
    Credit: item.credit,
    Status: item.status,
    "Updated Credit": item.updatedCredit,
    "Updated By": item.updatedBy,
    Comment: item.comment,
  }));

  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();

  XLSX.utils.book_append_sheet(
    workbook,
    worksheet,
    "Credit History"
  );

  if (type === "xlsx") {
    XLSX.writeFile(workbook, "Credit_History.xlsx");
  } else {
    XLSX.writeFile(workbook, "Credit_History.csv", {
      bookType: "csv",
    });
  }

  setShowExportMenu(false);
};

//===================Reset data on section switch==================
const resetPage = () => {
  setSelectedUser({
    admin: null,
    reseller: null,
    seller: null,
    client: null,
  });

  setCreditData({
    userAvailableCredit: null,
    loggedInUserCredit: null,
  });

  setCreditToAdd("");
  setCreditToDeduct("");

  setFromDate(today)
  setToDate(today)

};

//=======================Reset individual pages=====================
const resetIndividualPage = () => {
    setSelectedUser({
    admin: null,
    reseller: null,
    seller: null,
    client: null,
  });

  setCreditData({
    userAvailableCredit: null,
    loggedInUserCredit: null,
  });

   setCreditToAdd("");
  setCreditToDeduct("");
}

//===============Render selected user===================
const selectedName =
  selectedUser.admin?.label ||
  selectedUser.reseller?.label ||
  selectedUser.seller?.label ||
  selectedUser.client?.label ||
  "";

  return (
    <div className="credits-management">
        {toastMessage && (
        <div className="toast-message">
            <i className="fa-solid fa-circle-check"></i>
            {toastMessage}
        </div>
        )}
      <div className="credits-management-header">
        <h1>Credit Management</h1>

        <p>
          Home / Credits Management · Add, deduct and track credit across your
          account hierarchy
        </p>
      </div>

      <div className="credit-container">

        {/* Tabs */}

        <div className="credit-tabs">
          <button
            className={activeTab === "add" ? "tab active" : "tab"}
             onClick={() => {
            resetPage();
            setActiveTab("add");
            }}
          >
            Add / View
          </button>

           <button
            className={activeTab === "deduct" ? "tab active" : "tab"}
             onClick={() => {
            resetPage();
            setActiveTab("deduct");
            }}
          >
            Deduct
          </button>

          <button
            className={activeTab === "history" ? "tab active" : "tab"}
            onClick={() => {
            resetPage();
            setActiveTab("history");
            }}
          >
            Credit History
          </button>
        </div>

        {/* Add View */}
        <div className="credit-content">

        {activeTab === "add" && (
            <>
            <h2>Add / View Credit</h2>

            <div className="credit-form">
            <div className="field">
              <label>Admin name</label>
              <Select
                className="field-select"
                classNamePrefix="react-select"
                options={toOptions(userLists.adminList)}
                value={selectedUser.admin}
                isDisabled={Boolean(selectedUser.reseller || selectedUser.seller || selectedUser.client)}
                isClearable={true}
                onChange={(value) => {
                  if (!value) {
                    setSelectedUser({ admin: null, reseller: null, seller: null, client: null });
                    getViewCreditForUser("adminName", null);
                  } else {
                    setSelectedUser({
                      admin: value,
                      reseller: null,
                      seller: null,
                      client: null,
                    });
                    getViewCreditForUser("adminName", value?.value);
                  }
                }}
                placeholder="Search Admin..."
                isSearchable
              />
            </div>

            <div className="field">
              <label>Reseller name</label>
              <Select
                className="field-select"
                classNamePrefix="react-select"
                options={toOptions(userLists.resellerList)}
                value={selectedUser.reseller}
                isDisabled={Boolean(selectedUser.admin || selectedUser.seller || selectedUser.client)}
                isClearable={true}
                onChange={(value) => {
                  if (!value) {
                    setSelectedUser({ admin: null, reseller: null, seller: null, client: null });
                    getViewCreditForUser("resellerName", null);
                  } else {
                    setSelectedUser({
                      admin: null,
                      reseller: value,
                      seller: null,
                      client: null,
                    });
                    getViewCreditForUser("resellerName", value?.value);
                  }
                }}
                placeholder="Search Reseller..."
                isSearchable
              />
            </div>

            <div className="field">
              <label>Seller name</label>
              <Select
                className="field-select"
                classNamePrefix="react-select"
                options={toOptions(userLists.sellerList)}
                value={selectedUser.seller}
                isDisabled={Boolean(selectedUser.admin || selectedUser.reseller || selectedUser.client)}
                isClearable={true}
                onChange={(value) => {
                  if (!value) {
                    setSelectedUser({ admin: null, reseller: null, seller: null, client: null });
                    getViewCreditForUser("sellerName", null);
                  } else {
                    setSelectedUser({
                      admin: null,
                      reseller: null,
                      seller: value,
                      client: null,
                    });
                    getViewCreditForUser("sellerName", value?.value);
                  }
                }}
                placeholder="Search Seller..."
                isSearchable
              />
            </div>

            <div className="field">
              <label>Client name</label>
              <Select
                className="field-select"
                classNamePrefix="react-select"
                options={toOptions(userLists.clientList)}
                value={selectedUser.client}
                isDisabled={Boolean(selectedUser.admin || selectedUser.reseller || selectedUser.seller)}
                isClearable={true}
                onChange={(value) => {
                  if (!value) {
                    setSelectedUser({ admin: null, reseller: null, seller: null, client: null });
                    getViewCreditForUser("clientName", null);
                  } else {
                    setSelectedUser({
                      admin: null,
                      reseller: null,
                      seller: null,
                      client: value,
                    });
                    getViewCreditForUser("clientName", value?.value);
                  }
                }}
                placeholder="Search Client..."
                isSearchable
              />
            </div>
          </div>

            {selectedName ? (
            <div className="selected-user-wrapper">
                <div className="selected-user-tag">
                {selectedName}
                </div>
            </div>
            ) : (
            <p className="credit-helper-text">
                Select an account above to view its credit — add credit to it below if needed.
            </p>
            )}

            <div className="balance-row">

                <div className="balance-card">
                <span>YOUR AVAILABLE CREDIT</span>
                <h3>
                {creditData.loggedInUserCredit != null
                    ? Number(creditData.loggedInUserCredit).toLocaleString()
                    : "—"}
                </h3>
                <small>
                    Deducted when you transfer credit below
                </small>
                </div>

                <div className="balance-card">
                <span>CUSTOMER AVAILABLE CREDIT</span>
                <h3>
                {creditData.userAvailableCredit != null
                    ? Number(creditData.userAvailableCredit).toLocaleString()
                    : "—"}
                </h3>
                <small>
                    Select an account to view balance
                </small>
                </div>

            </div>

            <div className="credit-input-section">

                <div className="credit-input">

                <label>
                    Add Credit <span>*</span>
                </label>

               <input
                type="number"
                value={creditToAdd}
                onChange={(e) => setCreditToAdd(e.target.value)}
                placeholder="0"
                onKeyDown={(e) => {
                  if (e.key === "-" || e.key === "e") {
                    e.preventDefault();
                  }
                }}
                disabled={!isUserSelected}
                />

                <small>
                    Whole numbers only · no per-transaction limit
                </small>
                </div>

                {creditData.loggedInUserCredit !== null &&
                creditData.userAvailableCredit !== null &&
                addAmount > 0 && (
                <div className="credit-preview-card">

                    <div className="preview-row">
                    <span>Your balance after</span>
                    <strong>
                        {yourBalanceAfter.toLocaleString()}
                    </strong>
                    </div>

                    <div className="preview-row">
                    <span>
                        {creditData.userName}'s balance after
                    </span>
                    <strong>
                        {customerBalanceAfter.toLocaleString()}
                    </strong>
                    </div>

                </div>
                )}

                <div className="credit-buttons">

               <button
                className="add-btn"
                disabled={!isUserSelected}
                onClick={() => {
                    setConfirmAction("addCredit");
                    setShowConfirmModal(true);
                }}
                >
                Add Credit
                </button>

                <button className="reset-btn" onClick={() => {resetIndividualPage()}}>
                    Reset
                </button>

                </div>

            </div>
            </>
        )}

        {activeTab === "deduct" && (
            <>
            <h2>Deduct Credit</h2>

            <div className="credit-form">
              {/* Admin Name */}
              <div className="field">
                <label>Admin name</label>
                <Select
                  className="field-select"
                  classNamePrefix="react-select"
                  options={toOptions(userLists.adminList)}
                  value={selectedUser.admin}
                  isDisabled={Boolean(
                    selectedUser.reseller || selectedUser.seller || selectedUser.client
                  )}
                  isClearable={true}
                  onChange={(value) => {
                    if (!value) {
                      setSelectedUser({
                        admin: null,
                        reseller: null,
                        seller: null,
                        client: null,
                      });
                      getViewCreditForUser("adminName", null);
                    } else {
                      setSelectedUser({
                        admin: value,
                        reseller: null,
                        seller: null,
                        client: null,
                      });
                      getViewCreditForUser("adminName", value?.value);
                    }
                  }}
                  placeholder="Search Admin..."
                  isSearchable
                />
              </div>

              {/* Reseller Name */}
              <div className="field">
                <label>Reseller name</label>
                <Select
                  className="field-select"
                  classNamePrefix="react-select"
                  options={toOptions(userLists.resellerList)}
                  value={selectedUser.reseller}
                  isDisabled={Boolean(
                    selectedUser.admin || selectedUser.seller || selectedUser.client
                  )}
                  isClearable={true}
                  onChange={(value) => {
                    if (!value) {
                      setSelectedUser({
                        admin: null,
                        reseller: null,
                        seller: null,
                        client: null,
                      });
                      getViewCreditForUser("resellerName", null);
                    } else {
                      setSelectedUser({
                        admin: null,
                        reseller: value,
                        seller: null,
                        client: null,
                      });
                      getViewCreditForUser("resellerName", value?.value);
                    }
                  }}
                  placeholder="Search Reseller..."
                  isSearchable
                />
              </div>

              {/* Seller Name */}
              <div className="field">
                <label>Seller name</label>
                <Select
                  className="field-select"
                  classNamePrefix="react-select"
                  options={toOptions(userLists.sellerList)}
                  value={selectedUser.seller}
                  isDisabled={Boolean(
                    selectedUser.admin || selectedUser.reseller || selectedUser.client
                  )}
                  isClearable={true}
                  onChange={(value) => {
                    if (!value) {
                      setSelectedUser({
                        admin: null,
                        reseller: null,
                        seller: null,
                        client: null,
                      });
                      getViewCreditForUser("sellerName", null);
                    } else {
                      setSelectedUser({
                        admin: null,
                        reseller: null,
                        seller: value,
                        client: null,
                      });
                      getViewCreditForUser("sellerName", value?.value);
                    }
                  }}
                  placeholder="Search Seller..."
                  isSearchable
                />
              </div>

              {/* Client Name */}
              <div className="field">
                <label>Client name</label>
                <Select
                  className="field-select"
                  classNamePrefix="react-select"
                  options={toOptions(userLists.clientList)}
                  value={selectedUser.client}
                  isDisabled={Boolean(
                    selectedUser.admin || selectedUser.reseller || selectedUser.seller
                  )}
                  isClearable={true}
                  onChange={(value) => {
                    if (!value) {
                      setSelectedUser({
                        admin: null,
                        reseller: null,
                        seller: null,
                        client: null,
                      });
                      getViewCreditForUser("clientName", null);
                    } else {
                      setSelectedUser({
                        admin: null,
                        reseller: null,
                        seller: null,
                        client: value,
                      });
                      getViewCreditForUser("clientName", value?.value);
                    }
                  }}
                  placeholder="Search Client..."
                  isSearchable
                />
              </div>
            </div>

            {selectedName ? (
            <div className="selected-user-wrapper">
                <div className="selected-user-tag">
                {selectedName}
                </div>
            </div>
            ) : (
            <p className="credit-helper-text">
                Select an account above to view its credit — add credit to it below if needed.
            </p>
            )}

            <div className="balance-row">

                <div className="balance-card">
                <span>YOUR AVAILABLE CREDIT</span>
                <h3>
                {creditData.loggedInUserCredit != null
                    ? Number(creditData.loggedInUserCredit).toLocaleString()
                    : "—"}
                </h3>
                <small>
                    Credited back when you deduct below
                </small>
                </div>

                <div className="balance-card">
                <span>AVAILABLE USER CREDIT</span>
                <h3>
                {creditData.userAvailableCredit != null
                    ? Number(creditData.userAvailableCredit).toLocaleString()
                    : "—"}
                </h3>
                <small>
                    Select an account to view balance
                </small>
                </div>

            </div>

            <div className="credit-input-section">

                <div className="credit-input">

                <label>
                    Credits to Deduct <span>*</span>
                </label>

                <input
                type="number"
                value={creditToDeduct}
                onChange={(e) => setCreditToDeduct(e.target.value)}
                placeholder="0"
                onKeyDown={(e) => {
                  if (e.key === "-" || e.key === "e") {
                    e.preventDefault();
                  }
                }}
                disabled={!isUserSelected}
                />

                <small>
                    Cannot exceed the account's available credit
                </small>
                </div>

                
                {creditData.loggedInUserCredit !== null &&
                creditData.userAvailableCredit !== null &&
                deductAmount > 0 && (
                <div className="credit-preview-card">

                    <div className="preview-row">
                    <span>
                        {creditData.userName}'s balance after
                    </span>
                    <strong>
                        {customerBalanceAfterDeduct.toLocaleString()}
                    </strong>
                    </div>

                    <div className="preview-row">
                    <span>Your balance after</span>
                    <strong>
                        {yourBalanceAfterDeduct.toLocaleString()}
                    </strong>
                    </div>

                </div>
                )}

                <div className="credit-buttons">
                <button
                className="deduct-btn"
                disabled={!isUserSelected}
                onClick={() => {
                    setConfirmAction("deductCredit");
                    setShowConfirmModal(true);
                }}
                >
                Deduct Credit
                </button>

                <button className="reset-btn" onClick={() => {resetIndividualPage()}}>
                    Reset
                </button>

                </div>

            </div>
            </>
        )}

        {activeTab === "history" && (
        <>
           <h2>Credit History</h2>

            <div className="credit-form">
              {/* Admin Name */}
              <div className="field">
                <label>Admin name</label>
                <Select
                  className="field-select"
                  classNamePrefix="react-select"
                  options={toOptions(userLists.adminList)}
                  value={selectedUser.admin}
                  isDisabled={Boolean(
                    selectedUser.reseller || selectedUser.seller || selectedUser.client
                  )}
                  isClearable={true}
                  onChange={(value) => {
                    if (!value) {
                      setSelectedUser({
                        admin: null,
                        reseller: null,
                        seller: null,
                        client: null,
                      });
                      getViewCreditForUser("adminName", null, true);
                    } else {
                      setSelectedUser({
                        admin: value,
                        reseller: null,
                        seller: null,
                        client: null,
                      });
                      getViewCreditForUser("adminName", value?.value, true);
                    }
                  }}
                  placeholder="Search Admin..."
                  isSearchable
                />
              </div>

              {/* Reseller Name */}
              <div className="field">
                <label>Reseller name</label>
                <Select
                  className="field-select"
                  classNamePrefix="react-select"
                  options={toOptions(userLists.resellerList)}
                  value={selectedUser.reseller}
                  isDisabled={Boolean(
                    selectedUser.admin || selectedUser.seller || selectedUser.client
                  )}
                  isClearable={true}
                  onChange={(value) => {
                    if (!value) {
                      setSelectedUser({
                        admin: null,
                        reseller: null,
                        seller: null,
                        client: null,
                      });
                      getViewCreditForUser("resellerName", null, true);
                    } else {
                      setSelectedUser({
                        admin: null,
                        reseller: value,
                        seller: null,
                        client: null,
                      });
                      getViewCreditForUser("resellerName", value?.value, true);
                    }
                  }}
                  placeholder="Search Reseller..."
                  isSearchable
                />
              </div>

              {/* Seller Name */}
              <div className="field">
                <label>Seller name</label>
                <Select
                  className="field-select"
                  classNamePrefix="react-select"
                  options={toOptions(userLists.sellerList)}
                  value={selectedUser.seller}
                  isDisabled={Boolean(
                    selectedUser.admin || selectedUser.reseller || selectedUser.client
                  )}
                  isClearable={true}
                  onChange={(value) => {
                    if (!value) {
                      setSelectedUser({
                        admin: null,
                        reseller: null,
                        seller: null,
                        client: null,
                      });
                      getViewCreditForUser("sellerName", null, true);
                    } else {
                      setSelectedUser({
                        admin: null,
                        reseller: null,
                        seller: value,
                        client: null,
                      });
                      getViewCreditForUser("sellerName", value?.value, true);
                    }
                  }}
                  placeholder="Search Seller..."
                  isSearchable
                />
              </div>

              {/* Client Name */}
              <div className="field">
                <label>Client name</label>
                <Select
                  className="field-select"
                  classNamePrefix="react-select"
                  options={toOptions(userLists.clientList)}
                  value={selectedUser.client}
                  isDisabled={Boolean(
                    selectedUser.admin || selectedUser.reseller || selectedUser.seller
                  )}
                  isClearable={true}
                  onChange={(value) => {
                    if (!value) {
                      setSelectedUser({
                        admin: null,
                        reseller: null,
                        seller: null,
                        client: null,
                      });
                      getViewCreditForUser("clientName", null, true);
                    } else {
                      setSelectedUser({
                        admin: null,
                        reseller: null,
                        seller: null,
                        client: value,
                      });
                      getViewCreditForUser("clientName", value?.value, true);
                    }
                  }}
                  placeholder="Search Client..."
                  isSearchable
                />
              </div>
            </div>

            {/* Filters */}
            <div className="history-filter-row">

            <div className="field-small-field">
                <label>FROM</label>
                <input
                type="date"
                value={fromDate}
                max={new Date().toISOString().split("T")[0]}
                onChange={(e) =>
                    setFromDate(e.target.value)
                }
                />
            </div>

            <div className="field-small-field">
                <label>TO</label>
                <input
                type="date"
                value={toDate}
                max={new Date().toISOString().split("T")[0]}
                onChange={(e) =>
                    setToDate(e.target.value)
                }
                />
            </div>

           <div className="field-small-field">
            <label>TYPE</label>

            <select
                value={historyType}
                onChange={(e) => setHistoryType(e.target.value)}
            >
                <option value="All">All</option>
                <option value="Credit">Credit</option>
                <option value="Debit">Debit</option>
            </select>
            </div>

            <div className="history-buttons">

                <button
                className="submit-btn"
                onClick={() =>
                    getCreditHistory(fromDate, toDate)
                }
                >
                Submit
                </button>

                <button
                className="reset-btn"
                onClick={() => {
                    setFromDate(today);
                    setToDate(today);
                    setSelectedUser({
                        admin: null,
                        reseller: null,
                        seller: null,
                        client: null,
                    });
                }}
                >
                Reset
                </button>

                <div className="export-wrapper">
                    <button
                        className="export-btn"
                        onClick={() =>
                        setShowExportMenu(!showExportMenu)
                        }
                    >
                        <i className="fa-solid fa-download"></i>
                        Export
                        <i
                        className={`fa-solid ${
                            showExportMenu
                            ? "fa-angle-up"
                            : "fa-angle-down"
                        }`}
                        ></i>
                    </button>

                    {showExportMenu && (
                        <div className="export-dropdown">

                        <button
                            onClick={() => exportData("xlsx")}
                        >
                            <span className="excel-icon">XLS</span>
                            Export as XLSX
                        </button>

                        <button
                            onClick={() => exportData("csv")}
                        >
                            <span className="csv-icon">CSV</span>
                            Export as CSV
                        </button>

                        </div>
                    )}

                    </div>

            </div>

            </div>

            {/* Table / Empty State */}
            <div className="history-table-card">
            {loading ? (
              <div className="table-loader">
                <div className="spinner"></div>
                <p>Loading Credit History...</p>
              </div>
            ) : creditHistory.length > 0 ? (
              <table className="credit-history-table">
                <thead>
                  <tr>
                    <th>CREATED DATE</th>
                    <th>CREDIT</th>
                    <th>STATUS</th>
                    <th>UPDATED CREDIT</th>
                    <th>UPDATED BY</th>
                    <th>COMMENT</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredHistory.map((item, index) => (
                    <tr key={index}>
                      <td>{item.createdDate}</td>

                      <td
                        className={`credit-amount ${
                          Number(item.credit) >= 0 ? "credit" : "debit"
                        }`}
                      >
                        {Number(item.credit).toLocaleString()}
                      </td>

                      <td>
                        <span
                          className={`status-badge ${
                            item.status === "Add" ? "credit" : "debit"
                          }`}
                        >
                          {item.status}
                        </span>
                      </td>

                      <td className="updated-credit">
                        {Number(item.updatedCredit).toLocaleString()}
                      </td>

                      <td className="updated-by">
                        {item.updatedBy}
                      </td>

                      <td className="comment-text">
                        {item.comment}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="history-empty">
                <div className="history-empty-icon">
                  <i className="fa-solid fa-dollar-sign"></i>
                </div>

                <h3>No history in this range</h3>

                <p>
                  No credit was added or deducted for this account within
                  <br />
                  the selected dates.
                </p>
              </div>
            )}
          </div>

        </>
        )}

        </div>

      </div>
      {showConfirmModal && (
        <div
            className="credit-modal-overlay"
            onClick={() => setShowConfirmModal(false)}
        >
            <div
            className="credit-confirm-modal"
            onClick={(e) => e.stopPropagation()}
            >
            <div className="modal-header">
                <div className="modal-icon">
                <i className="fa-solid fa-dollar-sign"></i>
                </div>

                <h2>
                {confirmAction === "addCredit"
                    ? "Add credit to this account?"
                    : "Deduct credit from this account?"}
                </h2>
            </div>

            <div className="modal-body">

                <p className="modal-description">
                {confirmAction === "addCredit"
                    ? `You're about to transfer credit from your balance to ${creditData.userName}.`
                    : `You're about to deduct credit from ${creditData.userName}'s balance and credit it back to your own balance.`}
                </p>

                <div className="modal-row">
                <span>Account</span>
                <strong>{creditData.userName}</strong>
                </div>

                <div className="modal-row">
                <span>Amount</span>

                <strong>
                    {confirmAction === "addCredit"
                    ? Number(creditToAdd).toLocaleString()
                    : Number(creditToDeduct).toLocaleString()}
                </strong>
                </div>

                {confirmAction === "addCredit" ? (
                <>
                    <div className="modal-row">
                    <span>Your balance after</span>

                    <strong>
                        {yourBalanceAfter.toLocaleString()}
                    </strong>
                    </div>

                    <div className="modal-row">
                    <span>{creditData.userName}'s balance after</span>

                    <strong>
                        {customerBalanceAfter.toLocaleString()}
                    </strong>
                    </div>
                </>
                ) : (
                <>
                    <div className="modal-row">
                    <span>{creditData.userName}'s balance after</span>

                    <strong>
                        {customerBalanceAfterDeduct.toLocaleString()}
                    </strong>
                    </div>

                    <div className="modal-row">
                    <span>Your balance after</span>

                    <strong>
                        {yourBalanceAfterDeduct.toLocaleString()}
                    </strong>
                    </div>
                </>
                )}
            </div>

            <div className="modal-footer">
                <button
                className="modal-cancel-btn"
                onClick={() => setShowConfirmModal(false)}
                >
                Cancel
                </button>

                <button
                className={
                    confirmAction === "addCredit"
                    ? "modal-add-btn"
                    : "modal-deduct-btn"
                }
                onClick={() => {
                    updateCredit(
                    confirmAction,
                    confirmAction === "addCredit"
                        ? creditToAdd
                        : creditToDeduct
                    );

                    setShowConfirmModal(false);
                }}
                >
                {confirmAction === "addCredit"
                    ? "Add Credit"
                    : "Deduct Credit"}
                </button>
            </div>
            </div>
        </div>
        )}
    </div>
  );
}

export default CreditsManagement;