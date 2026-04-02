import { html } from "./preact-htm.js";

export function DataHighlight({ headline, value }) {
  return html`<div class="data-highlight">
    <div class="data-highlight-headline text-tags-small">${headline}</div>
    <div class="data-highlight-value text-big-numbers-medium">${value}</div>
  </div>`;
}
