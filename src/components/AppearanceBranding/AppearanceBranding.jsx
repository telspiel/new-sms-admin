import React from 'react'
import "./AppearanceBranding.css";
import { Layers, Send, Save } from "lucide-react";

const AppearanceBranding = () => {
  return (
    <div className="appearance-branding">
        {/* Header */}
      <div className="appearance-branding-header">
        <div className='brand-heading'>
          <h1>Appearance & Branding</h1>
          <p>
            Home / Appearance · White-label the platform for your organization
          </p>
        </div>

        <button className="appearance-save-btn">
          <Save size={18} strokeWidth={1.8} />
          <span>Save changes</span>
        </button>
      </div>

      {/* Branding Card */}
      <div className="branding-card">

        {/* Card Heading */}
        <div className="branding-card-header">
          <div className="branding-title">
            <Layers size={20} strokeWidth={2} />
            <h2>Brand Name, Logo & Favicon</h2>
          </div>

          <p>
            Set your brand name, logo and browser favicon. They'll appear
            across the admin panel once saved.
          </p>
        </div>

        {/* Brand Name */}
        <div className="branding-field">
          <label>Brand / Product Name</label>

          <input
            type="text"
            value="TelSpiel"
            readOnly
          />
        </div>

        {/* Logo */}
        <div className="branding-field">
          <label>Logo</label>

          <div className="upload-box">

            <div className="upload-icon">
              <Send size={32} strokeWidth={1.8} />
            </div>

            <div className="upload-content">
              <h3>Upload your logo</h3>

              <p>
                PNG, JPG or SVG · max 1 MB · square works best · crop after
                choosing
              </p>

              <button className="choose-file-btn">
                Choose file
              </button>
            </div>

          </div>
        </div>

        {/* Favicon */}
        <div className="branding-field favicon-field">
          <label>Favicon</label>

          <div className="upload-box">

            <div className="upload-icon">
              <Send size={32} strokeWidth={1.8} />
            </div>

            <div className="upload-content">
              <h3>Upload your favicon</h3>

              <p>
                PNG, ICO or SVG · max 512 KB · square, 32×32 or 512×512
                works best · crop after choosing
              </p>

              <button className="choose-file-btn">
                Choose file
              </button>
            </div>

          </div>
        </div>

      </div>
    </div>
  )
}

export default AppearanceBranding
