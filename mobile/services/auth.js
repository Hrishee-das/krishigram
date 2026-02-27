import { IP_ADDRESS } from "../constants/ip";

const BASE_URL = `http://${IP_ADDRESS}:3000/api/v1`;

export const loginApi = async ({ nameId, password }) => {
  const res = await fetch(`${BASE_URL}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ nameId, password }),
  });
  if (!res.ok) throw new Error("Login failed");
  return res.json();
};

export const logoutApi = async () => {
  const res = await fetch(`${BASE_URL}/logout`, {
    method: "POST",
  });
  if (!res.ok) throw new Error("Logout failed");
  return res.json();
};

export const signUpApi = async ({
  name,
  nameId,
  password,
  passwordConfirm,
}) => {
  const res = await fetch(`${BASE_URL}/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, nameId, password, passwordConfirm }),
  });
  if (!res.ok) throw new Error("Sign up failed");
  return res.json();
};
