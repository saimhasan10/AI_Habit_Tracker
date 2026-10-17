import api from "./api";


export const sendAIMessage = async (question) => {

    const response = await api.post(
        "/ai/chat/",
        {
            question,
        }
    );

    return response.data;
};


export const getAIHistory = async () => {

    const response = await api.get(
        "/ai/history/"
    );

    return response.data;
};