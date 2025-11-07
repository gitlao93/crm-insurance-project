import { createContext } from "react";

export interface AppActivityContextType {
  inSlackPage: boolean;
  setInSlackPage: (value: boolean) => void;
}

export const AppActivityContext = createContext<AppActivityContextType>({
  inSlackPage: false,
  setInSlackPage: () => {},
});
