import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import "./Profile.css";
import {
  Mail,
  Phone,
  Building2,
  Lock,
} from "lucide-react";
import Endpoints from "../../api/endpoint";

const Profile = () => {

   const { userData } = useContext(AuthContext);
   const navigate = useNavigate();
   const [loading, setLoading] = useState(false);

   const logoUrl = userData?.logoUrl || "-";

   const [profileData, setProfileData] = useState({
    username: "",
    emailID: "",
    mobileNumber: "",
    organization: "",
    department: "",
    });

    //===============API to get User Info Details==============
    const getProfileDetails = async () => {
        setLoading(true);
     try {
        const payload = {
        loggedInUserName: userData.username,
      };

        const response = await Endpoints.post(
        "profileDetails",
        payload
        );

      if (response.code === 16000) {
        setProfileData(response.data.user);
      } else {
        alert(response.message);
      }
     } catch (error) {
        console.error(error);
     } finally {
    setLoading(false);
     }
    };

    useEffect(() => {
    if (userData?.username) {
        getProfileDetails();
    }
    }, [userData]);

  return (
   <div className="my-profile">
      <div className="my-profile-header">
        <h1>My Profile</h1>
        <p>
          Home / My Profile · View and update your account details
        </p>
      </div>

        {loading ? (
        <div className="profile-loader">
            <div className="spinner"></div>
            <p>Loading Your Profile...</p>
        </div>
        ) : (
      <div className="profile-content">
        <div className="profile-card">

        <div className="profile-avatar">
        <div>
          <img
            src={logoUrl}
            alt="Company Logo"
            className="profile-header-logo"
          />
        </div>
        </div>

        <h2>{profileData.username}</h2>

        <div className="profile-divider"></div>

         <div className="profile-info">
        <Mail size={18} />
        <span>{profileData.emailID || "Not Available"}</span>
        </div>

        <div className="profile-info">
        <Phone size={18} />
        <span>{profileData.mobileNumber || "Not Available"}</span>
        </div>

          <div className="profile-info">
            <Building2 size={18} />
            <span>{profileData.organization}</span>
          </div>

         <button
            className="password-btn"
            onClick={() => navigate("/change-password")}
            >
            <Lock size={18} />
            Change Password
        </button>

        </div>

        {/* Right Card */}
        <div className="account-card">

          <h2>Account Information</h2>

          <p className="account-subtitle">
            Update your contact details. Some fields are managed by your administrator.
          </p>

          <div className="profile-form-grid">
            <div className="profile-form-group">
            <label>User Name</label>
            <div className="profile-input-wrapper">
              <input
                type="text"
                value={profileData.username}
                disabled
              />
              <Lock size={16} className="lock-icon" />
            </div>
          </div>

             <div className="profile-form-group">
                <label>Email ID *</label>
                <div className="profile-input-wrapper">
                <input
                  type="email"
                  value={profileData.emailID || "Not Available"}
                  onChange={(e) =>
                    setProfileData({
                      ...profileData,
                      emailID: e.target.value,
                    })
                  }
                  disabled
                />
                <Lock size={16} className="lock-icon" />
              </div>
            </div>

           <div className="profile-form-group">
                <label>Mobile Number *</label>
               <div className="profile-input-wrapper">
                <input
                  type="text"
                  value={profileData.mobileNumber || "Not Available"}
                  onChange={(e) =>
                    setProfileData({
                      ...profileData,
                      mobileNumber: e.target.value,
                    })
                  }
                  disabled
                />
                <Lock size={16} className="lock-icon" />
              </div>
            </div>

             <div className="profile-form-group">
                <label>Organization</label>

              <div className="profile-input-wrapper">
              <input
                type="text"
                value={profileData.organization}
                disabled
              />
              <Lock size={16} className="lock-icon" />
            </div>
            </div>

           <div className="profile-form-group">
            <label>Department</label>

           <div className="profile-input-wrapper">
            <input
              type="text"
              value={profileData.department}
              disabled
            />
            <Lock size={16} className="lock-icon" />
          </div>
        </div>

          </div>

          <div className="locked-note">
            <Lock size={16} />
            <span>
              Locked fields are managed by your administrator and can't be edited here.
            </span>
          </div>
        </div>

      </div>
      )}
    </div>
  )
}

export default Profile
