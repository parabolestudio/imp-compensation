console.log("Viz script loaded");

import { html, renderComponent } from "./js/preact-htm.js";
import { Page } from "./js/Page.js";

function renderPage(page) {
  const containerElement = document.getElementById(page.id);
  if (containerElement) {
    // clear existing content before rendering
    containerElement.innerHTML = "";

    renderComponent(
      html`<${Page} assetClass=${page.assetClass} />`,
      containerElement,
    );
  } else {
    console.error(
      `Could not find container element for page with id ${page.id}`,
    );
  }
}

renderPage({
  id: "custom-page-container-compensation-report-private-equity",
  assetClass: "Private equity",
});

renderPage({
  id: "custom-page-container-compensation-report-credit",
  assetClass: "Private debt",
});

renderPage({
  id: "custom-page-container-compensation-report-real-assets",
  assetClass: "Real assets",
});
