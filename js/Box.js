import { html } from "./preact-htm.js";

export function Box({ headline, className, children }) {
  return html`<div className=${`box ${className || ""}`}>
    <h2>${headline}</h2>
    <div>${children}</div>
  </div>`;
}
