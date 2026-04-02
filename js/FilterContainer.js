import { html } from "./preact-htm.js";

export function FilterContainer({ filters }) {
  return html`<div class="filter-container">
    ${filters.map((filter, index) => {
      const filterName = filter.label;
      const filterValue = filter.value;
      return html`
        <div key=${index}>
          <label for=${filterName}>${filterName}</label>
          <select
            id=${filterName}
            name=${filterName}
            onchange=${(e) => filter.onChange(e.target.value)}
          >
            ${filter.options.map((option) => {
              return html`<option
                value=${option.value}
                selected=${option.value === filterValue}
              >
                ${option.label}
              </option>`;
            })}
          </select>
        </div>
      `;
    })}
  </div> `;
}
