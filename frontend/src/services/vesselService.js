import axios from "axios";

const API = "http://localhost:8082/api/vessels";

export const getVessels = () => axios.get(API);
export const createVessel = (data) => axios.post(API, data);

export const vesselService = {
  getAllVessels: async () => {
    const response = await axios.get(API);
    return response.data;
  },
  createVessel: async (data) => {
    const response = await axios.post(API, data);
    return response.data;
  },
};