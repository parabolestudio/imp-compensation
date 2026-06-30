import { html } from "./preact-htm.js";

export function FilterContainer({ filters, showPlaceholder, onClearAll }) {
  return html`<div class="filter-wrapper">
    <div class="filter-wrapper-top">
      <p class="text-descriptions">
        Select a value for each of the filters, starting with the team filter.
      </p>
      <button class="clear-all-button text-annotations" onclick=${onClearAll}>
        Clear all
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="7"
          height="7"
          fill="none"
          viewBox="0 0 7 7"
        >
          <path
            fill="#738287"
            d="M5.832 6.95 0 1.13 1.124 0 6.95 5.832 5.832 6.95Zm-4.708 0L0 5.832 5.832 0 6.95 1.129 1.124 6.95Z"
          />
        </svg>
      </button>
    </div>
    <div
      class="filter-container ${showPlaceholder
        ? "filter-container-placeholder"
        : ""}"
    >
      ${filters.map((filter, index) => {
        const filterName = filter.label;
        const filterValue = filter.value;
        return html`
          <div key=${index} class="filter">
            <label class="text-tags-large" for=${filterName}
              >${filterName}</label
            >
            <select
              id=${filterName}
              name=${filterName}
              disabled=${filter.disabled}
              onchange=${(e) => filter.onChange(e.target.value)}
            >
              ${filterValue == null &&
              html`<option value="" disabled selected>Select</option>`}
              ${filter &&
              filter.options.map((option) => {
                return html`<option
                  value=${option.value}
                  selected=${option.value === filterValue}
                >
                  ${option.label}
                </option>`;
              })}
              ${!filter.options || filter.options.length === 0
                ? filterValue != null
                  ? html`<option value="${filterValue}">${filterValue}</option>`
                  : ""
                : ""}
            </select>
          </div>
        `;
      })}
    </div>
  </div> `;
}
