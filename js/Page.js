import { html, useEffect, useState } from "./preact-htm.js";
import { fetchGoogleSheetCSV } from "./dataLoader.js";
import { FilterContainer } from "./FilterContainer.js";

const FILTERS = [
  {
    key: "seniority",
    label: "Seniority",
    dataField: "seniority",
    defaultValue: "Principal",
  },
  { key: "team", label: "Team", dataField: "team", defaultValue: "Deal team" },
  { key: "region", label: "Region", dataField: "region", defaultValue: "UK" },
  {
    key: "strategy",
    label: "Strategy",
    dataField: "strategy",
    defaultValue: "Buyout",
  },
  {
    key: "AUMband",
    label: "AUM Band",
    dataField: "AUMband",
    defaultValue: "50-100",
  },
];

export function Page({ assetClass }) {
  const [dataForAssetClass, setDataForAssetClass] = useState([]);

  const [filterSelected, setFilterSelected] = useState(
    Object.fromEntries(FILTERS.map((f) => [f.key, f.defaultValue])),
  );
  const [filterOptions, setFilterOptions] = useState(
    Object.fromEntries(FILTERS.map((f) => [f.key, []])),
  );

  const [dataFiltered, setDataFiltered] = useState([]);

  const loadData = true;

  useEffect(() => {
    if (!loadData) {
      return;
    }
    fetchGoogleSheetCSV("main-data")
      .then((rawData) => {
        const formattedData = rawData.map((row) => {
          return {
            assetClass: row["Asset class"],
            seniority: row["Seniority"],
            team: row["Team"],
            region: row["Region"],
            strategy: row["Strategy"],
            AUMband: row["AUM band ($bn)"],
          };
          // AUM band
          // Buyout_ref
          // Comp type
          // Data_availability
          // Distressed_ref
          // Final 2026 value
          // Infra_ref
          // Number of firms
          // Number of respondents
          // Percentile
          // RE ratio
          // Role
          // SC discount
          // Secondaries discount
        });

        console.log("Formatted data:", formattedData);

        // get filter options for the filters based on the data
        const newOptions = Object.fromEntries(
          FILTERS.map((f) => [
            f.key,
            [...new Set(formattedData.map((row) => row[f.dataField]))].map(
              (value) => ({ value, label: value }),
            ),
          ]),
        );
        setFilterOptions(newOptions);

        const filteredByAssetClass = formattedData.filter(
          (row) => row.assetClass === assetClass,
        );

        setDataForAssetClass(filteredByAssetClass);
      })
      .catch((error) => {
        console.error("Error fetching sheet data (main data):", error);
      });
  }, []);

  // Apply filters to the data for the selected asset class
  useEffect(() => {
    const filtered = dataForAssetClass.filter((row) =>
      FILTERS.every((f) => row[f.dataField] === filterSelected[f.key]),
    );
    setDataFiltered(filtered);
  }, [dataForAssetClass, filterSelected]);

  console.log(
    "Page component data:",
    dataForAssetClass,
    "Filtered data:",
    dataFiltered,
  );

  if (!dataForAssetClass || dataForAssetClass.length === 0) {
    return html`
      <div class="page">
        <p>Loading data...</p>
      </div>
    `;
  }

  return html`
    <div class="page">
      <header>
        <div>
          <h1>${assetClass} compensation levels</h1>
          <div>
            <div>
              <p>Last update</p>
              <p>XXXXXX</p>
            </div>
            <button onclick=${() => console.log("export data")}>
              Export data
            </button>
          </div>
        </div>
        <${FilterContainer}
          filters=${FILTERS.map((f) => ({
            key: f.key,
            label: f.label,
            value: filterSelected[f.key],
            options: filterOptions[f.key],
            onChange: (value) =>
              setFilterSelected((prev) => ({ ...prev, [f.key]: value })),
          }))}
        />
      </header>
    </div>
  `;
}
