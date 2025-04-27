import React, { useState, useEffect } from "react";
import { Modal, Button, Container, Navbar, Nav } from "react-bootstrap";
import { Routes, Route, useNavigate, useLocation } from "react-router-dom";

import Start from "./components/Start";
import Quiz from "./components/Quiz";
import Result from "./components/Result";
import Auth from "./components/Auth";
import CategoryList from "./components/CategoryList";
import QuizList from "./components/QuizList";
import AdminDashboard from "./components/AdminDashboard";
import { DataProvider } from "./context/dataContext";
import { logoutUser } from "./services/authService";
import "./App.css";
import CategoryManager from "./components/CategoryManager";
import MainDashboard from "./components/MainDashboard";
import TestManager from "./components/TestManager";
import QuestionManager from "./components/QuestionManager";

function Layout({
  user,
  setUser,
  showAuthModal,
  setShowAuthModal,
  handleLogout,
}) {
  const navigate = useNavigate();

  return (
    <>
      <Navbar className="navbara">
        <Container>
          <Navbar.Brand
            onClick={() => navigate("/")}
            className="fw-bold fs-2"
            style={{ cursor: "pointer" }}
          >
            🧠 Quiz App
          </Navbar.Brand>
          <Nav className="ms-auto d-flex align-items-center">
            {user ? (
              <>
                <span className="text-white me-2">
                  Welcome, <strong>{user.username}</strong>
                </span>
                {user.isAdmin && (
                  <Button
                    variant="outline-light"
                    size="sm"
                    onClick={() => navigate("/admin")}
                  >
                    Admin Dashboard
                  </Button>
                )}
                <Button
                  variant="outline-light"
                  size="sm"
                  onClick={handleLogout}
                >
                  Logout
                </Button>
              </>
            ) : (
              <Button
                onClick={() => setShowAuthModal(true)}
                className="custom-login-btn"
              >
                Login
              </Button>
            )}
          </Nav>
        </Container>
      </Navbar>

      {/* Modal đăng nhập */}
      <Modal
        show={showAuthModal}
        onHide={() => setShowAuthModal(false)}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Login</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Auth setUser={setUser} closeModal={() => setShowAuthModal(false)} />
        </Modal.Body>
      </Modal>

      <Routes>
        <Route path="/" element={<CategoryList user={user} />} />
        <Route path="/category/:categoryId" element={<QuizList />} />
        <Route
          path="/category/:categoryId/tests"
          element={<TestManager />}
        />{" "}
        {/* Trang quản lý bài test */}
        <Route path="/tests/:testId/questions" element={<QuestionManager />} />
        <Route path="/quiz" element={<Quiz />} />
        <Route path="/result" element={<Result />} />
        <Route
          path="/start"
          element={<Start user={user} setUser={setUser} />}
        />
        <Route path="/quiz/:quizId" element={<Quiz />} />
        <Route path="/quiz/:quizId/result" element={<Result />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/categories" element={<CategoryManager />} />
        <Route path="/main-dashboard" element={<MainDashboard />} />
      </Routes>
    </>
  );
}

function App() {
  const [user, setUser] = useState(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const handleLogout = async () => {
    await logoutUser();
    setUser(null);
  };

  useEffect(() => {
    const fetchUserRole = async () => {
      const token = localStorage.getItem("token");

      if (token) {
        try {
          const response = await fetch(
            "https://final-quiz-server.onrender.com/identity/users/myInfo",
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );

          if (!response.ok) {
            throw new Error("Không thể lấy thông tin người dùng.");
          }

          const data = await response.json();
          const roles = data.result?.roles || [];
          const isAdmin = roles.some((role) => role.name === "ADMIN");

          setUser({ username: data.result.username, isAdmin });

          // Chỉ điều hướng đến /main-dashboard nếu người dùng đang ở trang gốc "/"
          if (isAdmin && location.pathname === "/") {
            navigate("/main-dashboard");
          }
        } catch (err) {
          console.error("Lỗi khi lấy vai trò người dùng:", err);
          setUser(null);
        }
      }
    };

    fetchUserRole();
  }, [navigate, location.pathname]);

  return (
    <DataProvider>
      <Layout
        user={user}
        setUser={setUser}
        showAuthModal={showAuthModal}
        setShowAuthModal={setShowAuthModal}
        handleLogout={handleLogout}
      />
    </DataProvider>
  );
}

export default App;
