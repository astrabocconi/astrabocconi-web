// How content_audit rows read in the backoffice. Shared by the overview's
// recent activity and the full log at /admin/attivita.

export const TABLE_LABEL: Record<string, string> = {
  articles: "Stella Polare",
  guides: "Guide",
  representatives: "Rappresentanti",
  handouts: "Dispense",
  clmg_handouts: "Dispense CLMG",
  magistrali_handouts: "Dispense magistrali",
  notices: "Avvisi",
  site_sections: "Home page",
  Event: "Eventi",
  admin_users: "Operatori",
};

export const ACTION_LABEL: Record<string, string> = {
  insert: "ha creato",
  update: "ha modificato",
  delete: "ha eliminato",
};

const rtf = new Intl.RelativeTimeFormat("it-IT", { numeric: "auto" });

export function ago(iso: string) {
  const minutes = Math.round((new Date(iso).getTime() - Date.now()) / 60000);
  if (Math.abs(minutes) < 60) return rtf.format(minutes, "minute");
  const hours = Math.round(minutes / 60);
  if (Math.abs(hours) < 24) return rtf.format(hours, "hour");
  return rtf.format(Math.round(hours / 24), "day");
}
