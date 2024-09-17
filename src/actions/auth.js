import axios from "axios";

export const LOGIN_SUCCESS = "LOGIN_SUCCESS";
export const LOGIN_FAIL = "LOGIN_FAIL";
export const LOGOUT = "LOGOUT";

export const login = (email, password) => async (dispatch) => {
  try {
    const response = await axios.post(
      "http://135.181.42.192/accounts/login/",
      { email, password },
      { headers: { "Content-Type": "application/json" }, withCredentials: true }
    );

    const { access_token, refresh_token, user_type, is_admin } = response.data;

    sessionStorage.setItem("access_token", access_token);
    sessionStorage.setItem("refresh_token", refresh_token);
    sessionStorage.setItem("saved_email", email);
    sessionStorage.setItem("saved_password", password);

    axios.defaults.headers.common["Authorization"] = `Bearer ${access_token}`;

    dispatch({
      type: LOGIN_SUCCESS,
      payload: { access_token, refresh_token, user_type, is_admin },
    });
  } catch (error) {
    dispatch({ type: LOGIN_FAIL, payload: error.response.data });
  }
};

export const logout = () => (dispatch) => {
  localStorage.clear();
  sessionStorage.clear();
  dispatch({ type: LOGOUT });
};
