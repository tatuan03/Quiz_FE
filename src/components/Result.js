import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const Result = () => {
  const navigate = useNavigate();
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchUserId = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      throw new Error("Không tìm thấy token. Vui lòng đăng nhập.");
    }

    const response = await fetch("https://final-quiz-server.onrender.com/identity/users/myInfo", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Lỗi từ API /myInfo:", errorData);
      throw new Error("Không thể lấy thông tin người dùng.");
    }

    const data = await response.json();
    return data.result?.id; // Lấy userId từ data.result.id
  };

  useEffect(() => {
    const fetchResults = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        setError("Không tìm thấy token. Vui lòng đăng nhập.");
        setLoading(false);
        return;
      }

      try {
        // Lấy userId từ API
        const userId = await fetchUserId();
        if (!userId) {
          throw new Error("Không thể lấy userId. Vui lòng thử lại.");
        }

        // Gọi API để lấy danh sách kết quả
        const response = await fetch(`https://final-quiz-server.onrender.com/identity/tests/results/user/${userId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          const errorData = await response.json();
          console.error("Lỗi từ API:", errorData);
          throw new Error(errorData.message || "Không thể lấy danh sách kết quả.");
        }

        const data = await response.json();
        console.log("Dữ liệu trả về từ API:", data);
        setResult(data);
      } catch (err) {
        console.error("Lỗi khi lấy danh sách kết quả:", err);
        setError(err.message || "Không thể lấy danh sách kết quả.");
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, []);

  if (loading) return <div>Đang tải kết quả...</div>;
  if (error) return <div className="alert alert-danger">{error}</div>;
  if (!result || result.length === 0) {
    return <div className="alert alert-warning">Không có dữ liệu kết quả để hiển thị.</div>;
  }

  return (
    <div className="container mt-5">
      <h2 className="mb-4">Danh sách kết quả bài làm</h2>
      <table className="table table-bordered">
        <thead>
          <tr>
            <th>#</th>
            <th>Tên bài kiểm tra</th>
            <th>Số câu hỏi</th>
            <th>Số câu đúng</th>
            <th>Tỷ lệ đúng (%)</th>
            <th>Người làm bài</th>
          </tr>
        </thead>
        <tbody>
          {result.map((item, index) => (
            <tr key={item.id}>
              <td>{index + 1}</td>
              <td>{item.testName}</td>
              <td>{item.totalQuestions}</td>
              <td>{item.correctAnswers}</td>
              <td>{item.percentage}%</td>
              <td>{item.userName}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <button className="btn btn-primary mt-4" onClick={() => navigate("/")}>
        Về trang chủ
      </button>
    </div>
  );
};

export default Result;