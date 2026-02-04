import { useState } from "react";
import { View, Text, Button } from "react-native";
import { apiFetch } from "../api/client";

const SettingsScreen = () => {
  const [message, setMessage] = useState<string | null>(null);

  const handleSave = async () => {
    await apiFetch("/api/settings", {
      method: "PUT",
      body: JSON.stringify({
        defaultCurrency: "USD",
        monthStartDay: 1,
        decimalPrecision: 2,
        theme: "system",
        language: "en",
      }),
    });
    setMessage("Saved");
  };

  return (
    <View style={{ padding: 24 }}>
      <Text style={{ fontSize: 20, fontWeight: "600" }}>Settings</Text>
      <Button title="Save settings" onPress={handleSave} />
      {message ? <Text>{message}</Text> : null}
    </View>
  );
};

export default SettingsScreen;
