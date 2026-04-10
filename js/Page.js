import { html, useEffect, useState } from "./preact-htm.js";
import { fetchGoogleSheetCSV } from "./dataLoader.js";
import { FilterContainer } from "./FilterContainer.js";
import { Box } from "./Box.js";
import { DataHighlight } from "./DataHighlight.js";
import { Table } from "./Table.js";
import { Scatterplot } from "./Scatterplot.js";
import { Radarchart } from "./Radarchart.js";

const FILTERS = [
  {
    key: "seniority",
    label: "Seniority",
    dataField: "seniority",
    defaultValue: "Principal",
  },
  { key: "team", label: "Team", dataField: "team", defaultValue: "Deal team" },
  {
    key: "AUMband",
    label: "AUM Band",
    dataField: "AUMband",
    defaultValue: "50-100",
  },
  { key: "region", label: "Region", dataField: "region", defaultValue: "UK" },
  {
    key: "strategy",
    label: "Strategy",
    dataField: "strategy",
    defaultValue: "PE aggregate",
  },
];

export function Page({ assetClass }) {
  const [dataForAssetClass, setDataForAssetClass] = useState([]);
  const [lastDataUpdateInfo, setLastDataUpdateInfo] = useState(null);

  const [filterSelected, setFilterSelected] = useState(
    Object.fromEntries(FILTERS.map((f) => [f.key, f.defaultValue])),
  );
  const [filterOptions, setFilterOptions] = useState(
    Object.fromEntries(FILTERS.map((f) => [f.key, []])),
  );

  const [dataFiltered, setDataFiltered] = useState([]);

  const loadData = true;

  useEffect(() => {
    if (loadData) {
      // fetch main data sheet and format it for use in the app
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
              numberOfCompanies: +row["Number of firms"],
              numberOfSamples: +row["Number of respondents"].replace(/\r/g, ""),
              percentile: row["Percentile"],
              compensationValue: +row["Final 2026 value"]
                .replace("£", "")
                .replace(",", "")
                .replace(/\r/g, ""), // TODO: replace all currency symbols and commas robustly
            };
            // AUM band
            // Buyout_ref
            // Comp type
            // Data_availability
            // Distressed_ref

            // Infra_ref
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
                (value) => {
                  if (value === "PE aggregate") {
                    return { value, label: "All" };
                  }
                  return { value, label: value };
                },
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

      // fetch last data update info sheet
      fetchGoogleSheetCSV("last-data-update")
        .then((data) => {
          if (data.length > 0 && data[0]["value"]) {
            setLastDataUpdateInfo(data[0]["value"]);
          } else {
            console.error(
              "Last data update info sheet is empty or missing 'value' column",
            );
          }
        })
        .catch((error) => {
          console.error("Error fetching sheet data (last data update):", error);
        });
    }
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

  // if (!dataForAssetClass || dataForAssetClass.length === 0) {
  //   return html`
  //     <div class="page">
  //       <p>Loading data...</p>
  //     </div>
  //   `;
  // }

  return html`
    <div class="custom-page">
      <div class="section header">
        <div class="header-top">
          <h1>${assetClass} compensation levels</h1>
          <div class="header-top-right">
            ${lastDataUpdateInfo
              ? html`<div>
                  <p class="text-tags-large">Last update</p>
                  <p class="text-buttons">${lastDataUpdateInfo}</p>
                </div>`
              : null}
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
      </div>

      <div
        style="display: flex; flex-direction: column; gap: 32px; padding: 40px 32px;"
      >
        <div class="section section-1">
          <${Box}
            headline="${`${filterSelected["seniority"]}, ${filterSelected["team"]} `}"
            headlineIcon="head"
            className="section-1-left"
            children="${html`<div
              style="display: flex; flex-direction: column; gap: 16px;"
            >
              <p class="text-body">
                Responsible for sourcing transactions, leading due diligence and
                negotiations, and driving value creation in portfolio companies
                while managing junior team members. The role sits just below
                Partner, acting as a bridge between the deal team and the
                partnership, with increasing influence on investment decisions,
                fundraising, and overall firm strategy.
              </p>
              <div class="data-highlights-container">
                <${DataHighlight}
                  headline="Typical Experience"
                  value="12+ Years"
                />
                <${DataHighlight} headline="Direct Reports" value="0-3" />
                <${DataHighlight} headline="Carry Eligible" value="Yes" />
                <${DataHighlight} headline="Share of Women" value="25%" />
              </div>
            </div>`}"
          />
          <div class="section-1-right">
            <${Box}
              headlineIcon="house"
              className="bg-dark"
              children="${html`<div>
                <p class="text-big-numbers-large">XXX</p>
                <p class="text-tags-large">Companies in Sample</p>
              </div>`}"
            />
            <${Box}
              headlineIcon="data"
              children="${html`<div>
                <p class="text-big-numbers-large">XXX</p>
                <p class="text-tags-large">Data points in Sample</p>
              </div>`}"
            />
          </div>
        </div>

        <div class="section section-2">
          <${Box}
            headline="Compensation breakdown"
            headlineRight="${html`<span class="text-tags-large"
              ><div class="circle-green"></div>
              Values in XXXX</span
            >`}"
            className="no-padding"
            children="${html`<${Table} />`}"
          />
        </div>

        <div class="section section-3">
          <${Box}
            headline="Compensation distribution"
            className="width-50"
            children="${html`<${Scatterplot} />`}"
          />
          <${Box}
            headline="Prevalence of incentives"
            className="width-50"
            children="${html`<${Radarchart} />`}"
          />
        </div>
      </div>
    </div>
  `;
}
