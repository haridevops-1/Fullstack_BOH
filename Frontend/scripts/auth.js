export function logout() {
    localStorage.clear();
    window.location.href = "../index.html";
}

export function getAuthHeaders() {
    const token = localStorage.getItem("authToken");
    return {
        "Content-Type": "application/json",
        "Authorization": token ? `Bearer ${token}` : ""
    };
}
