import axios from "axios";

const API = "http://localhost:8080/api/users";

export const getUsers = () => axios.get(API);

export const createUser = (data) => axios.post(API, data);