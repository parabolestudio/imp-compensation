import { html } from "./preact-htm.js";

function PercentageVis({ visValue }) {
  const boxes = Array.from({ length: 10 }, (_, i) => {
    const fillPercent = Math.min(
      100,
      Math.max(0, ((visValue - i * 10) / 10) * 100),
    );
    const style =
      fillPercent === 0
        ? {}
        : fillPercent === 100
          ? { background: "#40B3C2" }
          : {
              background: `linear-gradient(to right, #40B3C2 ${fillPercent}%, white ${fillPercent}%)`,
            };
    return html`<div class="pct-box" style=${style}></div>`;
  });
  return html`<div class="pct-vis">${boxes}</div>`;
}

export function DataHighlight({ headline, value, vis, visValue }) {
  return html`<div class="data-highlight">
    <div class="data-highlight-headline text-tags-small">${headline}</div>
    <div style="display: flex; align-items: center; gap: 12px;">
      <div class="data-highlight-value text-big-numbers-medium">${value}</div>
      ${vis === "percentage" && visValue != null
        ? html`<${PercentageVis} visValue=${visValue} />`
        : null}
    </div>
  </div>`;
}
