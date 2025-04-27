import React, { useState } from "react";
import { useNavigate } from "react-router-dom"; // Nhập useNavigate
import { saveAuthToLocal } from "../services/authService";

const Auth = ({ setUser, closeModal }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    firstName: "",
    lastName: "",
    dob: "",
  });
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate(); // Khởi tạo navigate

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    const url = isLogin
      ? "https://final-quiz-server.onrender.com/identity/auth/token"
      : "https://final-quiz-server.onrender.com/identity/users";

    const payload = isLogin
      ? { username: formData.username, password: formData.password }
      : {
          username: formData.username,
          password: formData.password,
          firstName: formData.firstName,
          lastName: formData.lastName,
          dob: formData.dob,
        };

    console.log("Payload gửi đến API:", payload);

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      console.log("Phản hồi từ API:", data);

      if (!response.ok || (data.code && data.code !== 1000)) {
        throw new Error(data.message || "Có lỗi xảy ra");
      }

      if (!isLogin) {
        console.log("Đăng ký thành công:", data);
        setIsLogin(true); // Chuyển sang màn hình đăng nhập sau khi đăng ký thành công
      }

      if (isLogin && data.result?.token) {
        console.log("Lưu token vào localStorage...");
        saveAuthToLocal({
          token: data.result.token,
          refreshToken: data.result.refreshToken || null, // Xử lý trường hợp thiếu refreshToken
          username: formData.username,
        });

        setUser({
          token: data.result.token,
          username: formData.username,
        });

        closeModal();
      }
    } catch (err) {
      console.error("Lỗi khi đăng nhập:", err);
      setError(err.message || "Có lỗi xảy ra");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-header text-center mb-4">
        <h3 className="auth-title">
          {isLogin ? "Chào mừng quay lại" : "Tạo tài khoản"}
        </h3>
        <p className="auth-subtitle">
          {isLogin ? "Đăng nhập để tiếp tục" : "Gia nhập để bắt đầu"}
        </p>
      </div>

      {error && (
        <div
          className="alert alert-danger alert-dismissible fade show"
          role="alert"
        >
          {error}
          <button
            type="button"
            className="btn-close"
            onClick={() => setError(null)}
            aria-label="Close"
          ></button>
        </div>
      )}

      <form onSubmit={handleSubmit} className="auth-form">
        {!isLogin && (
          <>
            <div className="form-group mb-3">
              <label className="form-label" htmlFor="firstName">
                Tên
              </label>
              <input
                type="text"
                name="firstName"
                className="form-control"
                placeholder="Nhập tên của bạn"
                value={formData.firstName}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group mb-3">
              <label className="form-label" htmlFor="lastName">
                Họ
              </label>
              <input
                type="text"
                name="lastName"
                className="form-control"
                placeholder="Nhập họ của bạn"
                value={formData.lastName}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group mb-3">
              <label className="form-label" htmlFor="dob">
                Ngày sinh
              </label>
              <input
                type="date"
                name="dob"
                className="form-control"
                value={formData.dob}
                onChange={handleChange}
                required
              />
            </div>
          </>
        )}

        <div className="form-group mb-3">
          <label className="form-label" htmlFor="username">
            Tên đăng nhập
          </label>
          <input
            type="text"
            name="username"
            className="form-control"
            placeholder="Nhập tên đăng nhập"
            value={formData.username}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group mb-4">
          <label className="form-label" htmlFor="password">
            Mật khẩu
          </label>
          <input
            type="password"
            name="password"
            className="form-control"
            placeholder="Nhập mật khẩu"
            value={formData.password}
            onChange={handleChange}
            required
          />
        </div>

        <button
          type="submit"
          className="btn btn-primary w-100 py-2 mb-3"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <span
                className="spinner-border spinner-border-sm me-2"
                role="status"
                aria-hidden="true"
              ></span>
              {isLogin ? "Đang đăng nhập..." : "Đang tạo tài khoản..."}
            </>
          ) : isLogin ? (
            "Đăng nhập"
          ) : (
            "Đăng ký"
          )}
        </button>
      </form>

      <div className="auth-footer text-center mt-3">
        <button className="btn btn-link" onClick={() => setIsLogin(!isLogin)}>
          {isLogin
            ? "Chưa có tài khoản? Đăng ký"
            : "Đã có tài khoản? Đăng nhập"}
        </button>
      </div>
    </div>
  );
};

export default Auth;
