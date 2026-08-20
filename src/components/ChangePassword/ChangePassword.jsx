import React from 'react'
import "./ChangePassword.css";
import { Eye, EyeOff } from "lucide-react";

const ChangePassword = () => {
  return (
    <div className="change-password">
        <div className="change-password-header">
        <h1>Change Password</h1>
        <p>
          Home / Change Password · Update your account password
        </p>
      </div>

       {/* Password Card */}
      <div className="change-password-card">

        {/* Card Header */}
        <div className="password-card-header">
          <h2>Update Password</h2>

          <p>
            Choose a strong password you don't use elsewhere.
          </p>
        </div>

        {/* Current Password */}
        <div className="password-form-group">
          <label>Current Password</label>

          <div className="password-input-wrapper">
            <input
              type="password"
              placeholder="Enter current password"
            />

            <button
              type="button"
              className="password-toggle"
            >
              <EyeOff size={24} />
            </button>
          </div>
        </div>

        {/* New Password */}
        <div className="password-form-group">
          <label>New Password</label>

          <div className="password-input-wrapper">
            <input
              type="password"
              placeholder="Enter new password"
            />

            <button
              type="button"
              className="password-toggle"
            >
              <EyeOff size={24} />
            </button>
          </div>
        </div>

        {/* Confirm Password */}
        <div className="password-form-group">
          <label>Confirm Password</label>

          <div className="password-input-wrapper">
            <input
              type="password"
              placeholder="Re-enter new password"
            />

            <button
              type="button"
              className="password-toggle"
            >
              <EyeOff size={24} />
            </button>
          </div>
        </div>

        {/* Divider */}
        <div className="password-divider"></div>

        {/* Footer Buttons */}
        <div className="password-footer">
          <button
            type="button"
            className="password-cancel-btn"
          >
            Cancel
          </button>

          <button
            type="button"
            className="password-update-btn"
          >
            Update Password
          </button>
        </div>

      </div>
    </div>
  )
}

export default ChangePassword
