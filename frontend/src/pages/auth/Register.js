import React, { useState } from "react";
import Navbar from "../../components/Navbar";
import SignLogo from "../../assets/images/logo-w.png";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import Loader from "../../components/Loader";
import axios from "axios";
import Cookies from "js-cookie";

const Register = () => {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [cpassword, setCPassword] = useState("");
  const [isChecked, setIsChecked] = useState(false);
  const [loading, setLoading] = useState(false);
  const [passwordValid, setPasswordValid] = useState(false);
  const [passwordMatch, setPasswordMatch] = useState(true);

  const passwordRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{10,}$/;

  const handleCheckboxChange = (e) => {
    setIsChecked(e.target.checked);
  };

  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
    setPasswordValid(passwordRegex.test(e.target.value));
  };

  const handleConfirmPasswordChange = (e) => {
    setCPassword(e.target.value);
    setPasswordMatch(password === e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (name === "") {
      toast.error("Name is required!");
      return;
    } else if (email === "") {
      toast.error("Email is required!");
      return;
    } else if (password === "") {
      toast.error("Password is required!");
      return;
    } else if (!passwordValid) {
      toast.error(
        "Password must be at least 10 characters long, include an uppercase letter, a lowercase letter, a number, and a special character."
      );
      return;
    } else if (!passwordMatch) {
      toast.error("Passwords do not match!");
      return;
    } else if (!isChecked) {
      toast.error("You must agree to the Terms & Privacy before registering.");
      return;
    }

    setLoading(true);

    try {
      const res = await axios.post(
        `${process.env.REACT_APP_API}/api/v1/auth/register`,
        {
          name,
          email,
          password,
        }
      );

      if (res.data.success) {
        toast.success(res.data.message);
        Cookies.set("protectverify", res.data.protect, { expires: 1 });
        Cookies.set("useremail", res.data.user.email, { expires: 1 });
        navigate("/verify-email");
      } else {
        toast.error(res.data.message);
      }
    } catch (error) {
      toast.error(error.message || "Something went wrong!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      {loading && <Loader />}
      <div className="mt-top">
        <div className="reg-main">
          <div className="reg-sub">
            <div className="reg-left">
              <p className="text-white login-wel">WELCOME TO</p>
              <h3 className="text-white login-t">
                Premier Quantitative Strategies (PQS)
              </h3>
              <p className="text-white login-wel">Create Account</p>
            </div>
            <div className="reg-right">
              <img src={SignLogo} alt="" />
              <h3>Create an Account</h3>
              <form onSubmit={handleSubmit}>
                <div className="auth-inp-main">
                  <label className="form-label">Name*</label>
                  <input
                    type="text"
                    className="auth-inp"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
                <div className="auth-inp-main">
                  <label className="form-label">Email*</label>
                  <input
                    type="email"
                    className="auth-inp"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <div className="auth-inp-main">
                  <label className="form-label">Password*</label>
                  <input
                    type="password"
                    className="auth-inp"
                    value={password}
                    onChange={handlePasswordChange}
                  />
                  {!passwordValid && password.length > 0 && (
                    <p className="error-text">
                      Password must be greater than 10 characters, include
                      uppercase, lowercase, number & special character.
                    </p>
                  )}
                </div>
                <div className="auth-inp-main">
                  <label className="form-label">Confirm Password*</label>
                  <input
                    type="password"
                    className="auth-inp"
                    value={cpassword}
                    onChange={handleConfirmPasswordChange}
                  />
                  {!passwordMatch && cpassword.length > 0 && (
                    <p className="error-text">Passwords do not match.</p>
                  )}
                </div>
                <div className="d-flex">
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={handleCheckboxChange}
                  />
                  <label className="form-label ms-3">
                    I agree to the{" "}
                    <Link to="/terms&conditions" className="text-coomon-color">
                      Terms & Conditions
                    </Link>
                  </label>
                </div>
                <div className="my-3">
                  <button
                    type="submit"
                    className="sub-btn-b w-100"
                    disabled={loading}
                  >
                    {loading ? "Signing Up..." : "SIGN UP"}
                  </button>
                </div>
                <p className="text-center form-label">
                  Already have an account?{" "}
                  <Link className="text-coomon-color" to="/login">
                    Login
                  </Link>
                </p>
              </form>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Register;
