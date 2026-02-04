import { useState } from "react";
import { Link } from "react-router-dom";
import { apiFetch } from "../api/client";

const SettingsPage = () => {
  const [defaultCurrency, setDefaultCurrency] = useState("USD");
  const [theme, setTheme] = useState("system");
  const [message, setMessage] = useState<string | null>(null);

  const handleSave = async () => {
    await apiFetch("/api/settings", {
      method: "PUT",
      body: JSON.stringify({
        defaultCurrency,
        monthStartDay: 1,
        decimalPrecision: 2,
        theme,
        language: "en",
      }),
    });
    setMessage("Saved");
  };

  return (
    <div style={{ padding: 24, fontFamily: "system-ui" }}>
      <header style={{ display: "flex", gap: 16 }}>
        <h2>Settings</h2>
        <nav style={{ marginLeft: "auto", display: "flex", gap: 12 }}>
          <Link to="/">Dashboard</Link>
          <Link to="/transactions">Transactions</Link>
        </nav>
      </header>
      <div>
        <label>
          Default currency
          <select value={defaultCurrency} onChange={(event) => setDefaultCurrency(event.target.value)}>
            <option value="USD">USD</option>
            <option value="KHR">KHR</option>
          </select>
        </label>
      </div>
      <div>
        <label>
          Theme
          <select value={theme} onChange={(event) => setTheme(event.target.value)}>
            <option value="light">Light</option>
            <option value="dark">Dark</option>
            <option value="system">System</option>
          </select>
        </label>
      </div>
      <button type="button" onClick={handleSave}>
        Save settings
      </button>
      {message ? <p>{message}</p> : null}
    </div>
  );
};

export default SettingsPage;
