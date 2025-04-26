import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getValidAccessToken } from "../services/authService";

const CategoryList = () => {
  const [categories, setCategories] = useState([]);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const token = await getValidAccessToken();
        if (!token) {
          throw new Error("Unauthorized: Token might be invalid or expired.");
        }

        const response = await fetch("https://final-quiz-server.onrender.com/identity/categories", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.status === 401) {
          // Redirect to login if unauthorized
          navigate("/login");
          return;
        }

        if (!response.ok) {
          throw new Error("Failed to fetch categories");
        }

        const data = await response.json();
        setCategories(data.result);
      } catch (err) {
        console.error("Failed to load categories", err);
        setError(err.message);

        // Redirect to login if token is invalid or expired
        if (err.message.includes("Unauthorized")) {
          navigate("/login");
        }
      }
    };

    fetchCategories();
  }, [navigate]);

  if (error) {
    return <div className="text-center mt-5 text-danger">{error}</div>;
  }

  const handleCategoryClick = (categoryId) => {
    navigate(`/category/${categoryId}`);
  };

  return (
    <div className="container mt-5">
      <h2 className="text-center mb-4">Chọn chủ đề</h2>
      <div className="row justify-content-center">
        {categories.length > 0 ? (
          categories.map((category) => (
            <div
              key={category.id}
              className="col-md-4 mb-3"
              onClick={() => handleCategoryClick(category.id)}
              style={{
                cursor: "pointer",
                background: "#f5f5f5",
                padding: 20,
                borderRadius: 10,
              }}
            >
              <h5>{category.title}</h5>
              <p className="text-muted">{category.description}</p>
            </div>
          ))
        ) : (
          <p className="text-center">No categories available or failed to load.</p>
        )}
      </div>
    </div>
  );
};

export default CategoryList;