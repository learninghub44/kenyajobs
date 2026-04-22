export const PESAPAL_CONFIG = {
  environment: ((import.meta as any).env?.VITE_PESAPAL_ENV || "sandbox") as "live" | "sandbox",
  membershipFeeKES: 200,
  currency: "KES",
};

export const isPesapalConfigured =
  String(((import.meta as any).env?.VITE_ENABLE_PAYMENTS ?? "true")).toLowerCase() === "true";
