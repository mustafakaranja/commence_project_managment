import { format } from "date-fns";
import type { CSSProperties } from "react";
import { OWNERSHIP_NOTICE, isSubscriptionQuote } from "@/lib/quotation-catalog";
import { quotationTotals, subscriptionTotals } from "@/lib/quotation-payload";

export interface QuotationServicePreview {
  title: string;
  description?: string;
  amount: number;
}

export interface SpecGroupPreview {
  title: string;
  items: string[];
}

export interface QuotationPreviewData {
  quoteNumber?: string;
  name?: string;
  type?: string;
  clientName?: string;
  clientAttention?: string;
  clientAddress?: string;
  overview?: string;
  techStack?: string[];
  timelineValue?: number;
  timelineUnit?: string;
  estimateLabel?: string;
  services?: QuotationServicePreview[];
  features?: string[];
  gstPercent?: number;
  quoteDate?: string;
  validUntil?: string;
  notes?: string;
  commitment?: string;
  packageName?: string;
  serviceType?: string;
  specGroups?: SpecGroupPreview[];
  unitPrice?: number;
  durationMonths?: number;
  subscriptionYears?: number;
  renewalPrice?: number;
  financeNote?: string;
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

function bullets(text?: string) {
  return (text ?? "")
    .split("\n")
    .map((line) => line.replace(/^[-•]\s*/, "").trim())
    .filter(Boolean);
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

function Header({ data }: { data: QuotationPreviewData }) {
  return (
    <div style={{ borderBottom: "2px solid #0F6E56", paddingBottom: "1.5rem", marginBottom: "2rem", display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "1rem" }}>
      <div>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="https://commencesolutions.com/wp-content/uploads/2025/08/commence-logo.svg"
          alt="Commence Solutions"
          style={{ height: 38, marginBottom: 10 }}
          onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
        />
        <h1 style={{ fontSize: 22, fontWeight: 500, color: "#0F6E56" }}>Project Quotation</h1>
        <p style={{ fontSize: 13, color: "#666", marginTop: 4, lineHeight: 1.6 }}>
          Issued by: Commence Solutions — Mustafa Karanjawala<br />
          Contact: +91 84465 18154 | info@commencesolutions.com<br />
          www.commencesolutions.com
        </p>
      </div>
      <div style={{ textAlign: "right" }}>
        <span style={{ background: "#0F6E56", color: "#fff", fontSize: 11, padding: "3px 10px", borderRadius: 4, display: "inline-block", marginBottom: 6, letterSpacing: 0.5, textTransform: "uppercase" }}>
          Quotation
        </span>
        <p style={{ fontSize: 13, color: "#666", lineHeight: 1.8 }}>
          <strong>{data.quoteNumber || "QT-DRAFT"}</strong><br />
          Date: {dateLabel(data.quoteDate)}<br />
          Valid until: {dateLabel(data.validUntil)}
        </p>
        {data.type && (
          <div style={{ display: "inline-block", background: "#E1F5EE", color: "#085041", border: "1px solid #0F6E56", fontSize: 11, padding: "3px 10px", borderRadius: 4, marginTop: 6 }}>
            {data.type}{data.name ? ` — ${data.name}` : ""}
          </div>
        )}
      </div>
    </div>
  );
}

function PreparedFor({ data }: { data: QuotationPreviewData }) {
  return (
    <div style={{ marginBottom: "2rem" }}>
      <div style={sectionTitle}>Prepared for</div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
        <div style={{ background: "#f8fafc", borderRadius: 8, padding: "1rem 1.25rem" }}>
          <h3 style={{ fontSize: 13, color: "#888", marginBottom: 8, fontWeight: 400 }}>Vendor</h3>
          <p style={{ fontSize: 14, fontWeight: 500, lineHeight: 1.7 }}>
            <strong style={{ color: "#0F6E56" }}>Commence Solutions</strong><br />
            Nagpur, Maharashtra, India<br />
            info@commencesolutions.com<br />
            +91 84465 18154
          </p>
        </div>
        <div style={{ background: "#f8fafc", borderRadius: 8, padding: "1rem 1.25rem" }}>
          <h3 style={{ fontSize: 13, color: "#888", marginBottom: 8, fontWeight: 400 }}>Client</h3>
          <p style={{ fontSize: 14, fontWeight: 500, lineHeight: 1.7 }}>
            <strong style={{ color: "#0F6E56" }}>{data.clientName || "—"}</strong><br />
            {data.clientAttention ? <>Attention: {data.clientAttention}<br /></> : null}
            {data.clientAddress || "—"}
          </p>
        </div>
      </div>
    </div>
  );
}

function Footer({ data }: { data: QuotationPreviewData }) {
  return (
    <div style={{ borderTop: "0.5px solid #e2e8f0", paddingTop: "1.5rem", textAlign: "center", fontSize: 12, color: "#888", lineHeight: 1.9 }}>
      <p>
        This quotation is issued by <strong style={{ color: "#0F6E56" }}>Commence Solutions</strong>
        {data.clientName ? <> for <strong style={{ color: "#0F6E56" }}>{data.clientName}</strong></> : null}
      </p>
      <p style={{ marginTop: 8 }}>
        For queries: <strong>+91 84465 18154</strong>
        {" | info@commencesolutions.com | Mustafa Karanjawala | Commence Solutions, Nagpur"}
      </p>
      <p style={{ marginTop: 12, fontWeight: 500, color: "#1a1a1a" }}>
        {"Client Acceptance Signature: _______________________    Date: _____________"}
      </p>
    </div>
  );
}

function SubscriptionBody({ data }: { data: QuotationPreviewData }) {
  const gstPercent = data.gstPercent ?? 18;
  const unitPrice = Number(data.unitPrice) || 0;
  const duration = Number(data.durationMonths) || 0;
  const money = subscriptionTotals(unitPrice, duration, gstPercent);
  const groups = (data.specGroups ?? []).filter((g) => g.title.trim() && g.items.length > 0);
  const notes = (data.notes ?? "").trim();
  const renewal = Number(data.renewalPrice) || 0;
  const financeNote = (data.financeNote ?? "").trim()
    || (renewal > 0 ? `Future Renewal Rate: ${rupees(renewal)}/month.` : "");
  const packageName = data.packageName || data.name || "Service package";

  return (
    <>
      {(data.overview || "").trim() ? (
        <div style={{ marginBottom: "2rem" }}>
          <div style={sectionTitle}>Project overview</div>
          <div style={{ background: "#E1F5EE", borderLeft: "4px solid #0F6E56", borderRadius: "0 8px 8px 0", padding: "1rem 1.25rem" }}>
            <p style={{ fontSize: 14, lineHeight: 1.8, color: "#085041", whiteSpace: "pre-wrap" }}>
              {data.overview}
            </p>
          </div>
        </div>
      ) : null}

      <div style={{ marginBottom: "2rem" }}>
        <div style={sectionTitle}>Service Package Specifications</div>
        <div style={{ background: "#E1F5EE", borderLeft: "4px solid #0F6E56", borderRadius: "0 8px 8px 0", padding: "1rem 1.25rem", marginBottom: "1.25rem" }}>
          <p style={{ fontSize: 14, lineHeight: 1.8, color: "#085041" }}>
            <strong>Package Name:</strong> {packageName}<br />
            <strong>Service Type:</strong> {data.serviceType || "Annual Subscription"}
          </p>
        </div>
        {groups.length > 0 && (
          <div>
            <p style={{ fontSize: 13, fontWeight: 600, color: "#0F6E56", marginBottom: 10 }}>Technical Features:</p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              {groups.map((group) => (
                <div key={group.title} style={{ background: "#f8fafc", borderRadius: 8, padding: "1rem 1.25rem" }}>
                  <h4 style={{ fontSize: 13, fontWeight: 600, color: "#0F6E56", marginBottom: 10 }}>{group.title}</h4>
                  <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                    {group.items.map((item) => (
                      <li key={item} style={{ fontSize: 13, color: "#555", padding: "3px 0", lineHeight: 1.5, display: "flex", gap: 7 }}>
                        <span style={{ color: "#0F6E56" }}>○</span>{item}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
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
                {packageName}
                {data.subscriptionYears ? (
                  <div style={{ fontSize: 12, color: "#888" }}>
                    {data.subscriptionYears} year{data.subscriptionYears === 1 ? "" : "s"}
                  </div>
                ) : null}
              </td>
              <td style={{ padding: 10, textAlign: "right", fontWeight: 500, color: "#0F6E56", whiteSpace: "nowrap" }}>
                {rupees(unitPrice)} / month
              </td>
              <td style={{ padding: 10, textAlign: "right", fontWeight: 500, color: "#0F6E56", whiteSpace: "nowrap" }}>
                {duration || "—"} Months
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
            {renewal > 0 && (
              <div style={{ fontSize: 12, opacity: 0.65, marginTop: 3 }}>
                Future Renewal Rate: {rupees(renewal)} / month
              </div>
            )}
          </div>
          <div style={{ fontSize: 24, fontWeight: 600 }}>{rupees(money.total)}</div>
        </div>
        {financeNote ? (
          <p style={{ fontSize: 13, color: "#555", marginTop: 10 }}>Note: {financeNote.replace(/^Note:\s*/i, "")}</p>
        ) : null}
      </div>

      <div style={{ marginBottom: "2rem" }}>
        <div style={sectionTitle}>Terms of Service and Payment</div>
        <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
          {[
            ["Payment Schedule:", "Full payment is due immediately upon acceptance of this Purchase Order."],
            ["Payment Method:", "Bank Transfer / UPI — details to be provided upon acceptance."],
            ["Service Activation:", "Services will be activated promptly following payment confirmation."],
            [
              "Cancellation & Renewal:",
              `This is an annual subscription with automatic renewal. A 30-day written notice is required prior to the renewal date to cancel. If notice is not received, the subscription will renew at the standard rate of ${renewal > 0 ? rupees(renewal) : "₹1,699.00"}/month.`,
            ],
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
        <div style={sectionTitle}>Ownership and Data Rights (Critical Legal Notice)</div>
        <div style={{ background: "#fff7ed", border: "1px solid #fdba74", borderRadius: 8, padding: "1rem 1.25rem" }}>
          <p style={{ fontSize: 13, lineHeight: 1.75, color: "#7c2d12" }}>{OWNERSHIP_NOTICE}</p>
        </div>
      </div>

      <div style={{ marginBottom: "2rem" }}>
        <div style={sectionTitle}>Authorization & Notes</div>
        <div style={{ background: "#f8fafc", borderRadius: 8, padding: "1rem 1.25rem", marginBottom: "1rem" }}>
          <strong style={{ fontSize: 13, color: "#0F6E56", display: "block", marginBottom: 8 }}>Additional Notes</strong>
          <p style={{ fontSize: 13, color: "#555", whiteSpace: "pre-wrap" }}>
            {notes || "No additional client requests recorded at time of issuance.\nStandard technical support available during business hours."}
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
              <div style={{ borderBottom: "1px solid #cbd5e1", minWidth: 140, paddingBottom: 3, fontWeight: 500, color: "#0F6E56", fontSize: 15 }}>{dateLabel(data.quoteDate)}</div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

function OneTimeBody({ data }: { data: QuotationPreviewData }) {
  const services = (data.services ?? []).filter((s) => s.title.trim());
  const gstPercent = data.gstPercent ?? 18;
  const money = quotationTotals(services, gstPercent);
  const features = data.features ?? [];
  const tech = data.techStack ?? [];
  const notes = (data.notes ?? "").trim();
  const commitment = (data.commitment ?? "").trim();
  const timeline = data.timelineValue
    ? `${data.timelineValue} ${data.timelineUnit || "Days"}`
    : "—";

  return (
    <>
      {(data.overview || "").trim() ? (
        <div style={{ marginBottom: "2rem" }}>
          <div style={sectionTitle}>Project overview</div>
          <div style={{ background: "#E1F5EE", borderLeft: "4px solid #0F6E56", borderRadius: "0 8px 8px 0", padding: "1rem 1.25rem" }}>
            <p style={{ fontSize: 14, lineHeight: 1.8, color: "#085041", whiteSpace: "pre-wrap" }}>
              {data.overview}
            </p>
          </div>
        </div>
      ) : null}

      <div style={{ marginBottom: "2rem" }}>
        <div style={sectionTitle}>Timeline & estimate</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
          {[
            ["Project timeline", timeline],
            ["Estimate", data.estimateLabel || "One-time cost estimation"],
            ["Service", data.type || "—"],
          ].map(([label, value]) => (
            <div key={label} style={{ background: "#f8fafc", borderRadius: 8, padding: "0.9rem 1rem" }}>
              <p style={{ fontSize: 11, color: "#888", textTransform: "uppercase", letterSpacing: 0.4 }}>{label}</p>
              <p style={{ fontSize: 15, fontWeight: 600, color: "#0F6E56", marginTop: 4 }}>{value}</p>
            </div>
          ))}
        </div>
      </div>

      {tech.length > 0 && (
        <div style={{ marginBottom: "2rem" }}>
          <div style={sectionTitle}>Project tech</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {tech.map((item) => (
              <span
                key={item}
                style={{
                  fontSize: 12,
                  background: "#f8fafc",
                  border: "1px solid #e2e8f0",
                  color: "#085041",
                  padding: "4px 10px",
                  borderRadius: 99,
                }}
              >
                {item}
              </span>
            ))}
          </div>
        </div>
      )}

      <div style={{ marginBottom: "2rem" }}>
        <div style={sectionTitle}>Cost estimation</div>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
          <thead>
            <tr>
              {["#", "Service", "Amount (₹)"].map((h, i) => (
                <th
                  key={h}
                  style={{
                    textAlign: i === 2 ? "right" : "left",
                    fontWeight: 500,
                    fontSize: 13,
                    color: "#666",
                    padding: "8px 10px",
                    borderBottom: "0.5px solid #e2e8f0",
                    background: "#f8fafc",
                    width: i === 0 ? 36 : undefined,
                  }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {services.length === 0 ? (
              <tr>
                <td colSpan={3} style={{ padding: 14, color: "#888", textAlign: "center" }}>
                  Services will appear here as you add them
                </td>
              </tr>
            ) : services.map((row, index) => {
              const points = bullets(row.description);
              return (
                <tr key={`${row.title}-${index}`} style={{ borderBottom: "0.5px solid #e2e8f0" }}>
                  <td style={{ padding: "12px 10px", color: "#888", verticalAlign: "top" }}>{index + 1}</td>
                  <td style={{ padding: "12px 10px", verticalAlign: "top" }}>
                    <div style={{ fontWeight: 600, color: "#1a1a1a" }}>{row.title}</div>
                    {points.length > 0 && (
                      <ul style={{ margin: "6px 0 0", paddingLeft: 16, color: "#555", fontSize: 13, lineHeight: 1.55 }}>
                        {points.map((point) => (
                          <li key={point}>{point}</li>
                        ))}
                      </ul>
                    )}
                  </td>
                  <td style={{ padding: "12px 10px", textAlign: "right", fontWeight: 500, color: "#0F6E56", whiteSpace: "nowrap", verticalAlign: "top" }}>
                    {row.amount > 0 ? rupees(row.amount) : "Included"}
                  </td>
                </tr>
              );
            })}
            <tr style={{ background: "#f8fafc" }}>
              <td colSpan={2} style={{ padding: 10, fontWeight: 500 }}>Subtotal</td>
              <td style={{ padding: 10, textAlign: "right", fontWeight: 500, color: "#0F6E56" }}>{rupees(money.subtotal)}</td>
            </tr>
            {gstPercent > 0 && (
              <tr>
                <td colSpan={2} style={{ padding: 10, fontSize: 12, color: "#888" }}>GST @ {gstPercent}%</td>
                <td style={{ padding: 10, textAlign: "right", color: "#888" }}>{rupees(money.gst)}</td>
              </tr>
            )}
          </tbody>
        </table>
        <div style={{ background: "#0F6E56", color: "#fff", borderRadius: 8, padding: "1rem 1.5rem", display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "1rem" }}>
          <div>
            <div style={{ fontSize: 13, opacity: 0.85 }}>Total investment</div>
            <div style={{ fontSize: 12, opacity: 0.65, marginTop: 3 }}>
              {data.estimateLabel || "One-time cost estimation"} · Delivery in {timeline}
            </div>
          </div>
          <div style={{ fontSize: 24, fontWeight: 600 }}>{rupees(money.total)}</div>
        </div>
      </div>

      {features.length > 0 && (
        <div style={{ marginBottom: "2rem" }}>
          <div style={sectionTitle}>What you get</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "4px 16px" }}>
            {features.map((item) => (
              <div key={item} style={{ fontSize: 13, color: "#555", padding: "5px 0", display: "flex", gap: 8, lineHeight: 1.5 }}>
                <span style={{ color: "#0F6E56" }}>○</span>
                {item}
              </div>
            ))}
          </div>
        </div>
      )}

      <div style={{ marginBottom: "2rem" }}>
        <div style={sectionTitle}>Rollout notes</div>
        <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
          {[
            ["Validity:", `This quotation is valid until ${dateLabel(data.validUntil)}.`],
            ["Payment:", "Work starts after written acceptance. Invoice follows the agreed milestone."],
            ["Scope:", "Items listed above are included. Anything extra is quoted separately."],
            ["Go-live:", `Target delivery is ${timeline} from project kickoff, subject to timely inputs.`],
          ].map(([title, body]) => (
            <li key={title} style={{ fontSize: 14, lineHeight: 1.8, padding: "7px 0", borderBottom: "0.5px solid #e2e8f0", display: "flex", gap: 10 }}>
              <span style={{ color: "#0F6E56", fontWeight: 600 }}>●</span>
              <div><strong>{title}</strong> {body}</div>
            </li>
          ))}
        </ul>
        {notes ? (
          <p style={{ fontSize: 13, color: "#555", marginTop: 12, whiteSpace: "pre-wrap" }}>{notes}</p>
        ) : null}
        {commitment ? (
          <p style={{ fontSize: 13, color: "#085041", marginTop: 12, background: "#E1F5EE", borderRadius: 8, padding: "12px 14px", lineHeight: 1.7 }}>
            {commitment}
          </p>
        ) : null}
      </div>
    </>
  );
}

export default function QuotationPreview({ data }: { data: QuotationPreviewData }) {
  const subscription = isSubscriptionQuote(data.type);

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
      <Header data={data} />
      <PreparedFor data={data} />
      {subscription ? <SubscriptionBody data={data} /> : <OneTimeBody data={data} />}
      <Footer data={data} />
    </div>
  );
}
