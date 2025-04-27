const API_BASE = "https://final-quiz-server.onrender.com/identity";

// Lưu thông tin đăng nhập vào localStorage
export const saveAuthToLocal = ({ token, refreshToken, username }) => {
  if (token) {
    localStorage.setItem("token", token);
    if (refreshToken) {
      localStorage.setItem("refreshToken", refreshToken);
    }
    if (username) {
      localStorage.setItem("username", username);
    }
  } else {
    console.error("Token không hợp lệ.");
  }
};
// Xóa thông tin đăng nhập từ localStorage
export const clearAuthFromLocal = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("refreshToken");
  localStorage.removeItem("username");
};

// Đăng xuất người dùng
export const logoutUser = async () => {
  const refreshToken = localStorage.getItem("refreshToken");
  if (!refreshToken) {
    console.warn("Không tìm thấy refresh token. Xóa dữ liệu cục bộ.");
    clearAuthFromLocal();
    return;
  }

  try {
    const response = await fetch(`${API_BASE}/auth/logout`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
    });

    if (!response.ok) {
      console.error("Lỗi khi logout:", response.status, response.statusText);
    }
  } catch (err) {
    console.error("Lỗi khi logout:", err);
  } finally {
    clearAuthFromLocal(); // Always clear local storage
  }
};
// Kiểm tra xem token có hợp lệ hay không
export const introspectToken = async () => {
  const token = localStorage.getItem("token");
  if (!token) return false;

  try {
    const response = await fetch(`${API_BASE}/auth/introspect`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
    });

    const data = await response.json();
    return data?.result?.isActive ?? false;
  } catch (err) {
    console.error("Lỗi introspect token:", err);
    return false;
  }
};

// Refresh token nếu cần thiết
export const refreshToken = async () => {
  const refreshToken = localStorage.getItem("refreshToken");

  if (!refreshToken) {
    console.warn("Không tìm thấy refresh token. Đăng xuất người dùng.");
    await logoutUser();
    return null;
  }

  try {
    const response = await fetch(`${API_BASE}/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
    });

    if (!response.ok) {
      console.error("Lỗi refresh token:", response.status, response.statusText);
      await logoutUser();
      return null;
    }

    const data = await response.json();

    if (data?.result?.token) {
      localStorage.setItem("token", data.result.token); // Lưu token mới
      return data.result.token;
    } else {
      console.warn("Refresh token không hợp lệ. Đăng xuất người dùng.");
      await logoutUser();
      return null;
    }
  } catch (err) {
    console.error("Lỗi refresh token:", err);
    await logoutUser();
    return null;
  }
};
// Lấy token hợp lệ nếu có
export const getValidAccessToken = async () => {
  const token = localStorage.getItem("token");

  if (token) {
    const tokenPayload = JSON.parse(atob(token.split(".")[1])); // Giải mã payload của JWT
    const currentTime = Math.floor(Date.now() / 1000); // Thời gian hiện tại (giây)

    // Kiểm tra nếu token sắp hết hạn (trước 1 phút)
    if (tokenPayload.exp > currentTime + 60) {
      return token; // Token vẫn hợp lệ
    }
  }

  // Nếu token không hợp lệ hoặc hết hạn, gọi refreshToken
  return await refreshToken();
};
// Kiểm tra trạng thái đăng nhập khi load trang
export const checkAuthOnLoad = async (onLogout) => {
  const token = localStorage.getItem("token");

  if (token) {
    const tokenPayload = JSON.parse(atob(token.split(".")[1])); // Giải mã payload của JWT
    const currentTime = Math.floor(Date.now() / 1000); // Thời gian hiện tại (giây)

    // Kiểm tra nếu token đã hết hạn
    if (tokenPayload.exp > currentTime) {
      return true; // Token vẫn hợp lệ
    }
  }

  // Nếu token không hợp lệ hoặc hết hạn, gọi refreshToken
  const newToken = await refreshToken();
  if (newToken) {
    return true; // Token mới hợp lệ
  }

  // Nếu không thể làm mới token, đăng xuất người dùng
  if (onLogout) onLogout();
  return false;
};