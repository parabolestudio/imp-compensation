const SHEET_ID =
  "2PACX-1vQ1FvDcBobI1J7kYnOCj41USZlDAkgwvkkobrdtJZ5JYcDmtqz9wMfL2SU9ShV6frYaYOtCVfVwnJba";

const SHEET_TAB_IDS = {
  // "main-data": "1439029939",
  // "main-data-new": "38414697",
  "role-box-data": "32159509",
  "radar-chart-data": "1271887760",
  "static-data": "763135013",
  "main-data-credit": "2128271370", // private debt = credit
  "main-data-private-equity": "1708469460", // private equity
  "main-data-real-assets": "1458438000", // real assets
};

function getSheetUrl(tabName) {
  const gid = SHEET_TAB_IDS[tabName];
  if (!gid) {
    throw new Error(`No GID found for tab name: ${tabName}`);
  }
  return `https://docs.google.com/spreadsheets/d/e/${SHEET_ID}/pub?gid=${gid}&single=true&output=csv`;
}

function parseCSV(csvText) {
  const lines = csvText.trim().split("\n");

  function splitCSV(line) {
    const result = [];
    let current = "";
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        if (inQuotes && line[i + 1] === '"') {
          current += '"';
          i++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === "," && !inQuotes) {
        result.push(current);
        current = "";
      } else {
        current += char;
      }
    }
    result.push(current);
    return result;
  }

  const headers = splitCSV(lines[0]);
  return lines.slice(1).map((line) => {
    const values = splitCSV(line);
    const rowObj = {};
    headers.forEach((header, i) => {
      header = header.trim();
      let cellValue = values[i] || "";
      if (cellValue === "\r") cellValue = "";
      rowObj[header] = cellValue;
    });
    return rowObj;
  });
}

const CACHE_PREFIX = "imp_sheet_";

// fetch data from a public Google sheet without the API directly from the URL
export async function fetchGoogleSheetCSV(tabName) {
  const cacheKey = CACHE_PREFIX + tabName;

  const cached = sessionStorage.getItem(cacheKey);
  if (cached) {
    return JSON.parse(cached);
  }

  const sheetUrl = getSheetUrl(tabName);
  const response = await fetch(sheetUrl);
  const csvText = await response.text();
  const data = parseCSV(csvText);

  try {
    sessionStorage.setItem(cacheKey, JSON.stringify(data));
  } catch (e) {
    // sessionStorage quota exceeded — continue without caching
  }

  return data;
}

export const MAIN_DATA_TABS = [
  "main-data-private-equity",
  "main-data-credit",
  "main-data-real-assets",
];

export function prefetchOtherAssetClassTabs(currentTab) {
  MAIN_DATA_TABS.filter((tab) => tab !== currentTab).forEach((tab) => {
    fetchGoogleSheetCSV(tab).catch(() => {});
  });
}
