import { html } from "./preact-htm.js";
import { REPO_URL } from "./helper.js";

export function Loader({ isLoading }) {
  if (!isLoading) return null;
  return html`<div class="loader-overlay">
    <img src="${REPO_URL}/assets/loader_circle.gif" alt="Loading..." />
  </div>`;
}
