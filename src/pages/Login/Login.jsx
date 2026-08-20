import { useState, useContext, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import Endpoints from "../../api/endpoint";
import "./Login.css";
import telspielLogo from "../../assets/logo-icon.png";
import "@fortawesome/fontawesome-free/css/all.min.css";

function Login() {
  const { setUserData, setCreditNotifications } = useContext(AuthContext);
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState("");

  const [showOtpScreen, setShowOtpScreen] = useState(false);
  const [otp, setOtp] = useState(["", "", "", ""]);
  const [otpExpiryTime, setOtpExpiryTime] = useState(0);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);

  const [usernameError, setUsernameError] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const [otpMessage, setOtpMessage] = useState("");
  const [otpMessageType, setOtpMessageType] = useState("");

  const otpRefs = useRef([]);

  useEffect(() => {
  if (!showOtpScreen || otpExpiryTime <= 0) {
    return;
  }

  const timer = setInterval(() => {
    setOtpExpiryTime((prev) => {
      if (prev <= 1) {
        clearInterval(timer);
        return 0;
      }

      return prev - 1;
    });
  }, 1000);

  return () => clearInterval(timer);
}, [showOtpScreen, otpExpiryTime]);


 //===========Login API Call==============
 const login = async (e) => {
  e.preventDefault();

  let hasError = false;

  setLoginError("");

  if (!username.trim()) {
    setUsernameError("Username is required.");
    hasError = true;
  } else {
    setUsernameError("");
  }

  if (!password.trim()) {
    setPasswordError("Password is required.");
    hasError = true;
  } else {
    setPasswordError("");
  }

  if (hasError) {
    return;
  }

  try {
    const payload = {
      username,
      password,
    };

    const response = await Endpoints.post(
      "login",
      payload
    );

    console.log("Login Response:", response);

    if (response.code === 1000) {
      setLoginError("");

      if (response.otpRequired === true) {
        setOtp(["", "", "", ""]);
        setOtpExpiryTime(
          response.otpExpiryTime || 50
        );
        setShowOtpScreen(true);

        setTimeout(() => {
          otpRefs.current[0]?.focus();
        }, 100);

        return;
      }

      await completeLogin(response);
    } else {
      setLoginError(
        response.message || "Login Failed"
      );
    }
  } catch (error) {
    console.error("Login Error:", error);

    setLoginError(
      error?.message ||
      "Something went wrong"
    );
  }
};

 const verifyOtp = async () => {
  const enteredOtp = otp.join("");

  if (enteredOtp.length !== 4) {
    alert("Please enter the complete OTP");
    return;
  }

  setIsVerifyingOtp(true);
  setOtpMessage("");
  setOtpMessageType("");

  try {
    const payload = {
      password,
      userOtp: enteredOtp,
      username,
    };

    const response = await Endpoints.post(
      "verifyOtp",
      payload
    );

    console.log("Verify OTP Response:", response);

    if (response.code === 1000) {
      setOtpMessage(
        "OTP verified. Signing you in..."
      );
      setOtpMessageType("success");

      await completeLogin(response);
    } else {
      const attemptsRemaining =
        response.attemptsRemaining ??
        response.data?.attemptsRemaining ??
        0;

      setOtpMessage(
        `Incorrect OTP. ${attemptsRemaining} ${
          attemptsRemaining === 1
            ? "attempt"
            : "attempts"
        } remaining.`
      );

      setOtpMessageType("error");

      setOtp([ "", "", "", "", ]);

      setTimeout(() => {
        otpRefs.current[0]?.focus();
      }, 100);
    }
  } catch (error) {
    console.error(
      "Verify OTP Error:",
      error
    );

    setOtpMessage(
      "Unable to verify OTP. Please try again."
    );

    setOtpMessageType("error");
  } finally {
    setIsVerifyingOtp(false);
  }
};

const resendOtp = async () => {
  if (otpExpiryTime > 0) {
    return;
  }

  try {
    const payload = {
      username,
      password,
    };

    const response = await Endpoints.post(
      "login",
      payload
    );

    console.log(
      "Resend OTP Response:",
      response
    );

    if (
      response.code === 1000 &&
      response.otpRequired === true
    ) {
      setOtp([ "", "", "", "", ]);

      setOtpMessage("");
      setOtpMessageType("");

      setOtpExpiryTime(
        response.otpExpiryTime || 50
      );

      setTimeout(() => {
        otpRefs.current[0]?.focus();
      }, 100);
    } else {
      alert(
        response.message ||
        "Unable to resend OTP"
      );
    }
  } catch (error) {
    console.error(
      "Resend OTP Error:",
      error
    );

    alert(
      "Unable to resend OTP"
    );
  }
};

  const completeLogin = async (response) => {
    try {
      const userData = {
        username: response.data?.username || username,
        role: response.data?.role,
        lastLoginTime: response.data?.lastLoginTime,
        lastLoginIp: response.data?.lastLoginIp,
        logoUrl: response.data?.logoUrl,
        otpRequired: false,
        authJwtToken: response.authJwtToken,
      };

      localStorage.setItem(
        "userData",
        JSON.stringify(userData)
      );

      setUserData(userData);

      try {
        const notificationUrl = Endpoints.get(
          "creditAlertNotification"
        );

        const notificationResponse = await fetch(
          `${notificationUrl}?userName=${encodeURIComponent(
            userData.username
          )}`,
          {
            method: "GET",
            headers: {
              Authorization: userData.authJwtToken,
              "Content-Type": "application/json",
            },
          }
        );

        const notificationData =
          await notificationResponse.json();

        console.log(
          "Credit Alert Notification Response:",
          notificationData
        );

        if (Array.isArray(notificationData)) {
          setCreditNotifications(notificationData);

          localStorage.setItem(
            "creditNotifications",
            JSON.stringify(notificationData)
          );
        } else if (
          notificationData?.data &&
          Array.isArray(notificationData.data)
        ) {
          setCreditNotifications(
            notificationData.data
          );

          localStorage.setItem(
            "creditNotifications",
            JSON.stringify(notificationData.data)
          );
        } else {
          setCreditNotifications([]);

          localStorage.setItem(
            "creditNotifications",
            JSON.stringify([])
          );
        }
      } catch (notificationError) {
        console.error(
          "Credit Notification API Error:",
          notificationError
        );

        setCreditNotifications([]);

        localStorage.setItem(
          "creditNotifications",
          JSON.stringify([])
        );
      }

      navigate("/dashboard");
    } catch (error) {
      console.error(
        "Complete Login Error:",
        error
      );

      alert("Unable to complete login");
    }
  };

  const handleOtpChange = (value, index) => {
    if (!/^\d?$/.test(value)) {
      return;
    }

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 3) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (e, index) => {
  if (e.key === "Backspace" && !otp[index] && index > 0) {
    otpRefs.current[index - 1]?.focus();
  }

  if (e.key === "Enter") {
    e.preventDefault();

    const enteredOtp = otp.join("");

    if (enteredOtp.length === 4 && !isVerifyingOtp) {
      verifyOtp();
    }
  }
};

  const backToLogin = () => {
    setShowOtpScreen(false);
    setOtp(["", "", "", ""]);
    setOtpExpiryTime(0);
  };

  if (showOtpScreen) {
    return (
      <div className="login-page">
        <div className="login-card otp-card">
          <div className="brand-section">
            <img
              src={telspielLogo}
              alt="TelSpiel"
              className="brand-logo"
            />
          </div>

          <h1>Verify it's you</h1>

          <p className="subtitle">
            Two-factor authentication keeps
            your account secure.
          </p>

          {otpMessage ? (
            <div
              className={`otp-message ${
                otpMessageType === "success"
                  ? "otp-message-success"
                  : "otp-message-error"
              }`}
            >
              <span className="otp-message-icon">
                {otpMessageType === "success"
                  ? "✓"
                  : "!"}
              </span>

              <span>{otpMessage}</span>
            </div>
          ) : (
            <p className="otp-description">
              Enter the OTP sent to your
              registered number
            </p>
          )}


          <div className="otp-input-container">
            {otp.map((digit, index) => (
              <input
                key={index}
                ref={(element) => {
                  otpRefs.current[index] =
                    element;
                }}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) =>
                  handleOtpChange(
                    e.target.value,
                    index
                  )
                }
                onKeyDown={(e) =>
                  handleOtpKeyDown(e, index)
                }
                className="otp-input"
              />
            ))}
          </div>

          <button
            type="button"
            className="verify-otp-button"
            onClick={verifyOtp}
            disabled={
              isVerifyingOtp ||
              otp.some((digit) => digit === "")
            }
          >
            Verify OTP
          </button>

          <div className="otp-resend">
            <span>
              Not received yet?{" "}
            </span>

            {otpExpiryTime > 0 ? (
              <span>
                Resend OTP in{" "}
                <strong>
                  {otpExpiryTime}s
                </strong>
              </span>
            ) : (
              <button
                type="button"
                onClick={resendOtp}
                className="resend-otp-button"
              >
                Resend OTP
              </button>
            )}
          </div>

          <button
            type="button"
            className="back-login-button"
            onClick={backToLogin}
          >
            ← Back to login
          </button>

          <div className="copyright">
            © All Rights Reserved
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="brand-section">
          <img
            src={telspielLogo}
            alt="Habitic Quicksmart"
            className="brand-logo"
          />
        </div>

        <h1>Welcome back</h1>

        <p className="subtitle">
          Sign in to your admin dashboard.
        </p>

        {loginError && (
          <div className="login-error">
            <span className="login-error-icon">!</span>
            <span>{loginError}</span>
          </div>
        )}

        <form onSubmit={login}>
         <div className="input-group">
          <label>Username</label>

          <div
            className={`input-wrapper ${
              usernameError ? "input-error" : ""
            }`}
          >
            <input
              type="text"
              placeholder="Enter username"
              value={username}
              onChange={(e) => {
                setUsername(e.target.value);

                if (e.target.value.trim()) {
                  setUsernameError("");
                }
              }}
            />

            <i className="fa-regular fa-user"></i>
          </div>

          {usernameError && (
            <div className="login-field-error">
              <span className="error-icon">!</span>
              {usernameError}
            </div>
          )}
        </div>

          <div className="input-group">
            <label>Password</label>

            <div
              className={`input-wrapper ${
                passwordError ? "input-error" : ""
              }`}
            >
              <input
                type={
                  showPassword
                    ? "text"
                    : "password"
                }
                placeholder="Enter password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);

                  if (e.target.value.trim()) {
                    setPasswordError("");
                  }
                }}
              />

              <i
                className={`fa-solid ${
                  showPassword
                    ? "fa-eye"
                    : "fa-eye-slash"
                }`}
                onClick={() =>
                  setShowPassword(
                    !showPassword
                  )
                }
              ></i>
            </div>

            {passwordError && (
              <div className="login-field-error">
                <span className="error-icon">!</span>
                {passwordError}
              </div>
            )}
          </div>

          <button type="submit" className="login-card-button">
            Login
          </button>
        </form>

        <div className="copyright">
          © All Rights Reserved
        </div>
      </div>
    </div>
  );
}

export default Login;