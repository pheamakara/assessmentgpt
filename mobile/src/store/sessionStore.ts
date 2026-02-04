import { create } from "zustand";
import AsyncStorage from "./storage";

interface SessionState {
  token: string | null;
  setToken: (token: string | null) => void;
}

export const useSessionStore = create<SessionState>((set) => ({
  token: null,
  setToken: (token) => {
    if (token) {
      AsyncStorage.setItem("fb_token", token);
    } else {
      AsyncStorage.removeItem("fb_token");
    }
    set({ token });
  },
}));
