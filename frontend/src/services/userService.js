import axios from "axios";

const API = "http://localhost:8082/api/users";

export const getUsers = () => axios.get(API);
export const createUser = (data) => axios.post(API, data);

export const userService = {
  getAllUsers: async () => {
    const response = await axios.get(API);
    return response.data;
  },
  createUser: async (data) => {
    const response = await axios.post(API, data);
    return response.data;
  },
};