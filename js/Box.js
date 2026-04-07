import { html } from "./preact-htm.js";

export function Box({
  headline,
  headlineIcon,
  headlineRight,
  className,
  children,
}) {
  let icon = null;
  if (headlineIcon === "head") {
    icon = html`<img src="./assets/icon_head.svg" alt="Head icon" />`;
  } else if (headlineIcon === "house") {
    icon = html`<img src="./assets/icon_house.svg" alt="House icon" />`;
  } else if (headlineIcon === "data") {
    icon = html`<img src="./assets/icon_data.svg" alt="Data icon" />`;
  }
  return html`<div className=${`box ${className || ""}`}>
    <div class="box-header">
      <h2>
        ${icon ? html`<div class="box-header-icon">${icon}</div>` : ""}
        <span>${headline}</span>
      </h2>

      ${headlineRight
        ? html`<div class="box-header-right">${headlineRight}</div>`
        : ""}
    </div>
    <div class="box-content">${children}</div>
  </div>`;
}
