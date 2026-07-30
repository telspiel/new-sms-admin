import React from 'react'
import "./ExternalUsers.css";

const ExternalUsers = () => {
  return (
    <div className="external-user">
         <div className="external-user-header">
            <div>
            <h1>External Users</h1>
            <p>Home / Management Console / User Management / External Users · All external accounts across your hierarchy</p>
         </div>
         
         <div className="wrap-add-external-user-btn">
             <button
                className="add-external-user-btn"
            >
                <i className="fa-solid fa-plus"></i>
                Add External user
            </button>
        </div>
         </div>

         <div className="external-card">
         <div className="external-toolbar">
         <div className="external-toolbar-left">

         <div className="search-box">
            <i className="fa-solid fa-magnifying-glass"></i>
            <input
            type="text"
            placeholder="Search username, email or mobile..."
            />
        </div>

        <select>
            <option>All user types</option>
        </select>

        <select>
            <option>All account types</option>
        </select>

        <select>
            <option>All statuses</option>
        </select>

        </div>

        <div className="external-toolbar-right">
        <span>38 of 38 users</span>
        </div>

    </div>
    <div>
    <table className="external-table">
    <thead>
        <tr>
        <th>USER</th>
        <th>CONTACT</th>
        <th>USER TYPE</th>
        <th>ACCOUNT TYPE</th>
        <th>ORGANISATION</th>
        <th>CREATED</th>
        <th>STATUS</th>
        <th>ACTIONS</th>
        </tr>
    </thead>


    </table>

    <div className="table-footer">

    <span>
        Showing 1–8 of 38
    </span>

    <div className="pagination">

        <button className="page-btn">
        <i className="fa-solid fa-chevron-left"></i>
        </button>

        <button className="page-btn active">
        1
        </button>

        <button className="page-btn">
        2
        </button>

        <button className="page-btn">
        3
        </button>

        <button className="page-btn">
        4
        </button>

        <button className="page-btn">
        5
        </button>

        <button className="page-btn">
        <i className="fa-solid fa-chevron-right"></i>
        </button>

    </div>

    </div>
    </div>
    </div>
    </div>
  )
}

export default ExternalUsers
