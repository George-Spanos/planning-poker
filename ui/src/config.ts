import { createSignal } from "solid-js";

export const apiV1Url = import.meta.env.VITE_API_URL + "/v1";
export const wsv1Url = import.meta.env.VITE_WS_URL + "/v1";
export const SessionStorageKeys = {
  username: "username",
  isSpectator: "isSpectator",
};

export const [roomId, setRoomId] = createSignal("");
export const [isSpectator, setIsSpectator] = createSignal(
  Boolean(sessionStorage.getItem(SessionStorageKeys.isSpectator))
);
export const [username, setUsername] = createSignal(
  sessionStorage.getItem(SessionStorageKeys.username) ?? ""
);
