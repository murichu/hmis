const apiBaseUrl = import.meta.env.VITE_API_URL ?? "/api/v1";

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

export async function apiClient<T>(path: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(`${apiBaseUrl}${path}`, {
    credentials: "include",
    headers: { "Content-Type": "application/json", ...options.headers },
    ...options,
  });

  const body = (await response.json().catch(() => undefined)) as T | { error?: string } | undefined;
  if (!response.ok) {
    throw new ApiError(
      typeof body === "object" && body !== null && "error" in body && typeof body.error === "string"
        ? body.error
        : "The request could not be completed.",
      response.status,
    );
  }

  return body as T;
}