import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import Endpoints from "../../api/endpoint";
import "./Login.css";
import telspielLogo from "../../assets/logo-icon.png";
import '@fortawesome/fontawesome-free/css/all.min.css';

function Login() {
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);

  const { setUserData } =
  useContext(AuthContext);

  const login = async (e) => {
    e.preventDefault();

    try {
      const payload = {
        username,
        password,
      };

      const response = await Endpoints.post(
        "login",
        payload
      );

      if (response.code === 1000) {
        const userData = {
            username: response.data.username,
            role: response.data.role,
            lastLoginTime: response.data.lastLoginTime,
            lastLoginIp: response.data.lastLoginIp,
            otpRequired: response.otpRequired,
            authJwtToken: response.authJwtToken,
        };

        localStorage.setItem(
            "userData",
            JSON.stringify(userData)
            );

            setUserData(userData);


        console.log("Login Successfully");

        navigate("/dashboard");
        } else {
        alert(response.message || "Login Failed");
      }
    } catch (error) {
      console.error("Login Error:", error);
      alert("Something went wrong");
    }
  };

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
        Log in to your admin dashboard.
        </p>

        <form onSubmit={login}>

        <div className="input-group">
            <label>Username</label>

            <div className="input-wrapper">
            <input
                type="text"
                placeholder="Enter username"
                value={username}
                onChange={(e) =>
                setUsername(e.target.value)
                }
            />

            <i className="fa-regular fa-user"></i>
            </div>
        </div>

        <div className="input-group">
            <label>Password</label>

            <div className="input-wrapper">
            <input
                type={showPassword ? "text" : "password"}
                placeholder="Enter password"
                value={password}
                onChange={(e) =>
                setPassword(e.target.value)
                }
            />

            <i
                className={`fa-solid ${
                showPassword
                    ? "fa-eye"
                    : "fa-eye-slash"
                }`}
                onClick={() =>
                setShowPassword(!showPassword)
                }
            ></i>
            </div>
        </div>

        <button type="submit">
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