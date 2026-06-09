export async function logClientAction(action: string, details?: unknown) {
  try {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000/api";
    await fetch(`${BACKEND_URL}/user/log-action`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ action, details }),
    });
  } catch {
    // Fail silently to ensure logging failures never affect user experience
  }
}
