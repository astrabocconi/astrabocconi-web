// Buttons at the bottom of an event in the mobile app. Same shape as
// NewsPost.links / Event.links in astra-app. A link opens a web page or a
// screen inside the app; screens are an allowlist because a typo would make a
// button that silently does nothing. Mirror of IN_APP_ROUTES in
// astra-app/packages/shared/src/schemas: keep in step.

export const IN_APP_ROUTES = [
  "/rewards",
  "/materials",
  "/classrooms",
  "/discounts",
  "/support",
  "/points-history",
  "/academics",
  "/polare",
] as const;
export type InAppRoute = (typeof IN_APP_ROUTES)[number];

export const IN_APP_ROUTE_LABELS: Record<InAppRoute, string> = {
  "/rewards": "Premi",
  "/materials": "Materiali",
  "/classrooms": "Aule libere",
  "/discounts": "Sconti",
  "/support": "Supporto",
  "/points-history": "Storico punti",
  "/academics": "Carriera",
  "/polare": "ASTRA Polare",
};

export type EventLink =
  | { kind: "external"; label: string; value: string }
  | { kind: "internal"; label: string; value: InAppRoute };

export const MAX_LINKS = 6;
