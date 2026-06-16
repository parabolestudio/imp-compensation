import { html } from "./preact-htm.js";

const PERCENTILES = [
  "10th percentile",
  "25th percentile",
  "50th percentile",
  "75th percentile",
  "90th percentile",
  "Average",
];

const ROWS = [
  { label: "Salary", compType: "base" },
  { label: "Bonus", compType: "bonusValue" },
  { label: "Bonus as % of base", compType: "bonusPercentage", suffix: "%" },
  { label: "Total Compensation", compType: "totalComp" },
];

function formatValue(value) {
  if (value == null) return "XXXX";
  const num = Number(value);
  if (isNaN(num)) return value;
  return num.toLocaleString("en-US", {
    style: "decimal",
    maximumFractionDigits: 0,
  });
}

const PERCENTILE_KEYS = [10, 25, 50, 75, 90, "avg"];

function getValue(comp, compType, percentileKey) {
  const val = comp?.[compType]?.[percentileKey];
  if (val == null || val === 0) return "-";
  return formatValue(val);
}

export function Table({ data }) {
  const comp = data?.[0]?.comp ?? null;

  return html`
    <table class="table">
      <thead>
        <tr>
          <th>Component</th>
          ${PERCENTILES.map(
            (p) =>
              html`<th>
                ${p === "Average" ? p : p.replace(" percentile", " Percentile")}
              </th>`,
          )}
        </tr>
      </thead>
      <tbody>
        ${ROWS.map(
          ({ label, compType, suffix = "" }) => html`
            <tr>
              <td>${label}</td>
              ${PERCENTILE_KEYS.map((key, i) => {
                const isHighlight = key === 50 || key === "avg";
                const classNames =
                  isHighlight && compType === "totalComp"
                    ? "highlightExtra"
                    : isHighlight
                      ? "highlight"
                      : "";
                return html`<td class="${classNames}">
                  ${getValue(comp, compType, key)}${suffix}
                </td>`;
              })}
            </tr>
          `,
        )}
      </tbody>
    </table>
  `;
}
