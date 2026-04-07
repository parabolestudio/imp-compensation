import { html } from "./preact-htm.js";

export function Table() {
  return html`
    <table class="table">
      <thead>
        <tr>
          <th>Component</th>
          <th>10th Percentile</th>
          <th>25th Percentile</th>
          <th>50th Percentile</th>
          <th>75th Percentile</th>
          <th>90th Percentile</th>
          <th>Average</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>Salary</td>
          <td>xxxx</td>
          <td>xxxx</td>
          <td>xxxx</td>
          <td>xxxx</td>
          <td>xxxx</td>
          <td>xxxx</td>
        </tr>
        <tr>
          <td>Bonus</td>
          <td>xxxx</td>
          <td>xxxx</td>
          <td>xxxx</td>
          <td>xxxx</td>
          <td>xxxx</td>
          <td>xxxx</td>
        </tr>
        <tr>
          <td>Bonus as % of base</td>
          <td>xxxx</td>
          <td>xxxx</td>
          <td>xxxx</td>
          <td>xxxx</td>
          <td>xxxx</td>
          <td>xxxx</td>
        </tr>
        <tr>
          <td>Total Compensation</td>
          <td>xxxx</td>
          <td>xxxx</td>
          <td>xxxx</td>
          <td>xxxx</td>
          <td>xxxx</td>
          <td>xxxx</td>
        </tr>
      </tbody>
    </table>
  `;
}
// ${dataFiltered.map((row, index) => {
//   return html`
//     <tr key=${index}>
//       <td>${row.aumBand}</td>
//       <td>${row.buyoutRef}</td>
//       <td>${row.compType}</td>
//       <td>${row.dataAvailability}</td>
//       <td>${row.distressedRef}</td>
//       <td>${row.compensationValue}</td>
//       <td>${row.infraRef}</td>
//       <td>${row.reRatio}</td>
//       <td>${row.role}</td>
//     </tr>
//   `;
// })}
