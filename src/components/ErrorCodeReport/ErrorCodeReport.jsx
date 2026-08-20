import React from "react";
import "./ErrorCodeReport.css";

const ErrorCodeReport = () => {
  const reportData = [
    {
      date: "06-07-2026",
      username: "testwebtool",
      errorCode: "102",
      description: "Unknown Network Errors by SMSC",
      count: 179,
    },
    {
      date: "06-07-2026",
      username: "sadatsmpp",
      errorCode: "117",
      description: "Call Barred",
      count: 173,
    },
    {
      date: "06-07-2026",
      username: "mendemo",
      errorCode: "106",
      description: "Absent / Roaming Failed / Roaming Not Allowed",
      count: 169,
    },
    {
      date: "06-07-2026",
      username: "demosmpp4",
      errorCode: "108",
      description: "EC_Network System Failure",
      count: 164,
    },
    {
      date: "06-07-2026",
      username: "testcredit",
      errorCode: "115",
      description: "Invalid destination address",
      count: 163,
    },
    {
      date: "06-07-2026",
      username: "demosmpp4",
      errorCode: "118",
      description: "DLT Scrubbing Failed",
      count: 158,
    },
    {
      date: "06-07-2026",
      username: "api22",
      errorCode: "113",
      description: "Suspended at DLT",
      count: 156,
    },
    {
      date: "06-07-2026",
      username: "sadatsmpp",
      errorCode: "105",
      description: "Message Expired",
      count: 156,
    },
    {
      date: "06-07-2026",
      username: "testwebtool",
      errorCode: "105",
      description: "Message Expired",
      count: 154,
    },
    {
      date: "06-07-2026",
      username: "testftp",
      errorCode: "103",
      description: "MAP Abort Error",
      count: 152,
    },
    {
      date: "06-07-2026",
      username: "testftp",
      errorCode: "121",
      description: "Invalid/Missing TLV parameters",
      count: 151,
    },
  ];

  return (
    <div className="errorcode-report">
      <div className="errorcode-report-header">
        <h1>Error Code Wise Report</h1>
        <p>
          Home / Reports / Error Code Wise Report · Error-code wise failure
          breakdown, per user
        </p>
      </div>

      <div className="errorcode-filter-card">
        <div className="errorcode-filter-field user-field">
            <label>User Name / Client Name</label>
            <div className="errorcode-select">
            <select defaultValue="">
                <option value="">All Users</option>
                <option value="testwebtool">testwebtool</option>
                <option value="sadatsmpp">sadatsmpp</option>
                <option value="mendemo">mendemo</option>
                <option value="demosmpp4">demosmpp4</option>
                <option value="testcredit">testcredit</option>
            </select>
            </div>
        </div>

        <div className="errorcode-filter-field error-field">
            <label>Error Code</label>
            <div className="errorcode-select">
            <select defaultValue="">
                <option value="">All Error Codes</option>
                <option value="102">102</option>
                <option value="103">103</option>
                <option value="105">105</option>
                <option value="106">106</option>
                <option value="108">108</option>
                <option value="113">113</option>
                <option value="115">115</option>
                <option value="117">117</option>
                <option value="118">118</option>
                <option value="121">121</option>
            </select>
            </div>
        </div>

        <div className="errorcode-filter-field date-field">
            <label>
            From <span>*</span>
            </label>

            <div className="date-input-wrap">
            <input type="date" defaultValue="2026-07-01" />
            </div>
        </div>

        <div className="errorcode-filter-field date-field">
            <label>
            To <span>*</span>
            </label>

            <div className="date-input-wrap">
            <input type="date" defaultValue="2026-07-07" />
            </div>
        </div>

        <div className="errorcode-filter-actions">
            <button className="errorcode-search-btn">Search</button>
            <button className="errorcode-reset-btn">Reset</button>
        </div>
        </div>

      <div className="errorcode-record-count">455 records</div>

      <div className="errorcode-table-wrapper">
        <table className="errorcode-table">
          <thead>
            <tr>
              <th>DATE</th>
              <th>USERNAME</th>
              <th>ERROR CODE</th>
              <th>ERROR DESCRIPTION</th>
              <th>COUNT</th>
            </tr>
          </thead>

          <tbody>
            {reportData.map((item, index) => (
              <tr key={index}>
                <td>{item.date}</td>
                <td>{item.username}</td>
                <td>
                  <span className="error-code-badge">{item.errorCode}</span>
                </td>
                <td>{item.description}</td>
                <td className="error-count">{item.count}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="errorcode-pagination-summary">
          <div className="errorcode-total">
            <span>Total</span>
            <strong>(455 records)</strong>
          </div>

          <div className="errorcode-grand-total">40,287</div>
        </div>

        <div className="errorcode-pagination">
          <div className="rows-per-page">
            <span>Rows per page</span>
            <select defaultValue="25">
              <option value="25">25</option>
              <option value="50">50</option>
              <option value="100">100</option>
            </select>
          </div>

          <div className="showing-records">
            Showing 1–25 of 455
          </div>

          <div className="pagination-buttons">
            <button className="pagination-arrow disabled">‹</button>
            <button className="pagination-page active">1</button>
            <button className="pagination-page">2</button>
            <button className="pagination-page">3</button>
            <span className="pagination-dots">...</span>
            <button className="pagination-page">19</button>
            <button className="pagination-arrow">›</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ErrorCodeReport;