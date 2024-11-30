import axios from "axios";

const instance = axios.create({
  baseURL: "/api",
});

instance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// Response interceptor to handle errors globally
instance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 403) {
      localStorage.clear();
      window.location.href = "/";
    }
    return Promise.reject(error);
  },
);

export const googleLogin = (payload) => instance.post(`/google-login`, payload);
export const checkToken = (payload) => instance.get(`/google-login`, payload);

export const getUsers = async (payload) => instance.get(`/users`, { params: payload });