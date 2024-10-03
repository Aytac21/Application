// import axios from "axios";
// import {
//   LOGIN_REQUEST,
//   LOGIN_SUCCESS,
//   LOGIN_FAILURE,
//   LOGOUT,
//   REFRESH_TOKEN,
// } from "./actionTypes";

// const API_URL = "http://135.181.42.192/accounts/login/";

// export const login = (email, password, rememberMe) => async (dispatch) => {
//   dispatch({ type: LOGIN_REQUEST });

//   try {
//     const response = await axios.post(API_URL, { email, password });
//     const { access_token, refresh_token } = response.data;

//     localStorage.setItem("access_token", access_token);
//     localStorage.setItem("refresh_token", refresh_token);
//     if (rememberMe) {
//       localStorage.setItem("saved_email", email);
//       localStorage.setItem("saved_password", password);
//       localStorage.setItem("remember_me", "true");
//     } else {
//       sessionStorage.setItem("saved_email", email);
//       sessionStorage.setItem("saved_password", password);
//       sessionStorage.setItem("remember_me", "false");
//     }

//     dispatch({
//       type: LOGIN_SUCCESS,
//       payload: response.data,
//     });
//   } catch (error) {
//     dispatch({
//       type: LOGIN_FAILURE,
//       payload: error.response
//         ? error.response.data
//         : { message: "Login failed" },
//     });
//   }
// };

// export const logout = () => (dispatch) => {
//   localStorage.removeItem("access_token");
//   localStorage.removeItem("refresh_token");
//   localStorage.removeItem("saved_email");
//   localStorage.removeItem("saved_password");
//   localStorage.removeItem("remember_me");
//   localStorage.removeItem("phone");
//   sessionStorage.removeItem("saved_email");
//   sessionStorage.removeItem("saved_password");
//   sessionStorage.removeItem("remember_me");

//   dispatch({ type: LOGOUT });
// };

// export const refreshToken = () => async (dispatch) => {
//   const refreshToken = localStorage.getItem("refresh_token");
//   if (!refreshToken) return;

//   try {
//     const response = await axios.post(
//       "http://135.181.42.192/accounts/gettoken/",
//       { refresh: refreshToken }
//     );
//     const { access } = response.data;

//     localStorage.setItem("access_token", access);
//     dispatch({ type: REFRESH_TOKEN, payload: { access_token: access } });
//   } catch (error) {
//     dispatch(logout());
//   }
// };
