import { html, useEffect, useState } from "./preact-htm.js";
import { fetchGoogleSheetCSV } from "./dataLoader.js";

export function Page({ assetClass }) {
  const [dataForAssetClass, setDataForAssetClass] = useState([]);

  // filter states
  const [selectedSeniority, setSelectedSeniority] = useState("Principal");
  const [selectedTeam, setSelectedTeam] = useState("Deal team");
  const [selectedRegion, setSelectedRegion] = useState("UK");
  const [selectedStrategy, setSelectedStrategy] = useState("Buyout");
  const [selectedAUMBand, setSelectedAUMBand] = useState("50-100");

  const [dataFiltered, setDataFiltered] = useState([]);

  useEffect(() => {
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
    console.log("Applying filters:", {
      selectedSeniority,
      selectedTeam,
      selectedRegion,
    });
    const filtered = dataForAssetClass.filter((row) => {
      return (
        row.seniority === selectedSeniority &&
        row.team === selectedTeam &&
        row.region === selectedRegion &&
        row.strategy === selectedStrategy &&
        row.AUMband === selectedAUMBand
      );
    });
    setDataFiltered(filtered);
  }, [
    selectedSeniority,
    selectedTeam,
    selectedRegion,
    selectedStrategy,
    selectedAUMBand,
    dataForAssetClass,
  ]);

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
      <p>Asset Class: ${assetClass}</p>
    </div>
  `;
}
