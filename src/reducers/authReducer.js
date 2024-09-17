import { LOGIN_SUCCESS, LOGIN_FAIL, LOGOUT } from "../actions/auth";

const initialState = {
  isLoggedIn:
    !!localStorage.getItem("access_token") ||
    !!sessionStorage.getItem("access_token"),
  access_token:
    localStorage.getItem("access_token") ||
    sessionStorage.getItem("access_token"),
  refresh_token:
    localStorage.getItem("refresh_token") ||
    sessionStorage.getItem("refresh_token"),
  user_type: localStorage.getItem("user_type"),
  is_admin: localStorage.getItem("is_admin"),
};

export default function authReducer(state = initialState, action) {
  switch (action.type) {
    case LOGIN_SUCCESS:
      return {
        ...state,
        isLoggedIn: true,
        access_token: action.payload.access_token,
        refresh_token: action.payload.refresh_token,
        user_type: action.payload.user_type,
        is_admin: action.payload.is_admin,
      };
    case LOGIN_FAIL:
    case LOGOUT:
      return {
        ...state,
        isLoggedIn: false,
        access_token: null,
        refresh_token: null,
        user_type: null,
        is_admin: null,
      };
    default:
      return state;
  }
}
