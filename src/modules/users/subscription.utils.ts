const MS_PER_DAY = 24 * 60 * 60 * 1000;

function startOfUtcDay(date: Date): Date {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
}

export function getRemainingSubscriptionDays(subscriptionExpiryDate: Date): number {
  const today = startOfUtcDay(new Date());
  const expiry = startOfUtcDay(subscriptionExpiryDate);
  const diff = Math.round((expiry.getTime() - today.getTime()) / MS_PER_DAY);

  return Math.max(0, diff);
}

export function expiryDateFromRemainingDays(remainingDays: number): Date {
  const expiry = startOfUtcDay(new Date());
  expiry.setUTCDate(expiry.getUTCDate() + remainingDays);
  return expiry;
}
