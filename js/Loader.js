import { html } from "./preact-htm.js";
import { REPO_URL } from "./helper.js";

export function Loader({ isLoading }) {
  if (!isLoading) return null;
  //   <img src="${REPO_URL}/assets/loader_100px.gif" alt="Loading..." />
  return html`<div class="loader-overlay">
    <img src="../assets/loader_100px.gif" alt="Loading..." />
  </div>`;
}
