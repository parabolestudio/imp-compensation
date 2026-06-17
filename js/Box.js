import { html } from "./preact-htm.js";
import { REPO_URL } from "./helper.js";

export function Box({
  headline,
  headlineIcon,
  headlineRight,
  className,
  children,
  showPlaceholder,
  noData,
  hideHeader,
}) {
  let icon = null;
  if (headlineIcon === "head") {
    icon = html`<img src="${REPO_URL}/assets/icon_head.svg" alt="Head icon" />`;
  } else if (headlineIcon === "house") {
    icon = html`<img
      src="${REPO_URL}/assets/icon_house.svg"
      alt="House icon"
    />`;
  } else if (headlineIcon === "data") {
    icon = html`<img src="${REPO_URL}/assets/icon_data.svg" alt="Data icon" />`;
  }
  return html`<div
    className=${`box ${className || ""} ${showPlaceholder ? "box-placeholder" : ""}`}
  >
    ${!hideHeader && html`<div class="box-header">
      <h2>
        ${icon ? html`<div class="box-header-icon">${icon}</div>` : ""}
        <span>${headline}</span>
      </h2>

      ${headlineRight
        ? html`<div class="box-header-right">${headlineRight}</div>`
        : ""}
    </div>`}
    <div class="box-content">
      ${noData
        ? html`<div class="no-data-note">
            <svg
              width="36"
              height="36"
              viewBox="0 0 36 36"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M18 33.75C9.315 33.75 2.25 26.685 2.25 18C2.25 9.315 9.315 2.25 18 2.25C26.685 2.25 33.75 9.315 33.75 18C33.75 26.685 26.685 33.75 18 33.75ZM18 4.5C10.5525 4.5 4.5 10.5525 4.5 18C4.5 25.4475 10.5525 31.5 18 31.5C25.4475 31.5 31.5 25.4475 31.5 18C31.5 10.5525 25.4475 4.5 18 4.5Z"
                fill="#40B3C2"
              />
              <path
                d="M18 15.1875C18.932 15.1875 19.6875 14.432 19.6875 13.5C19.6875 12.568 18.932 11.8125 18 11.8125C17.068 11.8125 16.3125 12.568 16.3125 13.5C16.3125 14.432 17.068 15.1875 18 15.1875Z"
                fill="#40B3C2"
              />
              <path
                d="M18 27C17.37 27 16.875 26.505 16.875 25.875V19.125C16.875 18.495 17.37 18 18 18C18.63 18 19.125 18.495 19.125 19.125V25.875C19.125 26.505 18.63 27 18 27Z"
                fill="#40B3C2"
              />
            </svg>

            <p>
              No data for the current selection.<br />
              Change the filters to explore other combinations.
            </p>
          </div>`
        : children}
    </div>
  </div>`;
}
