import { useContext, useEffect, useState } from "react";
import "./ChangePassword.css";
import { AuthContext } from "../../context/AuthContext";
import { Eye, EyeOff, LockKeyhole } from "lucide-react";
import Endpoints from "../../api/endpoint";

const ChangePassword = () => {
  const { userData } = useContext(AuthContext);

  const [profileData, setProfileData] = useState(null);

  const [currentPasswordVisible, setCurrentPasswordVisible] = useState(false);
  const [newPasswordVisible, setNewPasswordVisible] = useState(false);
  const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);

  const [newPasswordFocused, setNewPasswordFocused] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [toastMessage, setToastMessage] = useState("");

  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  const [errors, setErrors] = useState({
    newPassword: "",
    confirmPassword: "",
  });

  //=========== API to get profile details ==============
  const getProfileDetails = async () => {
    try {
      const payload = {
        loggedInUserName: userData.username,
      };

      const response = await Endpoints.post("profileDetails", payload);

      if (response.code === 16000) {
        setProfileData(response.data.user);
      } else {
        alert(response.message);
      }
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    if (userData?.username) {
      getProfileDetails();
    }
  }, []);

  //=========== Update Password API ==============
  const updatePassword = async () => {
    try {
      setIsUpdatingPassword(true);

      const payload = {
        loggedInUserName: userData.username,
        newPassword: newPassword,
        oldPassword: profileData?.password,
      };

      const response = await Endpoints.post("updatedPassword", payload);

      if (response.code === 16000) {
        setShowUpdateModal(false);
        setToastMessage(response.message);

        setNewPassword("");
        setConfirmPassword("");
        setNewPasswordFocused(false);
        setErrors({ newPassword: "", confirmPassword: "" });

        setProfileData((prev) => ({
          ...prev,
          password: newPassword,
        }));

        setTimeout(() => {
          setToastMessage("");
        }, 3000);
      } else {
        setShowUpdateModal(false);
        alert(response.message);
      }
    } catch (error) {
      console.error(error);
      setShowUpdateModal(false);
      alert("Unable to update password. Please try again.");
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  //=========== Handle Form Submit / Modal trigger ==============
  const handleUpdatePassword = () => {
    let newPassError = "";
    let confirmPassError = "";

    if (!newPassword) {
      newPassError = "New password is required.";
    } else if (newPassword.length < 8) {
      newPassError = "Password must contain at least 8 characters.";
    } else if (!/[A-Z]/.test(newPassword)) {
      newPassError = "Password must contain one uppercase letter.";
    } else if (!/[a-z]/.test(newPassword)) {
      newPassError = "Password must contain one lowercase letter.";
    } else if (!/[0-9]/.test(newPassword)) {
      newPassError = "Password must contain one number.";
    } else if (!/[!@#$%^&*(),.?":{}|<>_\-\\[\]/`~;'+=]/.test(newPassword)) {
      newPassError = "Password must contain one special character.";
    }

    if (!confirmPassword) {
      confirmPassError = "Please re-enter the new password.";
    } else if (newPassword !== confirmPassword) {
      confirmPassError = "Passwords do not match.";
    }

    setErrors({
      newPassword: newPassError,
      confirmPassword: confirmPassError,
    });

    if (newPassError || confirmPassError) return;

    setShowUpdateModal(true);
  };

  // Confirmation state helpers
  const isConfirmMatching = confirmPassword && newPassword === confirmPassword;
  const isConfirmMismatch =
    confirmPassword && newPassword !== confirmPassword;

  const handleCancelPassword = () => {
    // Reset input values
    setNewPassword("");
    setConfirmPassword("");

    // Clear errors
    setErrors((prev) => ({
      ...prev,
      newPassword: "",
      confirmPassword: "",
    }));

    // Reset focus and visibility states
    setNewPasswordFocused(false);
    setNewPasswordVisible(false);
    setConfirmPasswordVisible(false);
};  

  return (
    <div className="change-password">
      {toastMessage && (
        <div className="toast-message">
          <i className="fa-regular fa-circle-check"></i>
          {toastMessage}
        </div>
      )}

      <div className="change-password-header">
        <h1>Change Password</h1>
        <p>Home / Change Password · Update your account password</p>
      </div>

      <div className="change-password-card">
        <div className="password-card-header">
          <h2>Update Password</h2>
          <p>Choose a strong password you don't use elsewhere.</p>
        </div>

        {/* Current Password */}
        <div className="password-form-group">
          <label>Current Password</label>
          <div className="password-input-wrapper">
            <input
              type={currentPasswordVisible ? "text" : "password"}
              value={profileData?.password || ""}
              readOnly
              placeholder="Enter current password"
            />
            <button
              type="button"
              className="password-toggle"
              onClick={() =>
                setCurrentPasswordVisible(!currentPasswordVisible)
              }
            >
              {currentPasswordVisible ? (
                <Eye size={24} />
              ) : (
                <EyeOff size={24} />
              )}
            </button>
          </div>
        </div>

        {/* New Password */}
        <div className="password-form-group">
          <label>New Password</label>
          <div
            className={`password-input-wrapper ${
              errors.newPassword ? "password-input-error" : ""
            }`}
          >
            <input
              type={newPasswordVisible ? "text" : "password"}
              value={newPassword}
              onChange={(e) => {
                setNewPassword(e.target.value);
                if (errors.newPassword) {
                  setErrors((prev) => ({ ...prev, newPassword: "" }));
                }
              }}
              onFocus={() => setNewPasswordFocused(true)}
              onBlur={() => setNewPasswordFocused(false)}
              placeholder="Enter new password"
            />
            <button
              type="button"
              className="password-toggle"
              onClick={() => setNewPasswordVisible(!newPasswordVisible)}
            >
              {newPasswordVisible ? <Eye size={24} /> : <EyeOff size={24} />}
            </button>
          </div>

          {errors.newPassword && (
            <div className="field-error-message">
              <span>⚠</span>
              <p>{errors.newPassword}</p>
            </div>
          )}

          {/* Show requirements only when active/focused */}
          {newPasswordFocused && (
            <div className="password-requirements">
              <div className="password-requirements-title">
                PASSWORD MUST CONTAIN
              </div>

              <div className="password-requirement">
                <span className={newPassword.length >= 8 ? "valid" : ""}>
                  {newPassword.length >= 8 ? "✓" : ""}
                </span>
                <p className={newPassword.length >= 8 ? "valid-text" : ""}>
                  At least 8 characters
                </p>
              </div>

              <div className="password-requirement">
                <span className={/[A-Z]/.test(newPassword) ? "valid" : ""}>
                  {/[A-Z]/.test(newPassword) ? "✓" : ""}
                </span>
                <p className={/[A-Z]/.test(newPassword) ? "valid-text" : ""}>
                  One uppercase letter (A–Z)
                </p>
              </div>

              <div className="password-requirement">
                <span className={/[a-z]/.test(newPassword) ? "valid" : ""}>
                  {/[a-z]/.test(newPassword) ? "✓" : ""}
                </span>
                <p className={/[a-z]/.test(newPassword) ? "valid-text" : ""}>
                  One lowercase letter (a–z)
                </p>
              </div>

              <div className="password-requirement">
                <span className={/[0-9]/.test(newPassword) ? "valid" : ""}>
                  {/[0-9]/.test(newPassword) ? "✓" : ""}
                </span>
                <p className={/[0-9]/.test(newPassword) ? "valid-text" : ""}>
                  One number (0–9)
                </p>
              </div>

              <div className="password-requirement">
                <span
                  className={
                    /[!@#$%^&*(),.?":{}|<>_\-\\[\]/`~;'+=]/.test(newPassword)
                      ? "valid"
                      : ""
                  }
                >
                  {/[!@#$%^&*(),.?":{}|<>_\-\\[\]/`~;'+=]/.test(newPassword)
                    ? "✓"
                    : ""}
                </span>
                <p
                  className={
                    /[!@#$%^&*(),.?":{}|<>_\-\\[\]/`~;'+=]/.test(newPassword)
                      ? "valid-text"
                      : ""
                  }
                >
                  One special character (!@#$...)
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Confirm Password */}
        <div className="password-form-group">
          <label>Confirm Password</label>
          <div
            className={`password-input-wrapper ${
              isConfirmMismatch || errors.confirmPassword
                ? "password-input-error"
                : isConfirmMatching
                ? "password-input-success"
                : ""
            }`}
          >
            <input
              type={confirmPasswordVisible ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value);
                if (errors.confirmPassword) {
                  setErrors((prev) => ({ ...prev, confirmPassword: "" }));
                }
              }}
              placeholder="Re-enter new password"
            />
            <button
              type="button"
              className="password-toggle"
              onClick={() =>
                setConfirmPasswordVisible(!confirmPasswordVisible)
              }
            >
              {confirmPasswordVisible ? (
                <Eye size={24} />
              ) : (
                <EyeOff size={24} />
              )}
            </button>
          </div>

          {/* Mismatch / Blank Error Message */}
          {(isConfirmMismatch || errors.confirmPassword) && (
            <div className="field-error-message">
              <span>⚠</span>
              <p>{errors.confirmPassword || "Passwords do not match."}</p>
            </div>
          )}

          {/* Success Match Message */}
          {isConfirmMatching && !errors.confirmPassword && (
            <div className="field-success-message">
              <span>✓</span>
              <p>Passwords match.</p>
            </div>
          )}
        </div>

        <div className="password-divider"></div>

        <div className="password-footer">
          <button type="button" className="password-cancel-btn" onClick={handleCancelPassword}>
            Cancel
          </button>

          <button
            type="button"
            className="password-update-btn"
            onClick={handleUpdatePassword}
          >
            Update Password
          </button>
        </div>
      </div>

      {showUpdateModal && (
        <div className="password-modal-overlay">
          <div className="password-confirm-modal">
            <div className="password-modal-icon">
              <LockKeyhole size={28} />
            </div>

            <h2>Update password?</h2>

            <p>
              You'll use this new password the next time you sign in.
              <br />
              Continue?
            </p>

            <div className="password-modal-actions">
              <button
                type="button"
                className="password-modal-cancel"
                onClick={() => setShowUpdateModal(false)}
                disabled={isUpdatingPassword}
              >
                Cancel
              </button>

              <button
                type="button"
                className="password-modal-update"
                onClick={updatePassword}
                disabled={isUpdatingPassword}
              >
                {isUpdatingPassword ? "Updating..." : "Yes, update"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChangePassword;