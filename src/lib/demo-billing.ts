// SAMPLE DATA ONLY. Not connected to Aegisora Core.

export type InvoiceStatus = "PAID" | "OPEN" | "OVERDUE";
export type DemoInvoice = { id: string; period: string; amount: string; status: InvoiceStatus; issuedAt: string };

export const billing = {
  plan: "Scale",
  seatsUsed: 5,
  seatsIncluded: 10,
  requestsUsed: 812000,
  requestsIncluded: 1000000,
  renewalDate: "2026-10-15",
  paymentMethod: "Visa •••• 4412",
};

export const invoices: DemoInvoice[] = [
  { id: "inv_2026_09", period: "Sep 2026", amount: "$1,240.00", status: "OPEN", issuedAt: "2026-09-01" },
  { id: "inv_2026_08", period: "Aug 2026", amount: "$1,180.00", status: "PAID", issuedAt: "2026-08-01" },
  { id: "inv_2026_07", period: "Jul 2026", amount: "$1,180.00", status: "PAID", issuedAt: "2026-07-01" },
  { id: "inv_2026_06", period: "Jun 2026", amount: "$980.00", status: "PAID", issuedAt: "2026-06-01" },
];