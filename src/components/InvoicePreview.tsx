import { format } from "date-fns";

export interface InvoicePreviewData {
  invoiceNumber?: string;
  clientName?: string;
  invoiceDate?: string;
  address?: string;
  amount?: number;
  taxAmount?: number;
  invoiceFor?: string;
  items?: { description: string; amount: number }[];
  quoteNumber?: string;
  showBankDetails?: boolean;
  includeRazorpayLink?: boolean;
  razorpayShortUrl?: string;
}

function toWords(n: number): string {
  if (!n) return "Zero Rupees Only";
  const ones = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine",
    "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"];
  const tens = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];
  if (n < 20) return ones[n];
  if (n < 100) return tens[Math.floor(n / 10)] + (n % 10 ? " " + ones[n % 10] : "");
  if (n < 1000) return ones[Math.floor(n / 100)] + " Hundred" + (n % 100 ? " " + toWords(n % 100) : "");
  if (n < 100000) return toWords(Math.floor(n / 1000)) + " Thousand" + (n % 1000 ? " " + toWords(n % 1000) : "");
  if (n < 10000000) return toWords(Math.floor(n / 100000)) + " Lakh" + (n % 100000 ? " " + toWords(n % 100000) : "");
  return toWords(Math.floor(n / 10000000)) + " Crore" + (n % 10000000 ? " " + toWords(n % 10000000) : "");
}

function lineItems(data: InvoicePreviewData) {
  if (data.items && data.items.length > 0) return data.items;
  if (data.invoiceFor) return [{ description: data.invoiceFor, amount: data.amount ?? 0 }];
  return [];
}

function bullets(text: string) {
  const lines = text.split("\n").map((line) => line.replace(/^[-•]\s*/, "").trim()).filter(Boolean);
  return { title: lines[0] || "—", points: lines.slice(1) };
}

export default function InvoicePreview({ data }: { data: InvoicePreviewData }) {
  const items = lineItems(data);
  const subtotal = items.reduce((sum, row) => sum + (row.amount || 0), 0);
  const total = subtotal + (data.taxAmount ?? 0);
  const dateStr = data.invoiceDate
    ? format(new Date(data.invoiceDate), "dd MMM yyyy")
    : format(new Date(), "dd MMM yyyy");
  const invNum = data.invoiceNumber ?? "INV-DRAFT";

  return (
    <div
      className="bg-white text-gray-900"
      style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', width: "100%", padding: "2rem 2.5rem" }}
    >
      {/* Header */}
      <div style={{ borderBottom: "2px solid #0F6E56", paddingBottom: "1.5rem", marginBottom: "2rem", display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="https://commencesolutions.com/wp-content/uploads/2025/08/commence-logo.svg" alt="Commence Solutions" style={{ height: 38, marginBottom: 10 }} onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
          <h1 style={{ fontSize: 22, fontWeight: 500, color: "#0F6E56" }}>Invoice</h1>
          <p style={{ fontSize: 13, color: "#666", marginTop: 4, lineHeight: 1.6 }}>
            Commence Solutions — Mustafa Karanjawala<br />
            Nagpur – 440002<br />
            +91 84465 18154 &nbsp;|&nbsp; mkaranjawala@commencesolutions.com
          </p>
        </div>
        <div style={{ textAlign: "right" }}>
          <span style={{ background: "#0F6E56", color: "#fff", fontSize: 11, padding: "3px 10px", borderRadius: 4, display: "inline-block", marginBottom: 6, letterSpacing: 0.5, textTransform: "uppercase" }}>Invoice</span>
          <p style={{ fontSize: 13, color: "#666", lineHeight: 1.8 }}>
            <strong>{invNum}</strong><br />Date: {dateStr}
            {data.quoteNumber ? <><br />Quote: {data.quoteNumber}</> : null}
          </p>
        </div>
      </div>

      {/* Billed To */}
      <div style={{ marginBottom: "2rem" }}>
        <div style={{ fontSize: 14, fontWeight: 500, color: "#0F6E56", textTransform: "uppercase", letterSpacing: 0.8, borderBottom: "0.5px solid #e2e8f0", paddingBottom: 6, marginBottom: "1rem" }}>Billed To</div>
        <div style={{ background: "#f8fafc", borderRadius: 8, padding: "1rem 1.25rem", maxWidth: 340 }}>
          <p style={{ fontSize: 13, color: "#888", marginBottom: 8 }}>Client</p>
          <p style={{ fontSize: 14, fontWeight: 500, lineHeight: 1.7 }}>
            <strong style={{ color: "#0F6E56" }}>{data.clientName || "—"}</strong><br />
            <span style={{ fontSize: 12, color: "#888" }}>{data.address || "No address provided"}</span>
          </p>
        </div>
      </div>

      {/* Invoice Details */}
      <div style={{ marginBottom: "2rem" }}>
        <div style={{ fontSize: 14, fontWeight: 500, color: "#0F6E56", textTransform: "uppercase", letterSpacing: 0.8, borderBottom: "0.5px solid #e2e8f0", paddingBottom: 6, marginBottom: "1rem" }}>Invoice Details</div>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
          <thead>
            <tr>
              <th style={{ textAlign: "left", fontWeight: 500, fontSize: 13, color: "#666", padding: "8px 10px", borderBottom: "0.5px solid #e2e8f0", background: "#f8fafc" }}>Description</th>
              <th style={{ textAlign: "right", fontWeight: 500, fontSize: 13, color: "#666", padding: "8px 10px", borderBottom: "0.5px solid #e2e8f0", background: "#f8fafc" }}>Amount (INR)</th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 ? (
              <tr style={{ borderBottom: "0.5px solid #e2e8f0" }}>
                <td style={{ padding: 10 }}>—</td>
                <td style={{ padding: 10, textAlign: "right", color: "#888" }}>₹0</td>
              </tr>
            ) : items.map((row, index) => {
              const { title, points } = bullets(row.description);
              return (
                <tr key={`${title}-${index}`} style={{ borderBottom: "0.5px solid #e2e8f0" }}>
                  <td style={{ padding: 10, lineHeight: 1.6, verticalAlign: "top" }}>
                    <div>{title}</div>
                    {points.length > 0 && (
                      <ul style={{ margin: "6px 0 0", paddingLeft: 16, color: "#555", fontSize: 13 }}>
                        {points.map((point) => (
                          <li key={point}>{point}</li>
                        ))}
                      </ul>
                    )}
                  </td>
                  <td style={{ padding: 10, textAlign: "right", fontWeight: 500, color: "#0F6E56", whiteSpace: "nowrap", verticalAlign: "top" }}>
                    {row.amount > 0 ? `₹${row.amount.toLocaleString("en-IN")}` : "Included"}
                  </td>
                </tr>
              );
            })}
            <tr style={{ background: "#f8fafc" }}>
              <td style={{ padding: 10, fontWeight: 500 }}>Subtotal</td>
              <td style={{ padding: 10, textAlign: "right", fontWeight: 500, color: "#0F6E56" }}>
                ₹{subtotal.toLocaleString("en-IN")}
              </td>
            </tr>
            {(data.taxAmount ?? 0) > 0 && (
              <tr style={{ borderBottom: "0.5px solid #e2e8f0" }}>
                <td style={{ padding: 10, fontSize: 13, color: "#888" }}>Tax / GST</td>
                <td style={{ padding: 10, textAlign: "right", color: "#888" }}>
                  ₹{(data.taxAmount ?? 0).toLocaleString("en-IN")}
                </td>
              </tr>
            )}
            <tr>
              <td style={{ padding: 10, fontWeight: 500, background: "#f8fafc" }}>Total</td>
              <td style={{ padding: 10, textAlign: "right", fontWeight: 500, background: "#f8fafc", color: "#0F6E56" }}>
                ₹{total.toLocaleString("en-IN")}
              </td>
            </tr>
          </tbody>
        </table>

        {/* Total Box */}
        <div style={{ background: "#0F6E56", color: "#fff", borderRadius: 8, padding: "1rem 1.5rem", display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "1rem" }}>
          <div>
            <div style={{ fontSize: 13, opacity: 0.85 }}>Total Amount Payable</div>
            {(data.taxAmount ?? 0) > 0 && (
              <div style={{ fontSize: 12, opacity: 0.65, marginTop: 3 }}>Inclusive of Tax</div>
            )}
          </div>
          <div style={{ fontSize: 24, fontWeight: 600 }}>₹{total.toLocaleString("en-IN")}</div>
        </div>

        {/* Amount in words */}
        <div style={{ background: "#E1F5EE", borderLeft: "4px solid #0F6E56", borderRadius: "0 8px 8px 0", padding: "0.75rem 1.25rem", marginTop: "1rem" }}>
          <p style={{ fontSize: 13, color: "#085041", lineHeight: 1.6 }}>
            In Words: <strong>{toWords(Math.round(total))} Rupees Only</strong>
          </p>
        </div>
      </div>

      {(data.includeRazorpayLink || data.razorpayShortUrl) && (
        <div style={{ marginBottom: "2rem" }}>
          <div style={{ fontSize: 14, fontWeight: 500, color: "#0F6E56", textTransform: "uppercase", letterSpacing: 0.8, borderBottom: "0.5px solid #e2e8f0", paddingBottom: 6, marginBottom: "1rem" }}>Pay Online</div>
          <div style={{ background: "#E1F5EE", borderRadius: 8, padding: "1rem 1.25rem", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16 }}>
            <div>
              <div style={{ fontSize: 13, color: "#085041", fontWeight: 600 }}>Razorpay</div>
              <div style={{ fontSize: 12, color: "#0F6E56", marginTop: 4, wordBreak: "break-all" }}>
                {data.razorpayShortUrl || "Pay link will be generated when you save this invoice."}
              </div>
            </div>
            {data.razorpayShortUrl && (
              <a
                href={data.razorpayShortUrl}
                target="_blank"
                rel="noreferrer"
                style={{ background: "#0F6E56", color: "#fff", borderRadius: 8, padding: "10px 16px", fontSize: 13, fontWeight: 600, textDecoration: "none", whiteSpace: "nowrap" }}
              >
                Pay Now
              </a>
            )}
          </div>
        </div>
      )}

      {data.showBankDetails !== false && (
      <div style={{ marginBottom: "2rem" }}>
        <div style={{ fontSize: 14, fontWeight: 500, color: "#0F6E56", textTransform: "uppercase", letterSpacing: 0.8, borderBottom: "0.5px solid #e2e8f0", paddingBottom: 6, marginBottom: "1rem" }}>Bank Details</div>
        <div style={{ background: "#f8fafc", borderRadius: 8, padding: "1rem 1.25rem" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
            <tbody>
              {[
                ["Account Holder", "Mustafa Karanjawala"],
                ["Account Number", "5330445411"],
                ["Bank Name", "Kotak Mahindra Bank"],
                ["IFSC Code", "KKBK0001847"],
                ["Account Type", "Current"],
              ].map(([label, val]) => (
                <tr key={label} style={{ borderBottom: "0.5px solid #e2e8f0" }}>
                  <td style={{ padding: "9px 10px", color: "#888", fontSize: 13, width: 180 }}>{label}</td>
                  <td style={{ padding: "9px 10px", fontWeight: 500 }}>{val}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      )}

      {/* Footer */}
      <div style={{ borderTop: "0.5px solid #e2e8f0", paddingTop: "1.5rem", textAlign: "center", fontSize: 12, color: "#888", lineHeight: 1.9 }}>
        <p>Thank you for your business — <strong style={{ color: "#0F6E56" }}>Commence Solutions</strong></p>
        <p style={{ marginTop: 8 }}>+91 84465 18154 &nbsp;|&nbsp; mkaranjawala@commencesolutions.com &nbsp;|&nbsp; www.commencesolutions.com</p>
        <p style={{ marginTop: 12, fontWeight: 500, color: "#1a1a1a" }}>
          Authorised Signature:
          <span style={{ fontFamily: "'Segoe Script','Brush Script MT',cursive", fontSize: 22, color: "#1a1a1a", fontStyle: "italic", marginLeft: 8, letterSpacing: 1 }}>Mustafa K</span>
          &nbsp;&nbsp;&nbsp; Date: {dateStr}
        </p>
      </div>
    </div>
  );
}
