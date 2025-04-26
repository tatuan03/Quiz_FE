import React, { useState, useEffect } from "react";
import { Modal, Button, Container, Navbar, Nav } from "react-bootstrap";
import { Routes, Route, useNavigate } from "react-router-dom";

import Start from "./components/Start";
import Quiz from "./components/Quiz";
import Result from "./components/Result";
import Auth from "./components/Auth";
import CategoryList from "./components/CategoryList";
import QuizList from "./components/QuizList";
import { DataProvider } from "./context/dataContext";
import { checkAuthOnLoad, logoutUser } from "./services/authService";
import './App.css';

function Layout({ user, setUser, showAuthModal, setShowAuthModal, handleLogout }) {
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
                  Welcome, <strong>{user.username || user.name}</strong>
                </span>
                <Button variant="outline-light" size="sm" onClick={handleLogout}>
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
      <Modal show={showAuthModal} onHide={() => setShowAuthModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Login</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Auth setUser={setUser} closeModal={() => setShowAuthModal(false)} />
        </Modal.Body>
      </Modal>

      <Routes>
        <Route path="/" element={<CategoryList />} />
        <Route path="/category/:categoryId" element={<QuizList />} />
        <Route path="/quiz" element={<Quiz />} />
        <Route path="/result" element={<Result />} />
        <Route path="/start" element={<Start user={user} setUser={setUser} />} />
        <Route path="/quiz/:quizId" element={<Quiz />} />
        <Route path="/quiz/:quizId/result" element={<Result />} />
      </Routes>
    </>
  );
}

function App() {
  const [user, setUser] = useState(null);
  const [showAuthModal, setShowAuthModal] = useState(false);

  const handleLogout = async () => {
    await logoutUser();
    setUser(null);
  };

  // Kiểm tra token khi ứng dụng load
  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem("token");
      const username = localStorage.getItem("username");
      if (token && username) {
        const isStillValid = await checkAuthOnLoad(() => {
          setUser(null);
        });
        if (isStillValid) {
          setUser({ token, username });
        }
      }
    };
    initAuth();
  }, []);

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
