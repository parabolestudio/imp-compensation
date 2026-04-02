import { html } from "./preact-htm.js";

export function Box({ headline, headlineRight, className, children }) {
  return html`<div className=${`box ${className || ""}`}>
    <div class="box-header">
      <h2>${headline}</h2>
      ${headlineRight
        ? html`<div class="box-header-right">${headlineRight}</div>`
        : ""}
    </div>
    <div class="box-content">${children}</div>
  </div>`;
}
