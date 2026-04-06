export const getBillingPeriodStart = () => {
  const now = new Date()
  return new Date(now.getFullYear(), now.getMonth(), 1) // First day of the current month
}