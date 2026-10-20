"use client";

/**
 * The project's secret access token lives in the URL fragment (#t=...), which browsers never
 * send to servers or put in Referer headers, plus a copy in this browser's localStorage.
 */
const key = (id: string) => `project-token:${id}`;

export function saveToken(id: string, token: string) {
  try {
    localStorage.setItem(key(id), token);
  } catch {
    // storage blocked: the private link still works
  }
}

export function readToken(id: string): string | null {
  const fromHash = new URLSearchParams(window.location.hash.slice(1)).get("t");
  if (fromHash) {
    saveToken(id, fromHash);
    return fromHash;
  }
  try {
    return localStorage.getItem(key(id));
  } catch {
    return null;
  }
}
