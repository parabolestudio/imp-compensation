import { html } from "./preact-htm.js";

export function Scatterplot({ data }) {
  const normalizedData = Array.isArray(data)
    ? data.flatMap((entry) => {
        // Support the old shape as a fallback.
        if (
          entry &&
          entry.compensationType != null &&
          entry.compensationValue != null
        ) {
          return [
            {
              compType: entry.compensationType,
              percentile: entry.percentile,
              value: Number(entry.compensationValue),
            },
          ];
        }

        return [
          {
            compType: "base",
            percentile: entry?.percentile,
            value: Number(entry?.compValueBase),
          },
          {
            compType: "bonus",
            percentile: entry?.percentile,
            value: Number(entry?.compValueBonus),
          },
          {
            compType: "totalComp",
            percentile: entry?.percentile,
            value: Number(entry?.compValueTotal),
          },
        ];
      })
    : [];

  const chartData = normalizedData.filter(
    (d) => d.percentile && Number.isFinite(d.value),
  );

  // vis dimensions
  const visContainer = document.querySelector(`#scatterplot-container`);
  let width =
    visContainer && visContainer.offsetWidth ? visContainer.offsetWidth : 600;

  const height = width * 0.75 || 300;
  const margin = { top: 20, right: 0, bottom: 28, left: 36 };
  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;

  const compTypeOrder = ["base", "bonus", "totalComp"];
  const maxValue = d3.max(chartData, (d) => d.value) || 0;

  const yScale = d3
    .scaleLinear()
    .domain([0, maxValue > 0 ? maxValue : 1])
    .range([innerHeight, 0])
    .nice();
  const xScale = d3
    .scaleBand()
    .domain(compTypeOrder)
    .range([0, innerWidth])
    .padding(0.1);

  const yTicks = yScale.ticks(4);
  const xTicks = xScale.domain();

  const circleRadius = 4;
  const backgroundRectWidth = 12;

  const dataByCompType = {};
  chartData.forEach((d) => {
    if (!dataByCompType[d.compType]) {
      dataByCompType[d.compType] = [];
    }
    dataByCompType[d.compType].push(d);
  });

  return html`
    <div class="scatterplot" id="scatterplot-container">
      <svg viewBox="0 0 ${width} ${height}">
        <g transform="translate(${margin.left}, ${margin.top})">
          ${data &&
          dataByCompType &&
          Object.entries(dataByCompType).map(([compType, group]) => {
            const percentile10 = group.find(
              (d) => d.percentile === "10th percentile",
            );
            const percentile90 = group.find(
              (d) => d.percentile === "90th percentile",
            );
            if (!percentile10 || !percentile90) {
              console.warn(
                `Missing 10th or 90th percentile for comp type ${compType}, skipping background rect`,
                group,
              );
              return null;
            }
            const y10 = yScale(percentile10.value) + backgroundRectWidth / 2;
            const y90 = yScale(percentile90.value) - backgroundRectWidth / 2;

            const xCenter = xScale(compType);
            if (xCenter == null) return null;

            return html`
              <rect
                x="${xCenter +
                xScale.bandwidth() / 2 -
                backgroundRectWidth / 2}"
                y="${y90}"
                width="${backgroundRectWidth}"
                height="${y10 - y90}"
                fill="#00212E"
                fill-opacity="0.025"
                rx="${backgroundRectWidth / 2}"
              />
            `;
          })}
          ${data &&
          yTicks.map((tick) => {
            const y = yScale(tick);
            // format tick labels as K for thousands
            const formatTick = (tick) => {
              return tick >= 1000 ? `${tick / 1000}K` : tick;
            };
            return html`<g key=${tick}>
              <line
                x1="0"
                y1="${y}"
                x2="${innerWidth}"
                y2="${y}"
                stroke="#E5E7EB"
              />
              <text x="-8" y="${y + 4}" text-anchor="end" class="text-chart">
                ${formatTick(tick)}
              </text>
            </g>`;
          })}
          ${data &&
          xTicks.map((tick) => {
            const x = xScale(tick) + xScale.bandwidth() / 2;
            const formatTick = (tick) => {
              if (tick === "Base" || tick === "base") {
                return "Salary";
              } else if (tick === "Bonus" || tick === "bonus") {
                return "Bonus";
              } else if (tick === "Total comp" || tick === "totalComp") {
                return "Total Compensation";
              }
              return tick;
            };
            return html`<text
              key=${tick}
              x="${x}"
              y="${innerHeight + 20}"
              text-anchor="middle"
              class="text-chart"
            >
              ${formatTick(tick)}
            </text>`;
          })}
          ${chartData &&
          chartData.map((d) => {
            if (d.percentile === "Average") {
              return null;
            }

            const xBand = xScale(d.compType);
            if (xBand == null) return null;

            const x = xBand + xScale.bandwidth() / 2;
            const y = yScale(d.value);

            return html`<g>
              ${d.percentile === "50th percentile" &&
              html` <circle
                cx="${x}"
                cy="${y}"
                r="${circleRadius + 2}"
                fill="#C741AF"
              />`}
              <circle
                cx="${x}"
                cy="${y}"
                r="${circleRadius}"
                fill="${d.percentile === "50th percentile"
                  ? "#C741AF"
                  : "#A1AEB3"}"
                stroke="${d.percentile === "50th percentile"
                  ? "#fff"
                  : "transparent"}"
                stroke-width="2"
              />
              ${(d.compType === "Base" || d.compType === "base") &&
              html`<text
                x="${x + 10}"
                y="${y + circleRadius / 2 - 1}"
                class="text-annotations"
                dominant-baseline="middle"
                fill=${d.percentile === "50th percentile"
                  ? "#C741AF"
                  : "#738287"}
              >
                ${d.percentile === "90th percentile"
                  ? "90th percentile"
                  : d.percentile.replace("percentile", "")}
              </text>`}
            </g>`;
          })}
        </g>
      </svg>
    </div>
  `;
}
