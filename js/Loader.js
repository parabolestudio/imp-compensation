import { html } from "./preact-htm.js";
import { REPO_URL } from "./helper.js";

export function Loader({ isLoading, message, imageSrc }) {
  if (!isLoading && !message) return null;
  return html`<div class="loader-overlay">
    ${imageSrc && html`<img src="${imageSrc}" alt="Loading..." />`}
    ${message && html`<p class="loader-message">${message}</p>`}
  </div>`;
}
