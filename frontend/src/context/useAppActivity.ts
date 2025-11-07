import { useContext } from "react";
import { AppActivityContext } from "../context/AppActivityContext";

export const useAppActivity = () => useContext(AppActivityContext);
