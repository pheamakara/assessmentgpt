import { create } from "zustand";

interface SessionState {
  token: string | null;
  setToken: (token: string | null) => void;
}

export const useSessionStore = create<SessionState>((set) => ({
  token: localStorage.getItem("fb_token"),
  setToken: (token) => {
    if (token) {
      localStorage.setItem("fb_token", token);
    } else {
      localStorage.removeItem("fb_token");
    }
    set({ token });
  },
}));
