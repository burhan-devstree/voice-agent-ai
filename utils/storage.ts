/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

export const getItem = <T>(key: any): T | null => {
  if (typeof window === "undefined") return null;
  let value = null;
  try {
    const result = globalThis.window.localStorage.getItem(key);
    if (result) {
      value = JSON.parse(result);
    }
  } catch (e) {
    console.error(e);
  }
  return value;
};

export const setItem = <T>(key: any, value: T): any => {
  if (typeof window === "undefined") return null;
  localStorage.setItem(key, JSON.stringify(value));
};

export const removeItem = (key: any): any => {
  if (typeof window === "undefined") return null;
  localStorage.removeItem(key);
};
