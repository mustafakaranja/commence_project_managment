import { format } from "date-fns";
import type { CSSProperties } from "react";
import { poFinancials } from "@/lib/po-payload";

export interface POPreviewData {
  poNumber?: string;
  name?: string;
  type?: string;
  clientName?: string;
  clientAttention?: string;
  clientAddress?: string;
  packageName?: string;
  tagline?: string;
  serviceType?: string;
  listPrice?: number;
  salePrice?: number;
  durationMonths?: number;
  renewalPrice?: number;
  gstPercent?: number;
  poDate?: string;
  validUntil?: string;
  topFeatures?: string[];
  managedFeatures?: string[];
  notes?: string;
}

function rupees(n: number) {
  return `₹ ${n.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function dateLabel(value?: string) {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  return format(d, "dd MMM yyyy");
}

const sectionTitle: CSSProperties = {
  fontSize: 14,
  fontWeight: 500,
  color: "#0F6E56",
  textTransform: "uppercase",
  letterSpacing: 0.8,
  borderBottom: "0.5px solid #e2e8f0",
  paddingBottom: 6,
  marginBottom: "1rem",
};

export default function POPreview({ data }: { data: POPreviewData }) {
  const months = data.durationMonths || 12;
  const sale = data.salePrice ?? 0;
  const list = data.listPrice ?? 0;
  const gstPercent = data.gstPercent ?? 18;
  const money = poFinancials({
    salePrice: sale,
    listPrice: list,
    durationMonths: months,
    gstPercent,
  });
  const top = data.topFeatures ?? [];
  const managed = data.managedFeatures ?? [];
  const notes = (data.notes ?? "").trim();

  return (
    <div
      className="bg-white text-gray-900"
      style={{
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        width: "100%",
        padding: "2rem 2.5rem",
        color: "#1a1a1a",
      }}
    >
      <div style={{ borderBottom: "2px solid #0F6E56", paddingBottom: "1.5rem", marginBottom: "2rem", display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="https://commencesolutions.com/wp-content/uploads/2025/08/commence-logo.svg"
            alt="Commence Solutions"
            style={{ height: 38, marginBottom: 10 }}
            onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
          />
          <h1 style={{ fontSize: 22, fontWeight: 500, color: "#0F6E56" }}>Purchase Order</h1>
          <p style={{ fontSize: 13, color: "#666", marginTop: 4, lineHeight: 1.6 }}>
            Issued by: Commence Solutions — Mustafa Karanjawala<br />
            Contact: +91 84465 18154 | info@commencesolutions.com<br />
            www.commencesolutions.com
          </p>
        </div>
        <div style={{ textAlign: "right" }}>
          <span style={{ background: "#0F6E56", color: "#fff", fontSize: 11, padding: "3px 10px", borderRadius: 4, display: "inline-block", marginBottom: 6, letterSpacing: 0.5, textTransform: "uppercase" }}>
            Purchase Order
          </span>
          <p style={{ fontSize: 13, color: "#666", lineHeight: 1.8 }}>
            <strong>{data.poNumber || "PO-DRAFT"}</strong><br />
            PO Date: {dateLabel(data.poDate)}<br />
            Valid Until: {dateLabel(data.validUntil)}
          </p>
          {data.type && (
            <div style={{ display: "inline-block", background: "#fff3cd", color: "#856404", border: "1px solid #ffc107", fontSize: 11, padding: "3px 10px", borderRadius: 4, marginTop: 6 }}>
              {data.type}{data.name ? ` — ${data.name}` : ""}
            </div>
          )}
        </div>
      </div>

      <div style={{ marginBottom: "2rem" }}>
        <div style={sectionTitle}>Stakeholder Information</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
          <div style={{ background: "#f8fafc", borderRadius: 8, padding: "1rem 1.25rem" }}>
            <h3 style={{ fontSize: 13, color: "#888", marginBottom: 8, fontWeight: 400 }}>Vendor Information</h3>
            <p style={{ fontSize: 14, fontWeight: 500, lineHeight: 1.7 }}>
              <strong style={{ color: "#0F6E56" }}>Commence Solutions</strong><br />
              Nagpur, Maharashtra, India<br />
              info@commencesolutions.com<br />
              +91 84465 18154
            </p>
          </div>
          <div style={{ background: "#f8fafc", borderRadius: 8, padding: "1rem 1.25rem" }}>
            <h3 style={{ fontSize: 13, color: "#888", marginBottom: 8, fontWeight: 400 }}>Client Information</h3>
            <p style={{ fontSize: 14, fontWeight: 500, lineHeight: 1.7 }}>
              <strong style={{ color: "#0F6E56" }}>{data.clientName || "—"}</strong><br />
              {data.clientAttention ? <>Attention: {data.clientAttention}<br /></> : null}
              {data.clientAddress || "—"}
            </p>
          </div>
        </div>
      </div>

      <div style={{ marginBottom: "2rem" }}>
        <div style={sectionTitle}>Service Package Specifications</div>
        <div style={{ background: "#E1F5EE", borderLeft: "4px solid #0F6E56", borderRadius: "0 8px 8px 0", padding: "1rem 1.25rem", marginBottom: "1.25rem" }}>
          <p style={{ fontSize: 14, lineHeight: 1.8, color: "#085041" }}>
            <strong>Package Name:</strong> {data.packageName || "—"}<br />
            <strong>Service Type:</strong> {data.serviceType || data.type || "—"}
            {data.tagline ? <><br />{data.tagline}</> : null}
          </p>
        </div>
        {(top.length > 0 || managed.length > 0) && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            {top.length > 0 && (
              <div style={{ background: "#f8fafc", borderRadius: 8, padding: "1rem 1.25rem" }}>
                <h4 style={{ fontSize: 13, fontWeight: 600, color: "#0F6E56", marginBottom: 10 }}>Top Features</h4>
                <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                  {top.map((item) => (
                    <li key={item} style={{ fontSize: 13, color: "#555", padding: "3px 0", lineHeight: 1.5, display: "flex", gap: 7 }}>
                      <span style={{ color: "#0F6E56" }}>○</span>{item}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {managed.length > 0 && (
              <div style={{ background: "#f8fafc", borderRadius: 8, padding: "1rem 1.25rem" }}>
                <h4 style={{ fontSize: 13, fontWeight: 600, color: "#0F6E56", marginBottom: 10 }}>Managed WordPress</h4>
                <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                  {managed.map((item) => (
                    <li key={item} style={{ fontSize: 13, color: "#555", padding: "3px 0", lineHeight: 1.5, display: "flex", gap: 7 }}>
                      <span style={{ color: "#0F6E56" }}>○</span>{item}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>

      <div style={{ marginBottom: "2rem" }}>
        <div style={sectionTitle}>Financial Summary</div>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
          <thead>
            <tr>
              {["Description", "Unit Price", "Duration", "Total Amount (₹)"].map((h, i) => (
                <th
                  key={h}
                  style={{
                    textAlign: i === 0 ? "left" : "right",
                    fontWeight: 500,
                    fontSize: 13,
                    color: "#666",
                    padding: "8px 10px",
                    borderBottom: "0.5px solid #e2e8f0",
                    background: "#f8fafc",
                  }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr style={{ borderBottom: "0.5px solid #e2e8f0" }}>
              <td style={{ padding: 10 }}>
                {data.packageName || data.name || "Package"}
                {list > sale && (
                  <div style={{ fontSize: 12, color: "#888" }}>List price {rupees(list)} / month</div>
                )}
              </td>
              <td style={{ padding: 10, textAlign: "right", fontWeight: 500, color: "#0F6E56", whiteSpace: "nowrap" }}>
                {rupees(sale)} / month
              </td>
              <td style={{ padding: 10, textAlign: "right", fontWeight: 500, color: "#0F6E56", whiteSpace: "nowrap" }}>
                {months} Months
              </td>
              <td style={{ padding: 10, textAlign: "right", fontWeight: 500, color: "#0F6E56", whiteSpace: "nowrap" }}>
                {rupees(money.subtotal)}
              </td>
            </tr>
            <tr style={{ background: "#f8fafc" }}>
              <td colSpan={3} style={{ padding: 10, fontWeight: 500 }}>Subtotal</td>
              <td style={{ padding: 10, textAlign: "right", fontWeight: 500, color: "#0F6E56" }}>{rupees(money.subtotal)}</td>
            </tr>
            {gstPercent > 0 && (
              <tr>
                <td colSpan={3} style={{ padding: 10, fontSize: 12, color: "#888" }}>GST @ {gstPercent}%</td>
                <td style={{ padding: 10, textAlign: "right", color: "#888" }}>{rupees(money.gst)}</td>
              </tr>
            )}
          </tbody>
        </table>
        <div style={{ background: "#0F6E56", color: "#fff", borderRadius: 8, padding: "1rem 1.5rem", display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "1rem" }}>
          <div>
            <div style={{ fontSize: 13, opacity: 0.85 }}>Total Amount Payable</div>
            <div style={{ fontSize: 12, opacity: 0.65, marginTop: 3 }}>
              Future Renewal Rate: {rupees(data.renewalPrice ?? list)} / month
            </div>
          </div>
          <div style={{ fontSize: 24, fontWeight: 600 }}>{rupees(money.total)}</div>
        </div>
      </div>

      <div style={{ marginBottom: "2rem" }}>
        <div style={sectionTitle}>Terms of Service & Payment</div>
        <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
          {[
            ["Payment Schedule:", "Full payment is due immediately upon acceptance of this Purchase Order."],
            ["Payment Method:", "Bank Transfer / UPI — details to be provided upon acceptance."],
            ["Service Activation:", "Services will be activated promptly following payment confirmation."],
            ["Cancellation & Renewal:", `This is an annual subscription with automatic renewal. A 30-day written notice is required prior to the renewal date to cancel. If notice is not received, the subscription will renew at the standard rate of ${rupees(data.renewalPrice ?? list)}/month.`],
            ["Currency:", "All financial figures are quoted in Indian Rupees (₹)."],
            ["Validity:", "This quote is valid for 30 days from the date of issue."],
          ].map(([title, body]) => (
            <li key={title} style={{ fontSize: 14, lineHeight: 1.8, padding: "7px 0", borderBottom: "0.5px solid #e2e8f0", display: "flex", gap: 10 }}>
              <span style={{ color: "#0F6E56", fontWeight: 600 }}>●</span>
              <div><strong>{title}</strong> {body}</div>
            </li>
          ))}
        </ul>
      </div>

      <div style={{ marginBottom: "2rem" }}>
        <div style={sectionTitle}>Authorization & Notes</div>
        <div style={{ background: "#f8fafc", borderRadius: 8, padding: "1rem 1.25rem", marginBottom: "1rem" }}>
          <strong style={{ fontSize: 13, color: "#0F6E56", display: "block", marginBottom: 8 }}>Additional Notes</strong>
          <p style={{ fontSize: 13, color: "#555" }}>
            {notes || "No additional client requests recorded at time of issuance."}
          </p>
        </div>
        <div style={{ background: "#f8fafc", borderRadius: 8, padding: "1.25rem 1.5rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: "1.5rem" }}>
            <div>
              <span style={{ display: "block", color: "#888", fontSize: 12, marginBottom: 4 }}>Authorized Signature</span>
              <div style={{ borderBottom: "1px solid #cbd5e1", minWidth: 180, paddingBottom: 3, fontWeight: 500, color: "#0F6E56", fontSize: 15 }}>Mustafa Karanjawala</div>
            </div>
            <div>
              <span style={{ display: "block", color: "#888", fontSize: 12, marginBottom: 4 }}>Designation</span>
              <div style={{ borderBottom: "1px solid #cbd5e1", minWidth: 140, paddingBottom: 3, fontWeight: 500, color: "#0F6E56", fontSize: 15 }}>Director</div>
            </div>
            <div>
              <span style={{ display: "block", color: "#888", fontSize: 12, marginBottom: 4 }}>Date</span>
              <div style={{ borderBottom: "1px solid #cbd5e1", minWidth: 140, paddingBottom: 3, fontWeight: 500, color: "#0F6E56", fontSize: 15 }}>{dateLabel(data.poDate)}</div>
            </div>
          </div>
        </div>
      </div>

      <div style={{ borderTop: "0.5px solid #e2e8f0", paddingTop: "1.5rem", textAlign: "center", fontSize: 12, color: "#888", lineHeight: 1.9 }}>
        <p>
          This Purchase Order is issued by <strong style={{ color: "#0F6E56" }}>Commence Solutions</strong>
          {data.clientName ? <> for <strong style={{ color: "#0F6E56" }}>{data.clientName}</strong></> : null}
        </p>
        <p style={{ marginTop: 8 }}>
          For queries: <strong>+91 84465 18154</strong>
          {" | info@commencesolutions.com | Mustafa Karanjawala | Commence Solutions, Nagpur"}
        </p>
        <p style={{ marginTop: 12, fontWeight: 500, color: "#1a1a1a" }}>
          {"Client Acceptance Signature: _______________________    Date: _____________"}
        </p>
        <p style={{ marginTop: 10, fontSize: 11 }}>
          {"Commence Solutions · Nagpur, Maharashtra · www.commencesolutions.com · +91 84465 18154"}
        </p>
      </div>
    </div>
  );
}
