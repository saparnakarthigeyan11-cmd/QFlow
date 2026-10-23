import { createContext } from "react";

export const AuthContext = createContext({
  user: null,
  profile: null,
  displayName: "",
  isAdmin: false,
  loading: true,
});
