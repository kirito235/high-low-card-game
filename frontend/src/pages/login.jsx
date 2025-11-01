import  { useState } from "react";
import { GoogleLogin } from "@react-oauth/google";
import { Link, useNavigate } from "react-router-dom";
import "../css/Login.css";
import api from "../api/axiosInstance";

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const response = await api.post(`/auth/login`, { email, password });
      localStorage.setItem("jwt", response.data.jwt);
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Invalid credentials");
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    const token = credentialResponse.credential;
    const response = await api.post(`/auth/google`, { token });
    localStorage.setItem("jwt", response.data.jwt);
    navigate("/game");
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h2 className="login-title">Login</h2>

        {error && <p className="error-message">{error}</p>}

        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="Enter your email"
            />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="Enter your password"
            />
          </div>

          <button type="submit" className="login-button">
            Login
          </button>
        </form>

        <div className="google-login">
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={() => console.log("Google login failed")}
          />
        </div>

        <p className="signup-text">
          Don’t have an account?{" "}
          <Link to="/signup" className="signup-link">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
