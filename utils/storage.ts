"use client";

/**
 * Retrieves an item from localStorage and parses it as JSON.
 * 
 * @template T - The expected type of the stored value
 * @param {string} key - The localStorage key to retrieve
 * @returns {T | null} The parsed value or null if not found or on error
 * 
 * @example
 * const user = getItem<User>('user');
 */
export const getItem = <T>(key: string): T | null => {
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

/**
 * Stores a value in localStorage as a JSON string.
 * 
 * @template T - The type of value to store
 * @param {string} key - The localStorage key to use
 * @param {T} value - The value to store
 * 
 * @example
 * setItem('user', { id: 1, name: 'John' });
 */
export const setItem = <T>(key: string, value: T): void => {
  if (typeof window === "undefined") return;
  localStorage.setItem(key, JSON.stringify(value));
};

/**
 * Removes an item from localStorage.
 * 
 * @param {string} key - The localStorage key to remove
 * 
 * @example
 * removeItem('user');
 */
export const removeItem = (key: string): void => {
  if (typeof window === "undefined") return;
  localStorage.removeItem(key);
};
