import axios from "axios";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

export const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_MODE === "development" ? "/api" : BACKEND_URL,
  withCredentials: true,
});

let isRefreshing = false;
let queuedRequests = [];

const processQueue = (error) => {
  queuedRequests.forEach(({ resolve, reject }) => {
    error ? reject(error) : resolve();
  });
  queuedRequests = [];
};

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const status = error.response?.status;
    const isNoRetryRoute =
      originalRequest.url?.includes("/auth/login") ||
      originalRequest.url?.includes("/auth/signup") ||
      originalRequest.url?.includes("/auth/refresh");
    const isCheckRoute = originalRequest.url?.includes("/auth/check");

    if (status === 401 && !originalRequest._retry && !isNoRetryRoute) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          queuedRequests.push({ resolve, reject });
        }).then(() => axiosInstance(originalRequest));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        await axiosInstance.post("/auth/refresh");
        processQueue(null);
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError);
        if (!isCheckRoute && window.location.pathname !== "/auth") {
          window.location.href = "/auth";
        }
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  },
);
