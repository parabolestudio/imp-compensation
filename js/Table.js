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
  { label: "Salary", compType: "Base" },
  { label: "Bonus", compType: "Bonus" },
  { label: "Bonus as % of base", compType: null },
  { label: "Total Compensation", compType: "Total comp" },
];

function formatValue(value) {
  if (value == null) return "XXXX";
  const num = Number(value);
  if (isNaN(num)) return value;
  return num.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  });
}

function getValue(dataByCompType, compType, percentile) {
  const entries = dataByCompType[compType];
  if (!entries) return "XXXX";
  return formatValue(
    entries.find((d) => d.percentile === percentile)?.compensationValue,
  );
}

function getPercentile(dataByCompType, compType, percentile) {
  const entries = dataByCompType[compType];
  if (!entries) return null;
  return entries.find((d) => d.percentile === percentile);
}

export function Table({ data }) {
  const dataByCompType = {};
  if (data) {
    data.forEach((d) => {
      if (!dataByCompType[d.compensationType]) {
        dataByCompType[d.compensationType] = [];
      }
      dataByCompType[d.compensationType].push(d);
    });
  }

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
          ({ label, compType }) => html`
            <tr>
              <td>${label}</td>
              ${PERCENTILES.map((p) => {
                console.log(
                  `Getting value for comp type "${compType}" and percentile "${p}"`,
                );
                let classNames = "";
                if (
                  (p === "50th percentile" || p === "Average") &&
                  compType !== "Total comp"
                ) {
                  classNames += "highlight";
                } else if (
                  (p === "50th percentile" || p === "Average") &&
                  compType === "Total comp"
                ) {
                  classNames += "highlightExtra";
                }
                return html`<td class="${classNames}">
                  ${compType ? getValue(dataByCompType, compType, p) : "xxxx"}
                </td>`;
              })}
            </tr>
          `,
        )}
      </tbody>
    </table>
  `;
}
