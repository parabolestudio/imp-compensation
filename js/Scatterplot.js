import { html } from "./preact-htm.js";

export function Scatterplot() {
  const width = 400;
  const height = 300;
  const margin = { top: 0, right: 0, bottom: 0, left: 0 };
  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;

  return html`
    <div class="scatterplot">
      <svg viewBox="0 0 ${width} ${height}">
        <g transform="translate(${margin.left}, ${margin.top})">
          <rect
            x="0"
            y="0"
            width="${innerWidth}"
            height="${innerHeight}"
            fill="#f0f0f0"
          />
        </g>
      </svg>
    </div>
  `;
}
