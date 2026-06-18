import { html } from "./preact-htm.js";

export function Radarchart({ data }) {
  // vis dimensions
  const visContainer = document.querySelector(`#radarchart-container`);
  let width =
    visContainer && visContainer.offsetWidth ? visContainer.offsetWidth : 600;
  console.log("Calculated width:", width);

  const height = width;

  const margin = 50;
  const maxRadius = (width - 2 * margin) / 2;
  const centerX = width / 2;
  const centerY = height / 2;

  console.log("Rendering Radarchart with data:", data);

  if (data.length === 0) {
    return html`
      <div class="radarchart">
        <p class="text-chart">
          No data available for team and role combination
        </p>
      </div>
    `;
  }

  // Use first data item
  const chartData = data[0];
  const axes = [
    { name: "Carry", value: chartData.valueCarry, angle: -Math.PI / 2 },
    {
      name: "Equity",
      value: chartData.valueEquity,
      angle: -Math.PI / 2 + (2 * Math.PI) / 3,
    },
    {
      name: "Bonus",
      value: chartData.valueBonus,
      angle: -Math.PI / 2 + (4 * Math.PI) / 3,
    },
  ];

  // Calculate SVG coordinates from polar coordinates
  const polarToCartesian = (angle, radius) => {
    const x = centerX + radius * Math.cos(angle);
    const y = centerY + radius * Math.sin(angle);
    return { x, y };
  };

  // Get axis endpoints
  const axisEndpoints = axes.map((axis) =>
    polarToCartesian(axis.angle, maxRadius),
  );

  // Get data polygon points
  const dataPoints = axes.map((axis) => {
    const radius = (axis.value / 100) * maxRadius;
    return polarToCartesian(axis.angle, radius);
  });

  const getPointBetween = (startPoint, endPoint, offset) => ({
    x: startPoint.x + (endPoint.x - startPoint.x) * offset,
    y: startPoint.y + (endPoint.y - startPoint.y) * offset,
  });

  const createRoundedClosedPath = (points, cornerOffset = 0.18) => {
    if (points.length < 3) {
      return "";
    }

    return (
      points.reduce((path, point, index) => {
        const previousPoint =
          points[(index - 1 + points.length) % points.length];
        const nextPoint = points[(index + 1) % points.length];
        const curveStart = getPointBetween(point, previousPoint, cornerOffset);
        const curveEnd = getPointBetween(point, nextPoint, cornerOffset);

        if (index === 0) {
          return `M ${curveStart.x},${curveStart.y} Q ${point.x},${point.y} ${curveEnd.x},${curveEnd.y}`;
        }

        return `${path} L ${curveStart.x},${curveStart.y} Q ${point.x},${point.y} ${curveEnd.x},${curveEnd.y}`;
      }, "") + " Z"
    );
  };

  // Generate grid triangle paths
  const gridLevels = [0.2, 0.4, 0.6, 0.8, 1];
  const gridTriangles = gridLevels.map((level) => {
    const points = axes.map((axis) => {
      const radius = level * maxRadius;
      return polarToCartesian(axis.angle, radius);
    });
    const trianglePath =
      "M " + points.map((p) => `${p.x},${p.y}`).join(" L ") + " Z";
    return html`
      <path d="${trianglePath}" fill="none" stroke="#e0e0e0" stroke-width="1" />
    `;
  });

  // Generate grid labels (percentages)
  const gridLabels = gridLevels.map((level) => {
    const r = level * maxRadius;
    const { x, y } = polarToCartesian(-Math.PI / 2, r);
    return html`
      <text
        x="${x}"
        y="${y - 2}"
        text-anchor="middle"
        class="text-chart"
        fill="#738287"
      >
        ${Math.round(level * 100)}%
      </text>
    `;
  });

  // Generate radial lines from center to each axis
  const radialLines = axisEndpoints.map(
    (endpoint) => html`
      <line
        x1="${centerX}"
        y1="${centerY}"
        x2="${endpoint.x}"
        y2="${endpoint.y}"
        stroke="#e0e0e0"
        stroke-width="1"
      />
    `,
  );

  // Generate axis labels
  const axisLabels = axes.map((axis, i) => {
    const { x, y } = polarToCartesian(axis.angle, maxRadius + 40);
    // <text x="${x}" y="${y + 18}" text-anchor="middle" class="text-chart">
    //   ${axis.value.toFixed(1)}%
    // </text>
    return html`
      <text x="${x}" y="${y}" text-anchor="middle" class="text-chart">
        ${axis.name}
      </text>
    `;
  });

  // Build a closed path with softened corners.
  const polygonPath = createRoundedClosedPath(dataPoints);

  return html`
    <div class="radarchart" id="radarchart-container">
      <svg viewBox="0 0 ${width} ${height}">
        <!-- Grid triangles -->
        ${gridTriangles}

        <!-- Radial lines (on top of grid) -->
        ${radialLines}

        <!-- Grid labels (on top of lines) -->
        ${gridLabels}

        <!-- Data polygon -->
        <path
          d="${polygonPath}"
          fill="rgba(199, 65, 175, 0.2)"
          stroke="#C741AF"
          stroke-width="2"
        />

        <!-- Role label vertically centered between carry and equity data points -->
        ${html`
          <text
            x="${dataPoints[1].x + 5}"
            y="${(dataPoints[0].y + dataPoints[1].y) / 2}"
            class="text-annotations"
            fill="#C741AF"
            dominant-baseline="middle"
          >
            ${chartData.role}
          </text>
        `}

        <!-- Axis labels -->
        ${axisLabels}
      </svg>
    </div>
  `;
}
