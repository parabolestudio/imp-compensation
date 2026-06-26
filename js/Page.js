import { html, useEffect, useState } from "./preact-htm.js";
import {
  fetchGoogleSheetCSV,
  prefetchOtherAssetClassTabs,
} from "./dataLoader.js";
import { FilterContainer } from "./FilterContainer.js";
import { Box } from "./Box.js";
import { DataHighlight } from "./DataHighlight.js";
import { Table } from "./Table.js";
import { Scatterplot } from "./Scatterplot.js";
import { Radarchart } from "./Radarchart.js";
import { Loader } from "./Loader.js";

const ASSET_CLASSES = [
  {
    label: "Private equity",
    dataKey: "Private equity",
    dataTab: "main-data-private-equity",
  },
  {
    label: "Credit",
    dataKey: "Private debt",
    dataTab: "main-data-credit",
  },
  {
    label: "Real assets",
    dataKey: "Real assets",
    dataTab: "main-data-real-assets",
  },
];

const FILTERS = [
  { key: "team", label: "Team", dataField: "team", defaultValue: "HR" },
  {
    key: "role",
    label: "Role",
    dataField: "role",
    defaultValue: null, // default value will be set dynamically based on the selected team
  },
  {
    key: "AUMband",
    label: "AUM Range",
    dataField: "AUMband",
    defaultValue: "Boutique (2-10bn)",
    sortOptions: (a, b) => {
      const order = [
        "Startup (0-2bn)",
        "Boutique (2-10bn)",
        "Mid-market (10-50bn)",
        "Upper Mid (50-100bn)",
        "Mega (100+bn)",
      ];
      return order.indexOf(a.label) - order.indexOf(b.label);
    },
  },
  {
    key: "region",
    label: "Region",
    dataField: "region",
    defaultValue: "United Kingdom",
  },
  {
    key: "strategy",
    label: "Strategy",
    dataField: "strategy",
    defaultValue: "PE aggregate",
    formatValueLabel: (value) => (value === "PE aggregate" ? "All" : value),
  },
];

export function Page({ assetClass }) {
  const selectedAssetClass =
    ASSET_CLASSES.find((ac) => ac.dataKey === assetClass) || ASSET_CLASSES[0];
  const [dataForAssetClass, setDataForAssetClass] = useState([]);
  const [dataRoleBox, setDataRoleBox] = useState([]);
  const [dataRoleBoxFiltered, setDataRoleBoxFiltered] = useState([]);
  const [dataRadarChart, setDataRadarChart] = useState([]);
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

  // Re-fetch main data whenever the asset class changes
  useEffect(() => {
    setDataForAssetClass([]);
    fetchGoogleSheetCSV(selectedAssetClass.dataTab)
      .then((rawData) => {
        const formattedData = rawData.map((row) => {
          let currency = row["Currency"];
          let currencySymbol = null;

          const currencyList = {
            "EUR": "€",
            "USD": "$",
            "GBP": "£",
            "SEK": "kr",
            "CHF": "CHF",
            "SGD": "S$",
            "HKD": "HK$",
            "AUD": "A$",
            "CAD": "C$",
          };

          currencySymbol = currencyList[currency] || null;



          return {
            assetClass: row["Asset Class"],
            seniority: row["Seniority"],
            team: row["Team"],
            region: row["Region"],
            role: row["Role"],
            strategy: row["Strategy"],
            AUMband: row["AUM"],
            currency,
            currencySymbol,

            numberOfCompanies: +row["No of firms"],
            numberOfRespondents: +row["No of respondants"],

            comp: {
              base: {
                10: +row["Base salary 10th"],
                25: +row["Base salary 25th"],
                50: +row["Base salary 50th"],
                75: +row["Base salary 75th"],
                90: +row["Base salary 90th"],
                avg: +row["Base salary average"],
              },
              bonusValue: {
                10: +row["bonus value (calculated) 10th"],
                25: +row["bonus value (calculated) 25th"],
                50: +row["bonus value (calculated) 50th"],
                75: +row["bonus value (calculated) 75th"],
                90: +row["bonus value (calculated) 90th"],
                avg: +row["bonus value (calculated) average"],
              },
              bonusPercentage: {
                10: +row["Bonus (%) 10th"].replace("%", ""),
                25: +row["Bonus (%) 25th"].replace("%", ""),
                50: +row["Bonus (%) 50th"].replace("%", ""),
                75: +row["Bonus (%) 75th"].replace("%", ""),
                90: +row["Bonus (%) 90th"].replace("%", ""),
                avg: +row["Bonus (%) average"].replace("%", ""),
              },
              totalComp: {
                10: +row["Total cash comp (calculated) 10th"],
                25: +row["Total cash comp (calculated) 25th"],
                50: +row["Total cash comp (calculated) 50th"],
                75: +row["Total cash comp (calculated) 75th"],
                90: +row["Total cash comp (calculated) 90th"],
                avg: +row["Total cash comp (calculated) average"],
              },
            },
          };
        });

        setDataForAssetClass(formattedData);

        const teamOptions = [...new Set(formattedData.map((row) => row.team))];
        const initialTeam =
          teamOptions.find((t) => t === filterSelected.team) ??
          teamOptions[0] ??
          filterSelected.team;
        const newOptions = Object.fromEntries(
          FILTERS.map((f) => {
            const filteredData =
              f.key === "role"
                ? formattedData.filter((row) => row.team === initialTeam)
                : formattedData;
            return [
              f.key,
              [...new Set(filteredData.map((row) => row[f.dataField]))]
                .map((value) => ({
                  value,
                  label: f.formatValueLabel ? f.formatValueLabel(value) : value,
                }))
                .sort(
                  f.sortOptions || ((a, b) => a.label.localeCompare(b.label)),
                ),
            ];
          }),
        );
        const initialRole = newOptions.role[0]?.value ?? filterSelected.role;
        const initialStrategy =
          newOptions.strategy.find((o) => o.value === "PE aggregate")?.value ??
          newOptions.strategy[0]?.value ??
          filterSelected.strategy;
        setFilterOptions(newOptions);
        setFilterSelected((prev) => ({
          ...prev,
          team: initialTeam,
          role: initialRole,
          strategy: initialStrategy,
        }));

        prefetchOtherAssetClassTabs(selectedAssetClass.dataTab);
      })
      .catch((error) => {
        console.error("Error fetching sheet data (main data):", error);
      });
  }, [selectedAssetClass]);

  // Fetch static sheets once on mount
  useEffect(() => {
    Promise.all([
      fetchGoogleSheetCSV("role-box-data"),
      fetchGoogleSheetCSV("radar-chart-data"),
      fetchGoogleSheetCSV("static-data"),
    ])
      .then(([rawRoleData, rawRadarData, rawStaticData]) => {
        setDataRoleBox(
          rawRoleData.map((row) => ({
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
          })),
        );

        setDataRadarChart(
          rawRadarData.map((row) => ({
            team: row["Team"],
            role: row["Role"],
            assetClass: row["Asset class"],
            valueCarry: +row["Carry"],
            valueEquity: +row["Real Equity"],
            valueBonus: +row["Deferred bonus"],
          })),
        );

        if (rawStaticData.length > 0 && rawStaticData[0]["last_update"]) {
          setLastDataUpdateInfo(rawStaticData[0]["last_update"]);
        } else {
          console.error(
            "Static data sheet is empty or missing 'last_update' column",
          );
        }
      })
      .catch((error) => {
        console.error("Error fetching static sheet data:", error);
      });
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
        row.team.toLowerCase() === filterSelected.team.toLowerCase() &&
        row.region === filterSelected.region &&
        row.role === dataFiltered[0]?.role,
    );
    setDataRoleBoxFiltered(filtered);
  }, [dataRoleBox, filterSelected, filterOptions, dataFiltered]);

  console.log(
    "Page component data:",
    dataForAssetClass,
    "Filtered data general:",
    dataFiltered,
    "Role box data:",
    dataRoleBox,
    "Filtered role box data:",
    dataRoleBoxFiltered,
    "Radar chart data:",
    dataRadarChart,
  );

  function handleFilterChange(key, value) {
    if (key === "team") {
      const roleFilter = FILTERS.find((f) => f.key === "role");
      const roleOptions = [
        ...new Set(
          dataForAssetClass
            .filter((row) => row.team === value)
            .map((row) => row[roleFilter.dataField]),
        ),
      ]
        .map((v) => ({
          value: v,
          label: roleFilter.formatValueLabel
            ? roleFilter.formatValueLabel(v)
            : v,
        }))
        .sort(
          roleFilter.sortOptions || ((a, b) => a.label.localeCompare(b.label)),
        );
      const firstRole = roleOptions[0]?.value ?? filterSelected.role;
      setFilterOptions((prev) => ({ ...prev, role: roleOptions }));
      setFilterSelected((prev) => ({ ...prev, team: value, role: firstRole }));
    } else {
      setFilterSelected((prev) => ({ ...prev, [key]: value }));
    }
  }

  function handleExport(option) {
    if (dataForAssetClass.length === 0 || dataFiltered.length === 0) return;

    let dataForExport = null;
    if (option === "role") {
      dataForExport = dataFiltered;
    } else if (option === "team") {
      // filter data for all filters except role, so we get all roles for the selected team
      dataForExport = dataForAssetClass.filter((row) =>
        FILTERS.every((f) =>
          f.key === "role" ? true : row[f.dataField] === filterSelected[f.key],
        ),
      );
    }

    const flattenRow = (row) => {
      const flat = {};
      for (const [key, val] of Object.entries(row)) {
        if (key === "currencySymbol") continue;
        if (key === "comp" && typeof val === "object") {
          for (const [category, percentiles] of Object.entries(val)) {
            for (const [p, v] of Object.entries(percentiles)) {
              flat[`${category}_${p}`] = v;
            }
          }
        } else {
          flat[key] = val;
        }
      }
      return flat;
    };
    const flatData = dataForExport.map(flattenRow);
    const headers = Object.keys(flatData[0]);
    const rows = flatData.map((row) =>
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

  const allDataLoaded =
    dataForAssetClass &&
    dataForAssetClass.length > 0 &&
    dataRoleBox &&
    dataRoleBox.length > 0;

  const roleData =
    dataRoleBoxFiltered.length > 0 ? dataRoleBoxFiltered[0] : null;

  const radarDataFiltered = dataRadarChart.filter(
    (d) => d.team === filterSelected.team && d.role === filterSelected.role,
  );

  return html`
    <div class="custom-page ${!allDataLoaded ? "page-placeholder" : ""}">
      <div class="subnav-asset-class">
        ${ASSET_CLASSES.map((ac) => {
          const isSelected = ac.dataKey === selectedAssetClass.dataKey;
          return html`<button
            class=${`subnav-button ${isSelected ? "selected" : ""}`}
            onclick=${() => {
              console.log("Clicked asset class button for", ac.dataKey);

              // if the url is privatemarketsintelligence.com/..., then we want to change the query parameter "tab" to the selected asset class
              // if the url is localhost:3000/..., then we want to switch to another index.html file for the selected asset class (this is for development purposes, in production we will use query parameters to switch between asset classes)
              const currentUrl = new URL(window.location.href);
              if (currentUrl.hostname === "privatemarketsintelligence.com") {
                let newTabName = ac.dataKey;
                if (newTabName === "Private equity") {
                  newTabName = "Private Equity_Compensation";
                } else if (newTabName === "Private debt") {
                  newTabName = "Credit_Compensation";
                } else if (newTabName === "Real assets") {
                  newTabName = "Real Assets_Compensation";
                }
                currentUrl.searchParams.set("tab", newTabName);
                window.location.href = currentUrl; // navigate to the new URL with updated query parameter
              } else {
                // for development, we will switch between different html files for each asset class
                const newPage = `index-${ac.label.replace(" ", "-").toLowerCase()}.html`;
                window.location.href = newPage;
              }
            }}
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
            ${allDataLoaded &&
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
            onChange: (value) => handleFilterChange(f.key, value),
          }))}
          showPlaceholder="${!allDataLoaded}"
        />
      </div>

      <div
        style="display: flex; flex-direction: column; gap: 32px; padding: 40px 32px; position: relative;"
      >
        <${Loader} isLoading=${!allDataLoaded} />
        <div class="section section-1">
          <${Box}
            headline="${`${dataFiltered[0]?.role || "Role"}`}"
            headlineIcon="head"
            className="section-1-left"
            showPlaceholder="${!allDataLoaded}"
            noData=${allDataLoaded && !roleData}
            hideHeader=${allDataLoaded && !roleData}
            children="${html`<div
              style="display: flex; flex-direction: column; gap: 34px; justify-content: space-between; height: 100%;"
            >
              <p class="text-body">${roleData?.description || ""}</p>
              <div class="data-highlights-container">
                ${roleData &&
                html`
                  <${DataHighlight}
                    headline="Typical Experience"
                    value="${roleData?.typicalExperience + " Years" || ""}"
                  />
                  <${DataHighlight}
                    headline="Direct Reports"
                    value="${roleData?.directReports || ""}"
                  />
                  <${DataHighlight}
                    headline="Carry Eligible"
                    value="${roleData
                      ? roleData.carryEligible === "Yes"
                        ? "Yes"
                        : "No"
                      : ""}"
                  />
                  <${DataHighlight}
                    headline="Share of Women"
                    value="${roleData?.shareOfWomen?.toFixed(0) + "%" || ""}"
                    vis="percentage"
                    visValue="${roleData ? roleData.shareOfWomen : null}"
                  />
                `}
              </div>
              <p style="color: #738287; font-size: 12px; line-height: 125%;">
                Female representation is calculated across the full dataset and
                segmented by role, seniority, and region. Variations by asset
                class, strategy, and AUM band are not statistically material.
              </p>
            </div>`}"
          />
          <div class="section-1-right">
            <${Box}
              headlineIcon="house"
              className="bg-dark"
              showPlaceholder="${!allDataLoaded}"
              children="${html`<div>
                <p class="text-big-numbers-large">
                  ${dataFiltered[0]?.numberOfCompanies || "-"}
                </p>
                <p class="text-tags-large">Companies in Sample</p>
              </div>`}"
            />
            <${Box}
              headlineIcon="data"
              showPlaceholder="${!allDataLoaded}"
              children="${html`<div>
                <p class="text-big-numbers-large">
                  ${dataFiltered[0]?.numberOfRespondents || "-"}
                </p>
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
                  Values in ${dataFiltered[0]?.currency}${dataFiltered[0]?.currencySymbol ? ` (${dataFiltered[0].currencySymbol})` : ""}</span
                >`
              : null}"
            className="no-padding"
            showPlaceholder="${!allDataLoaded}"
            noData=${allDataLoaded && dataFiltered.length === 0}
            children="${html`<${Table} data=${dataFiltered} />`}"
          />
        </div>

        <div class="section section-3">
          <${Box}
            headline="Compensation distribution"
            className="box-width-50"
            showPlaceholder="${!allDataLoaded}"
            noData=${allDataLoaded && dataFiltered.length === 0}
            children="${html`<${Scatterplot} data=${dataFiltered} />`}"
          />
          <${Box}
            headline="Prevalence of incentives"
            className="box-width-50"
            showPlaceholder="${!allDataLoaded}"
            noData=${allDataLoaded && radarDataFiltered.length === 0}
            children="${html`<${Radarchart} data=${radarDataFiltered} />`}"
          />
        </div>
      </div>
    </div>
  `;
}
