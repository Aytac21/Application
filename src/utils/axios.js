// import axios from "axios";

// const setupAxios = () => {
//   const token = localStorage.getItem("access_token");
//   if (token) {
//     axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
//   }

//   axios.interceptors.response.use(
//     (response) => response,
//     async (error) => {
//       const originalRequest = error.config;
//       if (error.response.status === 401 && !originalRequest._retry) {
//         originalRequest._retry = true;
//         await refreshAccessToken();
//         const newToken = localStorage.getItem("access_token");
//         axios.defaults.headers.common["Authorization"] = `Bearer ${newToken}`;
//         originalRequest.headers["Authorization"] = `Bearer ${newToken}`;
//         return axios(originalRequest);
//       }
//       return Promise.reject(error);
//     }
//   );
// };

// const refreshAccessToken = async () => {
//   const refresh_token = localStorage.getItem("refresh_token");
//   if (!refresh_token) {
//     throw new Error("No refresh token available");
//   }

//   const response = await axios.post(
//     "http://135.181.42.192/accounts/token/refresh/",
//     { refresh: refresh_token }
//   );
//   const { access } = response.data;
//   localStorage.setItem("access_token", access);
//   axios.defaults.headers.common["Authorization"] = `Bearer ${access}`;
// };

// export default setupAxios;
