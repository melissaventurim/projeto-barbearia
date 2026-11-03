/**
 * Fetches a JSON endpoint and throws the API's error message on failure.
 */
export async function requestJson<T>(
  url: string,
  init?: { method?: string; body?: unknown },
): Promise<T> {
  const response = await fetch(url, {
    method: init?.method ?? "GET",
    cache: "no-store",
    ...(init?.body !== undefined
      ? {
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(init.body),
        }
      : {}),
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.error ?? "Não foi possível concluir a operação.");
  }

  return data as T;
}

export function errorMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback;
}
