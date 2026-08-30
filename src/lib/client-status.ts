/** Client is ended only after the end date has passed. Future or today's end date stays active. */
export function isClientEnded(endDate?: string | Date | null) {
  if (!endDate) return false;
  const day = String(endDate).split("T")[0];
  if (!/^\d{4}-\d{2}-\d{2}$/.test(day)) {
    const d = new Date(endDate);
    if (Number.isNaN(d.getTime())) return false;
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    const today = new Date();
    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
    return `${y}-${m}-${dd}` < todayStr;
  }
  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
  return day < todayStr;
}

export function isClientActive(endDate?: string | Date | null) {
  return !isClientEnded(endDate);
}
