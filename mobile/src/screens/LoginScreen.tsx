import { useState } from "react";
import { View, Text, TextInput, Button } from "react-native";
import { apiFetch } from "../api/client";
import { useSessionStore } from "../store/sessionStore";

const LoginScreen = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const setToken = useSessionStore((state) => state.setToken);

  const handleLogin = async () => {
    setError(null);
    try {
      const response = await apiFetch<{ token: string }>("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });
      setToken(response.token);
    } catch (err) {
      setError((err as Error).message);
    }
  };

  return (
    <View style={{ padding: 24 }}>
      <Text style={{ fontSize: 24, fontWeight: "600" }}>Family Budget</Text>
      <TextInput placeholder="Email" value={email} onChangeText={setEmail} />
      <TextInput
        placeholder="Password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />
      {error ? <Text style={{ color: "crimson" }}>{error}</Text> : null}
      <Button title="Log in" onPress={handleLogin} />
    </View>
  );
};

export default LoginScreen;
