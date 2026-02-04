import { Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";
import TransactionsPage from "./pages/TransactionsPage";
import SettingsPage from "./pages/SettingsPage";
import { useSessionStore } from "./store/sessionStore";

const App = () => {
  const token = useSessionStore((state) => state.token);

  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/"
        element={token ? <DashboardPage /> : <Navigate to="/login" replace />} 
      />
      <Route
        path="/transactions"
        element={token ? <TransactionsPage /> : <Navigate to="/login" replace />} 
      />
      <Route
        path="/settings"
        element={token ? <SettingsPage /> : <Navigate to="/login" replace />} 
      />
    </Routes>
  );
};

export default App;
