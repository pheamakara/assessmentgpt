import AsyncStorage from "@react-native-async-storage/async-storage";

const QUEUE_KEY = "fb_queue";
const ONLINE_KEY = "fb_online";

export const localStore = {
  async get(key: "online") {
    const value = await AsyncStorage.getItem(ONLINE_KEY);
    return value !== "false";
  },
  async setOnline(value: boolean) {
    await AsyncStorage.setItem(ONLINE_KEY, value ? "true" : "false");
  },
  async queueTransaction(payload: Record<string, unknown>) {
    const existing = await AsyncStorage.getItem(QUEUE_KEY);
    const queue = existing ? (JSON.parse(existing) as Record<string, unknown>[]) : [];
    queue.push({ payload, createdAt: new Date().toISOString() });
    await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
  },
  async flushQueue(send: (payload: Record<string, unknown>) => Promise<void>) {
    const existing = await AsyncStorage.getItem(QUEUE_KEY);
    const queue = existing ? (JSON.parse(existing) as Record<string, unknown>[]) : [];
    for (const item of queue) {
      await send(item.payload as Record<string, unknown>);
    }
    await AsyncStorage.removeItem(QUEUE_KEY);
  },
};
