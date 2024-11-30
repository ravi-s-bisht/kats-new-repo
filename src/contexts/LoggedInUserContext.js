"use client";

import { createContext, useState } from "react";

export const LoggedInUserContext = createContext();

export function LoggedInUserContextProvider({ children }) {
  const [loggedInUser, setLoggedInUser] = useState(null);

  return (
    <LoggedInUserContext.Provider value={{ loggedInUser, setLoggedInUser }}>
      {children}
    </LoggedInUserContext.Provider>
  );
}
