import React from "react";
import "./SummaryReport.css";

const SummaryReport = () => {
  const summaryData = {
    date: "17-08-2026",
    totalRequest: "44,070",
    totalRejected: "1,046",
    totalSubmit: "43,024",
    totalDelivered: "38,293",
    deliveredPercentage: "89.0%",
    totalFailed: "4,142",
    failedPercentage: "9.6%",
    totalAwaited: "589",
    awaitedPercentage: "1.4%",
  };

  return (
    <div className="summary-report">
      <div className="summary-report-header">
        <h1>Summary Report</h1>
        <p>
          Home / Reports / Summary Report · Per-user, per-day delivery summary
        </p>
      </div>

      <div className="summary-filter-card">
        <div className="summary-filter-field user-field">
          <label>User Name / Client Name</label>

          <div className="summary-select">
            <select defaultValue="">
              <option value="">All Users</option>
              <option value="testwebtool">testwebtool</option>
              <option value="sadatsmpp">sadatsmpp</option>
              <option value="mendemo">mendemo</option>
              <option value="demosmpp4">demosmpp4</option>
            </select>
          </div>
        </div>

        <div className="summary-filter-field user-field">
          <label>Sender ID</label>

          <div className="summary-select">
            <select defaultValue="">
              <option value="">All Users</option>
              <option value="testwebtool">testwebtool</option>
              <option value="sadatsmpp">sadatsmpp</option>
              <option value="mendemo">mendemo</option>
              <option value="demosmpp4">demosmpp4</option>
            </select>
          </div>
        </div>

        <div className="summary-filter-field date-field">
          <label>
            From <span>*</span>
          </label>

          <div className="summary-date-input">
            <input type="date" defaultValue="2026-08-17" />
          </div>
        </div>

        <div className="summary-filter-field date-field">
          <label>
            To <span>*</span>
          </label>

          <div className="summary-date-input">
            <input type="date" defaultValue="2026-08-17" />
          </div>
        </div>

        <div className="summary-filter-actions">
          <button className="summary-search-btn">Search</button>
          <button className="summary-reset-btn">Reset</button>
        </div>
      </div>

      <div className="summary-record-count">1 record</div>

      <div className="summary-table-wrapper">
        <table className="summary-table">
          <thead>
            <tr>
              <th>SUMMARY DATE</th>
              <th>TOTAL REQUEST</th>
              <th>TOTAL REJECTED</th>
              <th>TOTAL SUBMIT</th>
              <th>TOTAL DELIVERED</th>
              <th>TOTAL FAILED</th>
              <th>TOTAL AWAITED</th>
            </tr>
          </thead>

          <tbody>
            <tr>
              <td>{summaryData.date}</td>

              <td className="summary-number">
                {summaryData.totalRequest}
              </td>

              <td className="summary-number">
                {summaryData.totalRejected}
              </td>

              <td className="summary-number">
                {summaryData.totalSubmit}
              </td>

              <td className="summary-delivered-cell">
                <strong>{summaryData.totalDelivered}</strong>
                <span>{summaryData.deliveredPercentage}</span>
              </td>

              <td className="summary-failed-cell">
                <strong>{summaryData.totalFailed}</strong>
                <span>{summaryData.failedPercentage}</span>
              </td>

              <td className="summary-awaited-cell">
                <strong>{summaryData.totalAwaited}</strong>
                <span>{summaryData.awaitedPercentage}</span>
              </td>
            </tr>
          </tbody>

          <tfoot>
            <tr>
              <td className="summary-footer-label">
                Total (1 record)
              </td>

              <td className="summary-footer-number">
                {summaryData.totalRequest}
              </td>

              <td className="summary-footer-number">
                {summaryData.totalRejected}
              </td>

              <td className="summary-footer-number">
                {summaryData.totalSubmit}
              </td>

              <td className="summary-delivered-cell">
                <strong>{summaryData.totalDelivered}</strong>
                <span>{summaryData.deliveredPercentage}</span>
              </td>

              <td className="summary-failed-cell">
                <strong>{summaryData.totalFailed}</strong>
                <span>{summaryData.failedPercentage}</span>
              </td>

              <td className="summary-awaited-cell">
                <strong>{summaryData.totalAwaited}</strong>
                <span>{summaryData.awaitedPercentage}</span>
              </td>
            </tr>
          </tfoot>
        </table>

        <div className="summary-pagination">
          <div className="summary-rows-per-page">
            <span>Rows per page</span>

            <select defaultValue="25">
              <option value="25">25</option>
              <option value="50">50</option>
              <option value="100">100</option>
            </select>
          </div>

          <div className="summary-showing">
            Showing 1–1 of 1
          </div>

          <div className="summary-pagination-buttons">
            <button className="summary-page-arrow disabled">‹</button>
            <button className="summary-page active">1</button>
            <button className="summary-page-arrow disabled">›</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SummaryReport;