import { html } from "./preact-htm.js";

export function FilterContainer({ filters, showPlaceholder }) {
  return html`<div
    class="filter-container ${showPlaceholder
      ? "filter-container-placeholder"
      : ""}"
  >
    ${filters.map((filter, index) => {
      const filterName = filter.label;
      const filterValue = filter.value;
      return html`
        <div key=${index} class="filter">
          <label class="text-tags-large" for=${filterName}>${filterName}</label>
          <select
            id=${filterName}
            name=${filterName}
            onchange=${(e) => filter.onChange(e.target.value)}
          >
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
              ? html`<option value="${filterValue}">${filterValue}</option>`
              : ""}
          </select>
        </div>
      `;
    })}
  </div> `;
}
