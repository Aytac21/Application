import axios from "axios";

// Define action types
export const LOGIN_SUCCESS = "LOGIN_SUCCESS";
export const LOGIN_FAIL = "LOGIN_FAIL";
export const LOGOUT = "LOGOUT";

// Action to handle login
export const login = (email, password, rememberMe) => async (dispatch) => {
  try {
    const response = await axios.post(
      "http://135.181.42.192/accounts/login/",
      { email, password, remember_me: rememberMe },
      { headers: { "Content-Type": "application/json" }, withCredentials: true }
    );

    const { access_token, refresh_token, user_type, is_admin } = response.data;

    // Store tokens and user info
    if (rememberMe) {
      localStorage.setItem("access_token", access_token);
      localStorage.setItem("refresh_token", refresh_token);
      localStorage.setItem("saved_email", email);
      localStorage.setItem("saved_password", password);
      localStorage.setItem("remember_me", "true");
    } else {
      sessionStorage.setItem("access_token", access_token);
      sessionStorage.setItem("refresh_token", refresh_token);
    }

    axios.defaults.headers.common["Authorization"] = `Bearer ${access_token}`;

    dispatch({
      type: LOGIN_SUCCESS,
      payload: { access_token, refresh_token, user_type, is_admin },
    });
  } catch (error) {
    dispatch({ type: LOGIN_FAIL, payload: error.response.data });
  }
};

// Action to handle logout
export const logout = () => (dispatch) => {
  localStorage.clear();
  sessionStorage.clear();
  dispatch({ type: LOGOUT });
};
