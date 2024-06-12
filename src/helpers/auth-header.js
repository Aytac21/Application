export default function authHeader() {
  const user = JSON.parse(localStorage.getItem("user"));

  if (user && user.accessToken) {
    return { Authorization: "Bearer " + user.accessToken };
  } else if (user && user.refreshToken) {
    return { Authorization: "Bearer " + user.refreshToken };
  } else {
    return {};
  }
}
