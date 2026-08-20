import React from 'react'
import "./SmppManagement.css"
import { ChevronLeft, ChevronRight } from 'lucide-react';

const SmppManagement = () => {
  return (
    <div className="smpp-management">
      <div className="smpp-management-header">
        <h1>SMPP Session Management</h1>
        <p>
          Home / Routing Management / SMPP Session Management · Live SMPP bind sessions per client, with drill-down and unbind controls
        </p>
      </div>

      <div className="smpp-card">
        <div className="smpp-controls">
          <div className="entries-selector">
            <span>Show</span>
            <select defaultValue="10">
              <option value="10">10</option>
              <option value="25">25</option>
              <option value="50">50</option>
              <option value="100">100</option>
            </select>
            <span>entries</span>
          </div>
          <div className="search-box">
            <label htmlFor="search">Search:</label>
            <input id="search" type="text" placeholder="Search client name..." />
          </div>
        </div>

        <div className="table-responsive">
          <table className="smpp-table">
            <thead>
              <tr>
                <th>CLIENT NAME <span>↕</span></th>
                <th>SMPP <span>↕</span></th>
                <th>TX <span>↕</span></th>
                <th>RX <span>↕</span></th>
                <th>TRX <span>↕</span></th>
                <th>SUBMIT TPS <span>↕</span></th>
                <th>DELIVER TPS <span>ˆ</span></th>
                <th>DETAILS</th>
                <th>UNBIND</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>abhi-eu</td>
                <td>SMPP-2</td>
                <td>3</td>
                <td>2</td>
                <td>3</td>
                <td>0</td>
                <td>0</td>
                <td><button className="btn-detail">Show Detail</button></td>
                <td><button className="btn-unbind">Unbind</button></td>
              </tr>
              <tr>
                <td>abhi-mea</td>
                <td>SMPP-2</td>
                <td>0</td>
                <td>0</td>
                <td>0</td>
                <td>0</td>
                <td>0</td>
                <td><button className="btn-detail">Show Detail</button></td>
                <td><button className="btn-unbind">Unbind</button></td>
              </tr>
              <tr>
                <td>adcrux</td>
                <td>SMPP-2</td>
                <td>0</td>
                <td>0</td>
                <td>0</td>
                <td>0</td>
                <td>0</td>
                <td><button className="btn-detail">Show Detail</button></td>
                <td><button className="btn-unbind">Unbind</button></td>
              </tr>
              <tr>
                <td>adcruxartltr1</td>
                <td>SMPP-1</td>
                <td>2</td>
                <td>5</td>
                <td>7</td>
                <td>0</td>
                <td>0</td>
                <td><button className="btn-detail">Show Detail</button></td>
                <td><button className="btn-unbind">Unbind</button></td>
              </tr>
              <tr>
                <td>adcruxbsnltr1</td>
                <td>SMPP-2</td>
                <td>0</td>
                <td>0</td>
                <td>0</td>
                <td>0</td>
                <td>0</td>
                <td><button className="btn-detail">Show Detail</button></td>
                <td><button className="btn-unbind">Unbind</button></td>
              </tr>
              <tr>
                <td>adcruxbsnltr1-eu</td>
                <td>SMPP-1</td>
                <td>6</td>
                <td>3</td>
                <td>6</td>
                <td>0</td>
                <td>0</td>
                <td><button className="btn-detail">Show Detail</button></td>
                <td><button className="btn-unbind">Unbind</button></td>
              </tr>
              <tr>
                <td>adcruxbsnltr1-mea</td>
                <td>SMPP-1</td>
                <td>7</td>
                <td>0</td>
                <td>6</td>
                <td>0</td>
                <td>0</td>
                <td><button className="btn-detail">Show Detail</button></td>
                <td><button className="btn-unbind">Unbind</button></td>
              </tr>
              <tr>
                <td>adcruxsim</td>
                <td>SMPP-1</td>
                <td>7</td>
                <td>9</td>
                <td>3</td>
                <td>0</td>
                <td>0</td>
                <td><button className="btn-detail">Show Detail</button></td>
                <td><button className="btn-unbind">Unbind</button></td>
              </tr>
              <tr>
                <td>alertacc22</td>
                <td>SMPP-2</td>
                <td>0</td>
                <td>0</td>
                <td>0</td>
                <td>0</td>
                <td>0</td>
                <td><button className="btn-detail">Show Detail</button></td>
                <td><button className="btn-unbind">Unbind</button></td>
              </tr>
              <tr>
                <td>aliveteleprid-apac</td>
                <td>SMPP-1</td>
                <td>7</td>
                <td>7</td>
                <td>2</td>
                <td>0</td>
                <td>0</td>
                <td><button className="btn-detail">Show Detail</button></td>
                <td><button className="btn-unbind">Unbind</button></td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="smpp-footer">
          <div className="pagination-info">
            Showing 1 to 10 of 155 entries
          </div>
          <div className="pagination">
            <button className="smpp-page-btn smpp-text-btn smpp-icon-btn" aria-label="Previous Page">
                <ChevronLeft size={16} />
            </button>
            <button className="smpp-page-btn active">1</button>
            <button className="smpp-page-btn">2</button>
            <button className="smpp-page-btn">3</button>
            <button className="smpp-page-btn">4</button>
            <button className="smpp-page-btn">5</button>
            <span className="smpp-dots">...</span>
            <button className="smpp-page-btn">16</button>
            <button className="smpp-page-btn smpp-text-btn smpp-icon-btn" aria-label="Next Page">
                <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SmppManagement