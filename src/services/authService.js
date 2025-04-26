const API_BASE = "https://final-quiz-server.onrender.com/identity";

// Lưu thông tin đăng nhập vào localStorage
export const saveAuthToLocal = ({ token, refreshToken, username }) => {
  localStorage.setItem("token", token);
  localStorage.setItem("refreshToken", refreshToken);
  localStorage.setItem("username", username);
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
  if (!refreshToken) return;

  try {
    await fetch(`${API_BASE}/auth/logout`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
    });
  } catch (err) {
    console.error("Lỗi khi logout:", err);
  } finally {
    clearAuthFromLocal();
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
      localStorage.setItem("token", data.result.token);
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
  const isValid = await introspectToken();
  if (isValid) {
    return localStorage.getItem("token");
  }
  return await refreshToken(); // Refresh token nếu cần
};

// Kiểm tra trạng thái đăng nhập khi load trang
export const checkAuthOnLoad = async (onLogout) => {
  const isValid = await introspectToken();
  if (!isValid) {
    await logoutUser();
    if (onLogout) onLogout();
    return false;
  }
  return true;
};