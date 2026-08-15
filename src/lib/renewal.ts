export const RENEWAL_WARNING_DAYS = 15;

export function daysUntil(date: Date | string): number {
  const target = new Date(date);
  target.setHours(0, 0, 0, 0);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Math.round((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

export function isRenewalDue(renewalDate?: Date | string | null): boolean {
  if (!renewalDate) return false;
  return daysUntil(renewalDate) <= RENEWAL_WARNING_DAYS;
}
