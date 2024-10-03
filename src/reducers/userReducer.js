// const initialState = {
//   userType: null,
//   userEmail: null,
//   loading: false,
//   error: null,
// };

// const userReducer = (state = initialState, action) => {
//   switch (action.type) {
//     case "FETCH_USER_REQUEST":
//       return { ...state, loading: true };
//     case "FETCH_USER_SUCCESS":
//       return {
//         ...state,
//         loading: false,
//         userType: action.payload.user_type,
//         userEmail: action.payload.email,
//       };
//     case "FETCH_USER_FAILURE":
//       return { ...state, loading: false, error: action.error };
//     default:
//       return state;
//   }
// };

// export default userReducer;
