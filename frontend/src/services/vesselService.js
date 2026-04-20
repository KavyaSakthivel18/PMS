import axios from "axios";

const API = "http://localhost:8080/api/vessels";

export const getVessels = () => axios.get(API);

export const createVessel = (data) => axios.post(API, data);