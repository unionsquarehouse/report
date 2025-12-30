// Shared chart generation functions for both preview and export

const COLORS = [
  "#6366F1", // Indigo - complements blue/purple gradient
  "#8B5CF6", // Purple - matches background purple tones
  "#06B6D4", // Cyan - complements blue tones
  "#EC4899", // Pink - warm accent
  "#10B981", // Emerald - fresh contrast
  "#F59E0B", // Amber - warm highlight
  "#3B82F6", // Blue - matches background blue
  "#A855F7", // Violet - deep purple accent
  "#14B8A6", // Teal - bridges blue and green
  "#F97316", // Orange - vibrant warm accent
];

// Helper function to generate bar chart image
export const generateBarChartImage = (
  data,
  width = 700,
  height = 400,
  labelKey = "name",
  valueKey = "visitors",
  colors = COLORS
) => {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");

  // White background with border
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, width, height);
  ctx.strokeStyle = "#e0e0e0";
  ctx.lineWidth = 2;
  ctx.strokeRect(1, 1, width - 2, height - 2);

  const leftPadding = 70;
  const rightPadding = 30;
  const topPadding = 50;
  const bottomPadding = 100; // Increased to prevent label overlap
  const chartWidth = width - leftPadding - rightPadding;
  const chartHeight = height - topPadding - bottomPadding;
  const maxValue = Math.max(...data.map((d) => d[valueKey]));
  const roundedMax = Math.ceil(maxValue * 1.1);
  const barSpacing = 15;
  const availableWidth = chartWidth - (data.length - 1) * barSpacing;
  const barWidth = Math.min(availableWidth / data.length, 60);

  // Draw Y-axis grid lines and labels
  const gridLines = 5;
  ctx.strokeStyle = "#e5e7eb";
  ctx.lineWidth = 1;
  ctx.font = "11px 'Segoe UI', Arial, sans-serif";
  ctx.fillStyle = "#666666";
  ctx.textAlign = "right";
  ctx.textBaseline = "middle";

  for (let i = 0; i <= gridLines; i++) {
    const y = topPadding + (chartHeight / gridLines) * (gridLines - i);
    const value = (roundedMax / gridLines) * i;

    // Grid line
    ctx.beginPath();
    ctx.moveTo(leftPadding, y);
    ctx.lineTo(width - rightPadding, y);
    ctx.stroke();

    // Y-axis label
    ctx.fillText(value.toLocaleString(), leftPadding - 10, y);
  }

  // Draw X-axis line
  ctx.strokeStyle = "#000000";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(leftPadding, topPadding + chartHeight);
  ctx.lineTo(width - rightPadding, topPadding + chartHeight);
  ctx.stroke();

  // Draw Y-axis line
  ctx.beginPath();
  ctx.moveTo(leftPadding, topPadding);
  ctx.lineTo(leftPadding, topPadding + chartHeight);
  ctx.stroke();

  // Draw bars with gradient effect
  data.forEach((item, index) => {
    const barHeight = (item[valueKey] / roundedMax) * chartHeight;
    const x = leftPadding + index * (barWidth + barSpacing);
    const y = topPadding + chartHeight - barHeight;

    // Bar with gradient using colorful palette
    const baseColor = colors[index % colors.length];
    const gradient = ctx.createLinearGradient(x, y, x, y + barHeight);
    gradient.addColorStop(0, baseColor);
    gradient.addColorStop(1, baseColor);
    ctx.fillStyle = gradient;
    ctx.fillRect(x, y, barWidth, barHeight);

    // Bar border
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 1;
    ctx.strokeRect(x, y, barWidth, barHeight);

    // Value label on top of bar
    if (barHeight > 20) {
      ctx.fillStyle = "#000000";
      ctx.font = "bold 12px 'Segoe UI', Arial, sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "bottom";
      ctx.fillText(item[valueKey].toLocaleString(), x + barWidth / 2, y - 5);
    }

    // X-axis label (rotated if needed)
    ctx.fillStyle = "#333333";
    ctx.font = "11px 'Segoe UI', Arial, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "top";
    const label =
      item[labelKey].length > 20
        ? item[labelKey].substring(0, 17) + "..."
        : item[labelKey];

    // Rotate context for angled labels - position further down to prevent overlap
    ctx.save();
    ctx.translate(x + barWidth / 2, topPadding + chartHeight + 25); // Increased from 15 to 25
    ctx.rotate(-Math.PI / 4);
    ctx.fillText(label, 0, 0);
    ctx.restore();
  });

  return canvas.toDataURL("image/png");
};

// Helper function to generate pie chart image
export const generatePieChartImage = (
  data,
  width = 400,
  height = 400,
  valueKey = "visitors",
  colors = COLORS,
  pieChartWidth = 2.8
) => {
  const canvas = document.createElement("canvas");
  const pieChartSize = Math.min(width, height);
  const chartWidth = pieChartSize * pieChartWidth;
  const chartHeight = pieChartSize;
  canvas.width = chartWidth;
  canvas.height = chartHeight;
  const ctx = canvas.getContext("2d");

  // White background with border
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, chartWidth, chartHeight);
  ctx.strokeStyle = "#e0e0e0";
  ctx.lineWidth = 2;
  ctx.strokeRect(1, 1, chartWidth - 2, chartHeight - 2);

  const pieRadius = pieChartSize * 0.4;
  const centerX = pieChartSize * 0.5;
  const centerY = pieChartSize / 2;
  const legendX = pieChartSize * 1.05;
  const legendStartY = pieChartSize * 0.15;

  const total = data.reduce((sum, item) => sum + item[valueKey], 0);
  let currentAngle = -Math.PI / 2;

  data.forEach((item, index) => {
    const sliceAngle = (item[valueKey] / total) * 2 * Math.PI;

    const gradient = ctx.createLinearGradient(
      centerX + Math.cos(currentAngle) * pieRadius * 0.5,
      centerY + Math.sin(currentAngle) * pieRadius * 0.5,
      centerX + Math.cos(currentAngle + sliceAngle) * pieRadius * 0.5,
      centerY + Math.sin(currentAngle + sliceAngle) * pieRadius * 0.5
    );
    const baseColor = colors[index % colors.length];
    gradient.addColorStop(0, baseColor);
    gradient.addColorStop(1, baseColor === "#000000" ? "#1a1a1a" : baseColor);

    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.arc(
      centerX,
      centerY,
      pieRadius,
      currentAngle,
      currentAngle + sliceAngle
    );
    ctx.closePath();
    ctx.fillStyle = gradient;
    ctx.fill();

    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 3;
    ctx.stroke();

    const slicePercentage = ((item[valueKey] / total) * 100).toFixed(1);

    const legendY = legendStartY + index * 38;
    const legendBoxSize = 14;

    ctx.fillStyle = colors[index % colors.length];
    ctx.fillRect(
      legendX,
      legendY - legendBoxSize / 2,
      legendBoxSize,
      legendBoxSize
    );
    ctx.strokeStyle = "#cccccc";
    ctx.lineWidth = 1;
    ctx.strokeRect(
      legendX,
      legendY - legendBoxSize / 2,
      legendBoxSize,
      legendBoxSize
    );

    ctx.fillStyle = "#000000";
    ctx.font = "bold 12px 'Segoe UI', Arial, sans-serif";
    ctx.textAlign = "left";
    ctx.textBaseline = "top";

    const maxNameLength = 20;
    const displayName =
      item.name.length > maxNameLength
        ? item.name.substring(0, maxNameLength - 3) + "..."
        : item.name;

    ctx.fillText(displayName, legendX + legendBoxSize + 8, legendY - 6);

    ctx.fillStyle = "#666666";
    ctx.font = "11px 'Segoe UI', Arial, sans-serif";
    ctx.fillText(
      `${item[valueKey].toLocaleString()} (${slicePercentage}%)`,
      legendX + legendBoxSize + 8,
      legendY + 8
    );

    currentAngle += sliceAngle;
  });

  return canvas.toDataURL("image/png");
};

