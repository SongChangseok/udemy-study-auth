import React, { useCallback, useEffect, useState } from "react";

let logoutTimer;

const AuthContext = React.createContext({
  token: "",
  isLoggedIn: false,
  login: (token) => {},
  logout: () => {},
});

// const calculateRemainingTime = (expirationTime) => {
//   const currentTime = new Date().getTime();
//   const adjExpirationTime = new Date(expirationTime).getTime();
//   const remainingDuration = adjExpirationTime - currentTime;

//   return remainingDuration;
// };
const calculateRemainingTime = (expirationTime) =>
  new Date().getTime() - new Date(expirationTime).getTime();

const initToken = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("expirationTime");
};

const retrieveStoredToken = () => {
  const storedExpirationDate = localStorage.getItem("expirationTime");
  const remainingTime = calculateRemainingTime(storedExpirationDate);

  if (remainingTime <= 3000) {
    initToken();
    return null;
  }

  return {
    token: localStorage.getItem("token"),
    duration: remainingTime,
  };
};

const AuthContextProvider = ({ children }) => {
  const tokenData = retrieveStoredToken();
  const initialToken = tokenData?.token;
  const [token, setToken] = useState(initialToken);
  const userIsLoggedIn = !!token;

  const loginHandler = (token, expirationTime) => {
    setToken(token);
    localStorage.setItem("token", token);
    localStorage.setItem("expirationTime", expirationTime);

    const remainingTime = calculateRemainingTime(expirationTime);
    logoutTimer = setTimeout(logoutHandler, remainingTime);
  };

  const logoutHandler = useCallback(() => {
    setToken();
    initToken();
    localStorage.removeItem("token");

    logoutTimer && clearTimeout(logoutTimer);
  }, []);

  const contextValue = {
    token,
    isLoggedIn: userIsLoggedIn,
    login: loginHandler,
    logout: logoutHandler,
  };

  useEffect(() => {
    console.log(tokenData);
    if (tokenData) logoutTimer = setTimeout(logoutHandler, tokenData.duration);
  }, [tokenData, logoutHandler]);

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
};

export { AuthContextProvider };
export default AuthContext;
