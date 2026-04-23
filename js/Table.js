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
  { label: "Bonus", compType: "bonus" },
  { label: "Bonus as % of base", compType: "bonusPercentage" },
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

function getValue(dataByCompType, compType, percentile) {
  const entries = dataByCompType[compType];
  if (!entries) return "XXXX";
  return formatValue(entries.find((d) => d.percentile === percentile)?.value);
}

function getPercentile(dataByCompType, compType, percentile) {
  const entries = dataByCompType[compType];
  if (!entries) return null;
  return entries.find((d) => d.percentile === percentile);
}

export function Table({ data }) {
  const dataByCompType = {
    base: [],
    bonus: [],
    bonusPercentage: [],
    totalComp: [],
  };

  if (Array.isArray(data)) {
    data.forEach((entry) => {
      dataByCompType.base.push({
        percentile: entry.percentile,
        value: entry.compValueBase,
      });
      dataByCompType.bonus.push({
        percentile: entry.percentile,
        value: entry.compValueBonus,
      });
      dataByCompType.totalComp.push({
        percentile: entry.percentile,
        value: entry.compValueTotal,
      });
      dataByCompType.bonusPercentage.push({
        percentile: entry.percentile,
        value: entry.compValueBonusPercentage,
      });
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
