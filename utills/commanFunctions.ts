/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Convert a JSON object into a FormData object. This function is used to prepare
 * form data to be sent via an HTTP request. It supports nested objects and arrays,
 * as well as files and blobs.
 *
 * The function visits each key-value pair in the input object, and uses the
 * following rules to generate the form data:
 *
 * - If the value is a file or blob, append it to the form data with the given key.
 * - If the value is an array, iterate over the array and append each item to the
 *   form data with the key `<key>[<index>]`.
 * - If the value is an object, iterate over the object's entries and append each
 *   value to the form data with the key `<key>.<nestedKey>`.
 * - If the value is a date, convert it to an ISO string and append it to the form
 *   data with the given key.
 * - Otherwise, convert the value to a string and append it to the form data with
 *   the given key.
 *
 * The function also supports a `prefix` parameter, which can be used to prefix
 * all keys in the generated form data with a given string.
 *
 * @param json The JSON object to convert into a FormData object.
 * @param prefix The prefix to use when generating the form data. Defaults to an
 * empty string.
 * @returns The generated FormData object.
 */
export function jsonToFormData(
  json: Record<string, any>,
  prefix: string = ""
): FormData {
  const formData = new FormData();

  function appendFormData(key: string, value: any, currentPrefix: string) {
    const formKey = currentPrefix ? `${currentPrefix}.${key}` : key;

    if (value === null || value === undefined) {
      formData.append(formKey, "");
      return;
    }

    if (value instanceof File || value instanceof Blob) {
      formData.append(formKey, value);
      return;
    }

    if (Array.isArray(value)) {
      value.forEach((item, index) => {
        appendFormData(`${key}[${index}]`, item, currentPrefix);
      });
      return;
    }

    if (typeof value === "object" && !(value instanceof Date)) {
      Object.entries(value).forEach(([nestedKey, nestedValue]) => {
        appendFormData(nestedKey, nestedValue, formKey);
      });
      return;
    }

    formData.append(
      formKey,
      value instanceof Date ? value.toISOString() : String(value)
    );
  }

  Object.entries(json).forEach(([key, value]) => {
    appendFormData(key, value, prefix);
  });

  return formData;
}

/**
 * Capitalizes the first letter of a given string.
 *
 * @param {string} text - The string to capitalize.
 * @returns {string} The string with the first letter capitalized.
 *
 * @example
 * capitalizeFirstLetter('hello') // 'Hello'
 * capitalizeFirstLetter('world') // 'World'
 */

export function capitalizeFirstLetter(text: string | undefined | null): string {
  if (!text || typeof text !== "string") return "";
  return text?.charAt(0)?.toUpperCase() + text?.slice(1);
}

/**
 * Format a number as a currency string.
 *
 * @param {number} amount - The amount to format.
 * @param {string} [currency='USD'] - The currency code to use.
 * @returns {string} The formatted string.
 *
 * @example
 * formatCurrency(1000) // '$1,000.00'
 * formatCurrency(1000, 'EUR') // ' 1,000.00'
 */
export function formatCurrency(
  amount: number | null | undefined,
  currency: string = "USD"
): string {
  if (amount === null || amount === undefined) return "0";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
  }).format(amount);
}

export const buildQueryString = (params: any) => {
  // Ensure params is an object and has keys
  if (
    !params ||
    typeof params !== "object" ||
    Object.keys(params).length === 0
  ) {
    return "";
  }

  // Convert each key-value pair to a URL-encoded string
  const queryString = Object.keys(params)
    .map((key) => {
      const value = params[key];
      if (value === null || value === undefined) {
        return ""; // Skip null or undefined values
      }
      if (Array.isArray(value)) {
        // Encode array values
        return value
          .map((val) => encodeURIComponent(key) + "=" + encodeURIComponent(val))
          .join("&");
      }
      // Encode normal key-value pairs
      return encodeURIComponent(key) + "=" + encodeURIComponent(value);
    })
    .filter(Boolean) // Remove any empty strings
    .join("&");

  // Prepend '?' if the query string is not empty
  return queryString ? "?" + queryString : "";
};
