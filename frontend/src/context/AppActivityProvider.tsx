import React, { useState } from "react";
import { AppActivityContext } from "./AppActivityContext";

export const AppActivityProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [inSlackPage, setInSlackPage] = useState(false);

  return (
    <AppActivityContext.Provider value={{ inSlackPage, setInSlackPage }}>
      {children}
    </AppActivityContext.Provider>
  );
};
