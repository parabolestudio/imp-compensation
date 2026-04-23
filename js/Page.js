import { html, useEffect, useState } from "./preact-htm.js";
import { fetchGoogleSheetCSV } from "./dataLoader.js";
import { FilterContainer } from "./FilterContainer.js";
import { Box } from "./Box.js";
import { DataHighlight } from "./DataHighlight.js";
import { Table } from "./Table.js";
import { Scatterplot } from "./Scatterplot.js";
import { Radarchart } from "./Radarchart.js";

const ASSET_CLASSES = [
  {
    label: "Private equity",
    dataKey: "Private equity",
  },
  {
    label: "Private debt",
    dataKey: "Private debt",
  },
  {
    label: "Real assets",
    dataKey: "Real assets",
  },
];

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
    label: "AUM Range",
    dataField: "AUMband",
    defaultValue: "2-10",
    formatValueLabel: (value) => {
      if (value === "0-2") return "< $2B";
      if (value === "2-10") return "$2B - $10B";
      if (value === "10-50") return "$10B - $50B";
      if (value === "50-100") return "$50B - $100B";
      if (value === "100+") return "> $100B";
      return value;
    },
    sortOptions: (a, b) => {
      const order = [
        "< $2B",
        "$2B - $10B",
        "$10B - $50B",
        "$50B - $100B",
        "> $100B",
      ];
      return order.indexOf(a.label) - order.indexOf(b.label);
    },
  },
  { key: "region", label: "Region", dataField: "region", defaultValue: "UK" },
  {
    key: "strategy",
    label: "Strategy",
    dataField: "strategy",
    defaultValue: "PE aggregate",
    formatValueLabel: (value) => (value === "PE aggregate" ? "All" : value),
  },
];

export function Page() {
  const [selectedAssetClass, setSelectedAssetClass] = useState(
    ASSET_CLASSES[0],
  );
  const [dataAcrossAssetClasses, setDataAcrossAssetClasses] = useState([]);
  const [dataForAssetClass, setDataForAssetClass] = useState([]);
  const [dataRoleBox, setDataRoleBox] = useState([]);
  const [dataRoleBoxFiltered, setDataRoleBoxFiltered] = useState([]);
  const [lastDataUpdateInfo, setLastDataUpdateInfo] = useState(null);
  const [showExportDropdown, setShowExportDropdown] = useState(false);

  const [filterSelected, setFilterSelected] = useState(
    Object.fromEntries(FILTERS.map((f) => [f.key, f.defaultValue])),
  );
  const [filterOptions, setFilterOptions] = useState(
    Object.fromEntries(
      FILTERS.map((f) => [
        f.key,
        [
          {
            value: f.defaultValue,
            label: f.formatValueLabel
              ? f.formatValueLabel(f.defaultValue)
              : f.defaultValue,
          },
        ],
      ]),
    ),
  );

  const [dataFiltered, setDataFiltered] = useState([]);

  const loadData = true;

  useEffect(() => {
    if (loadData) {
      // fetch main data sheet and format it for use in the app
      fetchGoogleSheetCSV("main-data-new")
        .then((rawData) => {
          const formattedData = rawData.map((row) => {
            let currency = row["Currency"];
            let currencySymbol = null;
            if (currency === "GBP") {
              currencySymbol = "£";
            } else if (currency === "EUR") {
              currencySymbol = "€";
            } else if (currency === "USD") {
              currencySymbol = "$";
            }

            return {
              assetClass: row["Asset class"],
              seniority: row["Seniority"],
              team: row["Function"],
              region: row["Region"],
              strategy: row["Strategy"],
              AUMband: row["AUM band ($bn)"],
              numberOfCompanies: +row["No. of firms"],
              numberOfRespondents: +row["No. of respondents"],
              percentile: row["Percentile"],
              currency,
              currencySymbol,
              compValueBase: +row["Base"].replaceAll(",", ""),
              compValueBonus: +row["Discretionary"].replaceAll(",", ""),
              compValueTotal: +row["Total comp"].replaceAll(",", ""),
              compValueBonusPercentage: row["Disc % of base"],
            };
          });

          console.log("Formatted data:", formattedData);
          setDataAcrossAssetClasses(formattedData);

          const filteredByAssetClass = formattedData.filter(
            (row) => row.assetClass === selectedAssetClass.dataKey,
          );
          setDataForAssetClass(filteredByAssetClass);

          // get filter options for the filters based on the data
          const newOptions = Object.fromEntries(
            FILTERS.map((f) => [
              f.key,
              [...new Set(filteredByAssetClass.map((row) => row[f.dataField]))]
                .map((value) => {
                  return {
                    value,
                    label: f.formatValueLabel
                      ? f.formatValueLabel(value)
                      : value,
                  };
                })
                .sort(
                  f.sortOptions || ((a, b) => a.label.localeCompare(b.label)),
                ),
            ]),
          );
          setFilterOptions(newOptions);
        })
        .catch((error) => {
          console.error("Error fetching sheet data (main data):", error);
        });

      // fetch role box data
      fetchGoogleSheetCSV("role-box-data")
        .then((rawRoleData) => {
          const formattedRoleData = rawRoleData.map((row) => {
            return {
              team: row["Team"],
              role: row["Role"],
              seniority: row["Seniority"],
              region: row["Region"],
              assetClass: row["Asset class"],
              description: row["Description"],
              typicalExperience: row["Typical experience"],
              directReports: row["Direct reports"],
              carryEligible: row["Carry eligible"],
              shareOfWomen: +row["Share of women"],
            };
          });

          console.log("Formatted role data:", formattedRoleData);
          setDataRoleBox(formattedRoleData);
        })
        .catch((error) => {
          console.error("Error fetching sheet data (role box data):", error);
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
  }, [dataForAssetClass, filterSelected, filterOptions]);

  // Apply filters to the role box data
  useEffect(() => {
    const filtered = dataRoleBox.filter(
      (row) =>
        row.seniority === filterSelected.seniority &&
        row.team ===
          filterSelected.team.replace("teams", "").replace("team", "").trim(),
    );
    setDataRoleBoxFiltered(filtered);
  }, [dataRoleBox, filterSelected, filterOptions]);

  useEffect(() => {
    // when asset class changes, filter general data for the new asset class
    const filteredByAssetClass = dataAcrossAssetClasses.filter(
      (row) => row.assetClass === selectedAssetClass.dataKey,
    );
    setDataForAssetClass(filteredByAssetClass);

    // get filter options for the filters based on the data
    const newOptions = Object.fromEntries(
      FILTERS.map((f) => [
        f.key,
        [...new Set(filteredByAssetClass.map((row) => row[f.dataField]))]
          .map((value) => {
            return {
              value,
              label: f.formatValueLabel ? f.formatValueLabel(value) : value,
            };
          })
          .sort(f.sortOptions || ((a, b) => a.label.localeCompare(b.label))),
      ]),
    );
    setFilterOptions(newOptions);

    const filtered = filteredByAssetClass.filter((row) =>
      FILTERS.every((f) => row[f.dataField] === filterSelected[f.key]),
    );
    setDataFiltered(filtered);
  }, [selectedAssetClass, dataAcrossAssetClasses]);

  console.log(
    "Page component data:",
    dataForAssetClass,
    "Filtered data general:",
    dataFiltered,
    "Role box data:",
    dataRoleBox,
    "Filtered role box data:",
    dataRoleBoxFiltered,
  );

  // if (!dataForAssetClass || dataForAssetClass.length === 0) {
  //   return html`
  //     <div class="page">
  //       <p>Loading data...</p>
  //     </div>
  //   `;
  // }

  function handleExport(option) {
    if (dataForAssetClass.length === 0 || dataFiltered.length === 0) return;

    let dataForExport = null;
    if (option === "role") {
      dataForExport = dataFiltered;
    } else if (option === "team") {
      // filter data for all filters except seniority, so we get all seniority levels for the selected team
      dataForExport = dataForAssetClass.filter((row) =>
        FILTERS.every((f) =>
          f.key === "seniority"
            ? true
            : row[f.dataField] === filterSelected[f.key],
        ),
      );
    }

    const headers = Object.keys(dataForExport[0]);
    const rows = dataForExport.map((row) =>
      headers
        .map((h) => {
          const val = row[h] ?? "";
          const str = String(val);
          return str.includes(",") || str.includes('"') || str.includes("\n")
            ? `"${str.replace(/"/g, '""')}"`
            : str;
        })
        .join(","),
    );
    const csv = [headers.join(","), ...rows].join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `imp-compensation-data-${selectedAssetClass.label.replace(" ", "_").toLowerCase()}-${option}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return html`
    <div class="custom-page">
      <div class="subnav-asset-class">
        ${ASSET_CLASSES.map((ac) => {
          const isSelected = ac.dataKey === selectedAssetClass.dataKey;
          return html`<button
            class=${`subnav-button ${isSelected ? "selected" : ""}`}
            onclick=${() => setSelectedAssetClass(ac)}
          >
            ${ac.label}
          </button>`;
        })}
      </div>

      <div class="section header">
        <div class="header-top">
          <h1>${selectedAssetClass.label} compensation levels</h1>
          <div class="header-top-right">
            ${lastDataUpdateInfo
              ? html`<div>
                  <p class="text-tags-large">Last update</p>
                  <p class="text-buttons">${lastDataUpdateInfo}</p>
                </div>`
              : null}
            ${dataFiltered &&
            dataFiltered.length > 0 &&
            html` <button
              onclick=${() => setShowExportDropdown((prev) => !prev)}
              class="export-button"
            >
              <svg width="10" height="10" fill="none" viewBox="0 0 10 10">
                <path
                  fill="#fff"
                  d="M4.667 7 1.75 4.083l.817-.846 1.516 1.517V0H5.25v4.754l1.517-1.516.816.845L4.667 7m-3.5 2.333c-.321 0-.596-.114-.824-.342A1.123 1.123 0 0 1 0 8.167v-1.75h1.167v1.75h7v-1.75h1.166v1.75c0 .32-.114.595-.342.824a1.123 1.123 0 0 1-.824.342h-7"
                  class="Icon"
                />
              </svg>
              <span>Export data</span>
              <div
                class="export-dropdown"
                style="display: ${showExportDropdown ? "flex" : "none"};"
              >
                <p class="text-tags-large">Export</p>
                <button onclick=${() => handleExport("team")}>Team data</button>
                <button onclick=${() => handleExport("role")}>Role data</button>
              </div>
            </button>`}
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
            headlineRight="${dataFiltered[0]?.currency
              ? html`<span class="text-tags-large"
                  ><div class="circle-green"></div>
                  Values in ${dataFiltered[0]?.currency}${" "}
                  (${dataFiltered[0]?.currencySymbol})</span
                >`
              : null}"
            className="no-padding"
            children="${html`<${Table} data=${dataFiltered} />`}"
          />
        </div>

        <div class="section section-3">
          <${Box}
            headline="Compensation distribution"
            className="box-width-50"
            children="${html`<${Scatterplot} data=${dataFiltered} />`}"
          />
          <${Box}
            headline="Prevalence of incentives"
            className="box-width-50"
            children="${html`<${Radarchart} />`}"
          />
        </div>
      </div>
    </div>
  `;
}
