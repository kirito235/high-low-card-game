import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../css/Signup.css";
import api from "../api/axiosInstance";

const Signup = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState([]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setErrors([]);

    // Client-side validation
    const tempErrors = [];
    if (!form.username.trim()) tempErrors.push("Username is required");
    if (!form.email.trim()) tempErrors.push("Email is required");
    if (!form.password.trim()) tempErrors.push("Password is required");
    if (form.password !== form.confirmPassword)
      tempErrors.push("Passwords do not match");

    if (tempErrors.length > 0) {
      setErrors(tempErrors);
      return;
    }

    try {
      const response = await api.post(`/auth/signup`, {
        username: form.username,
        email: form.email,
        password: form.password,
      });

      localStorage.setItem("jwt", response.data.jwt);
      navigate("/login");
    } catch (err) {
      const res = err.response?.data;
      if (!res) {
        setErrors(["Network error. Please try again later."]);
        return;
      }
      const backendErrors = res.validationErrors
        ? Object.values(res.validationErrors) 
        : [];

      const allErrors =
        backendErrors.length > 0
          ? backendErrors
          : [res.message || "Signup failed. Please try again."];

      setErrors(allErrors);
    }
  };

  return (
    <div className="signup-container">
      <div className="signup-card">
        <h2 className="signup-title">Sign Up</h2>

        {/* Error List */}
        {errors.length > 0 && (
          <ul className="error-list">
            {errors.map((error, idx) => (
              <li key={idx} className="error-message">
                {error}
              </li>
            ))}
          </ul>
        )}

        <form onSubmit={handleSignup}>
          <div className="form-group">
            <label>Username</label>
            <input
              type="text"
              name="username"
              value={form.username}
              onChange={handleChange}
              required
              placeholder="Enter your username"
            />
          </div>

          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              required
              placeholder="Enter your email"
            />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              required
              placeholder="Enter your password"
            />
          </div>

          <div className="form-group">
            <label>Confirm Password</label>
            <input
              type="password"
              name="confirmPassword"
              value={form.confirmPassword}
              onChange={handleChange}
              required
              placeholder="Re-enter your password"
            />
          </div>

          <button type="submit" className="signup-button">
            Sign Up
          </button>
        </form>

        <p className="login-text">
          Already have an account?{" "}
          <Link to="/login" className="login-link">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Signup;
