/** Public business details, shown in the footer and legal pages. Set them in .env. */
export const SITE = {
  brand: process.env.NEXT_PUBLIC_BRAND_NAME ?? "AdStudio",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  legalName: process.env.NEXT_PUBLIC_LEGAL_NAME ?? "[שם העסק המלא]",
  businessId: process.env.NEXT_PUBLIC_BUSINESS_ID ?? "[מספר עוסק / ח.פ.]",
  email: process.env.NEXT_PUBLIC_CONTACT_EMAIL ?? "[support@example.com]",
  address: process.env.NEXT_PUBLIC_POSTAL_ADDRESS ?? "[כתובת למשלוח דואר]",
  accessibilityCoordinator: process.env.NEXT_PUBLIC_ACCESSIBILITY_COORDINATOR ?? "[שם, טלפון ודוא״ל של רכז/ת הנגישות]",
  legalUpdated: "20 באוקטובר 2026",
};
