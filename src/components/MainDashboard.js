import React from "react";
import { useNavigate } from "react-router-dom";
import "./MainDashboard.css";

const MainDashboard = () => {
  const navigate = useNavigate();

  return (
    <div className="main-dashboard">
      <h1>Trang Quản Lý Chính</h1>
      <div className="dashboard-options">
        <button
          className="dashboard-btn"
          onClick={() => navigate("/admin")}
        >
          Quản lý Người Dùng
        </button>
        <button
          className="dashboard-btn"
          onClick={() => navigate("/categories")}
        >
          Quản lý Category
        </button>
      </div>
    </div>
  );
};

export default MainDashboard;