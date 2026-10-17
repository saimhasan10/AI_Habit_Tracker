import api from "./api";

export const registerUser = async (data) => {
    const response = await api.post("/accounts/register/", data);
    return response.data;
};

export const loginUser = async (data) => {
    const response = await api.post("/accounts/login/", data);

    const token = response.data.token || response.data.key;

    if (token) {
        localStorage.setItem("token", token);
    }

    return response.data;
};

export const getProfile = async () => {
    const response = await api.get("/accounts/profile/");
    return response.data;
};

export const logoutUser = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
};