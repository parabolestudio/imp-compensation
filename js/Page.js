import { html, useEffect, useState } from "./preact-htm.js";
import { fetchGoogleSheetCSV } from "./dataLoader.js";

export function Page({ assetClass }) {
  const [data, setData] = useState([]);

  useEffect(() => {
    fetchGoogleSheetCSV("main-data")
      .then((data) => setData(data))
      .catch((error) => {
        console.error("Error fetching sheet data (main data):", error);
      });
  }, []);

  console.log("Page component data:", data);

  if (!data || data.length === 0) {
    return html`
      <div class="page">
        <p>Loading data...</p>
      </div>
    `;
  }

  return html`
    <div class="page">
      <p>Asset Class: ${assetClass}</p>
    </div>
  `;
}
