import { combineReducers } from "redux";
// import auth from "./auth";
// import message from "./message";
// import userReducer from "./userReducer";
import authReducer from "./authReducer";

export default combineReducers({
  // user: userReducer,
  auth: authReducer,
  // auth,
  // mejssage,
});
