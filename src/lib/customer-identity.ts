export const CUSTOMER_IDENTITY_KEY = "dm_customer_identity";

export interface CustomerIdentity {
  name: string;
  contact: string;
}

export function getCustomerIdentity(): CustomerIdentity | null {
  if (typeof window === "undefined") return null;
  const raw = window.sessionStorage.getItem(CUSTOMER_IDENTITY_KEY);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw);
    if (typeof parsed?.name === "string" && typeof parsed?.contact === "string") {
      return parsed;
    }
    return null;
  } catch {
    return null;
  }
}
