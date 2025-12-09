/* eslint-disable @typescript-eslint/no-explicit-any */

const baseURL = process.env.NEXT_PUBLIC_API_BASE_URL;

export async function sendOtp(email: string): Promise<void> {
  try {
    const res = await fetch(`${baseURL}/auth/send-otp`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.detail || `Server error: ${res.status}`);
    }
  } catch (error: any) {
    throw new Error(error.message || "Failed to reach server");
  }
}

export async function verifyOtp(email: string, otp: string): Promise<any> {
  const res = await fetch(`${baseURL}/auth/verify-otp`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, otp }),
  });
  if (!res.ok) throw new Error("Invalid verification code");
  return res.json();
}

export async function fetchMe(token: string): Promise<any> {
  const res = await fetch(`${baseURL}/users/me`, {
    headers: {
      Authorization: `Bearer ${token}`,
      "ngrok-skip-browser-warning": "true",
    },
  });
  if (!res.ok) throw new Error("Session expired");
  return res.json();
}

export async function startConversationAuth(token: string): Promise<any> {
  const res = await fetch(`${baseURL}/ws/start-conversation`, {
    headers: {
      Authorization: `Bearer ${token}`,
      "ngrok-skip-browser-warning": "true",
    },
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.detail || "Failed to authorize session");
  }
  return res.json();
}
