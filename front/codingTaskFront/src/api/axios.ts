import axios from "axios";

const API = axios.create({
  baseURL: "codintask-production.up.railway.app", // Backend URL
  headers: {
    "Content-Type": "application/json",
  },
});

export default API;
