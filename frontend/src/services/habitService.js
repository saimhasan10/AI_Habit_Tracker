import api from "./api";


export const getHabits = async () => {
    const response = await api.get("/habits/");
    return response.data;
};


export const createHabit = async (data) => {
    const response = await api.post("/habits/", {
        title: data.title || data.name,
        description: data.description || "",
        frequency: data.frequency || "daily",
    });

    return response.data;
};


export const getHabit = async (id) => {
    const response = await api.get(
        `/habits/${id}/`
    );

    return response.data;
};


export const updateHabit = async (id, data) => {
    const response = await api.put(
        `/habits/${id}/`,
        {
            title: data.title || data.name,
            description: data.description || "",
            frequency: data.frequency || "daily",
        }
    );

    return response.data;
};


export const deleteHabit = async (id) => {
    const response = await api.delete(
        `/habits/${id}/`
    );

    return response.data;
};


export const completeHabit = async (id) => {
    const response = await api.post(
        `/habits/${id}/complete/`
    );

    return response.data;
};


export const getDashboard = async () => {
    const response = await api.get(
        "/habits/dashboard/"
    );

    return response.data;
};


export const getHabitHistory = async (
    period = "week"
) => {
    const response = await api.get(
        `/habits/history/?period=${period}`
    );

    return response.data;
};