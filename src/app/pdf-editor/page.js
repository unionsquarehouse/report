"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { format, parseISO } from "date-fns";
import {
  generateBarChartImage,
  generatePieChartImage,
} from "../utils/chartGenerators";

// Sample report data for preview
const reportData = {
  period: {
    start: "2025-11-29",
    end: "2025-12-29",
  },
  metrics: {
    totalVisitors: 2715,
    totalPageViews: 5205,
    resumesReceived: 75,
    conversionRate: 2.7,
    leadsToBitrix: 22,
  },
  topPages: [
    { name: "Homepage", visitors: 1180 },
    { name: "Team Page", visitors: 219 },
    { name: "Contact Page", visitors: 188 },
    { name: "Blog Page", visitors: 180 },
    { name: "Careers Page", visitors: 146 },
  ],
  trafficSources: [
    { name: "Google Search", visitors: 654 },
    { name: "Facebook", visitors: 142 },
    { name: "Direct/Others", visitors: 1920 },
  ],
  countries: [
    { country: "Singapore (SG)", code: "SG", visitors: 837, views: 1499 },
    {
      country: "United Arab Emirates (AE)",
      code: "AE",
      visitors: 615,
      views: 1598,
    },
    { country: "India (IN)", code: "IN", visitors: 398, views: 835 },
    { country: "China (CN)", code: "CN", visitors: 200, views: 211 },
    { country: "United States (US)", code: "US", visitors: 130, views: 155 },
  ],
  devices: [
    { name: "Desktop", visitors: 2109, percentage: 77.8 },
    { name: "Mobile", visitors: 605, percentage: 22.1 },
    { name: "Tablet", visitors: 1, percentage: 0.1 },
  ],
  operatingSystems: [
    { name: "Windows", percentage: 68 },
    { name: "iOS", percentage: 12 },
    { name: "Android", percentage: 10 },
    { name: "Others", percentage: 10 },
  ],
  blogPost: {
    title:
      "Why Meydan is 2025's Top Real Estate Investment Destination in Dubai",
    lifetimeViews: 1250,
  },
};

// Chart generation functions (simplified for preview)
const generateBarChartPreview = (
  data,
  labelKey = "name",
  valueKey = "visitors"
) => {
  const maxValue = Math.max(...data.map((d) => d[valueKey]));
  return data.map((item) => ({
    ...item,
    barHeight: (item[valueKey] / maxValue) * 100,
  }));
};

const generatePieChartPreview = (data, valueKey = "visitors") => {
  const total = data.reduce((sum, item) => sum + item[valueKey], 0);
  return data.map((item) => ({
    ...item,
    percentage: ((item[valueKey] / total) * 100).toFixed(1),
  }));
};

export default function PDFEditor() {
  const router = useRouter();
  const [showFullScreen, setShowFullScreen] = useState(false);
  const [chartImages, setChartImages] = useState({});

  // PDF Customization Settings
  const [settings, setSettings] = useState({
    // Colors
    primaryColor: "#000000",
    backgroundColor: "#f5f5f5",
    textColor: "#000000",
    borderColor: "#e0e0e0",

    // Fonts
    titleFontSize: 20,
    headingFontSize: 12,
    bodyFontSize: 9,
    fontFamily: "helvetica",

    // Layout
    margin: 15,
    cardPadding: 6,
    chartHeight: 80,

    // Sections
    showMetrics: true,
    showTopPages: true,
    showTrafficSources: true,
    showCountries: true,
    showDevices: true,
    showOS: true,
    showContentHighlights: true,
    showInsights: true,

    // Charts
    barChartColors: [
      "#000000",
      "#2a2a2a",
      "#4a4a4a",
      "#6a6a6a",
      "#8a8a8a",
      "#aaaaaa",
    ],
    pieChartSize: 45,
    pieChartWidth: 2.8,
  });

  // Generate chart images when settings change
  useEffect(() => {
    const generateCharts = () => {
      const images = {};
      if (settings.showTopPages) {
        images.topPages = generateBarChartImage(
          reportData.topPages,
          700,
          settings.chartHeight * 5,
          "name",
          "visitors"
        );
      }
      if (settings.showTrafficSources) {
        images.trafficSources = generatePieChartImage(
          reportData.trafficSources,
          700,
          400,
          "visitors",
          settings.barChartColors,
          settings.pieChartWidth
        );
      }
      if (settings.showDevices) {
        images.devices = generatePieChartImage(
          reportData.devices,
          700,
          400,
          "visitors",
          settings.barChartColors,
          settings.pieChartWidth
        );
      }
      if (settings.showOS) {
        images.os = generatePieChartImage(
          reportData.operatingSystems.map((os) => ({
            name: os.name,
            visitors: os.percentage,
          })),
          700,
          400,
          "visitors",
          settings.barChartColors,
          settings.pieChartWidth
        );
      }
      if (settings.showCountries) {
        images.countries = generateBarChartImage(
          reportData.countries,
          700,
          settings.chartHeight * 5,
          "code",
          "visitors"
        );
      }
      setChartImages(images);
    };
    generateCharts();
  }, [settings]);

  const handleSettingChange = (key, value) => {
    setSettings((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleColorChange = (key, value) => {
    setSettings((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleSaveAndExport = () => {
    // Save settings to localStorage
    localStorage.setItem("pdfSettings", JSON.stringify(settings));
    // Redirect to main page
    router.push("/");
  };

  const handleReset = () => {
    const defaultSettings = {
      primaryColor: "#000000",
      backgroundColor: "#f5f5f5",
      textColor: "#000000",
      borderColor: "#e0e0e0",
      titleFontSize: 20,
      headingFontSize: 12,
      bodyFontSize: 9,
      fontFamily: "helvetica",
      margin: 15,
      cardPadding: 6,
      chartHeight: 80,
      showMetrics: true,
      showTopPages: true,
      showTrafficSources: true,
      showCountries: true,
      showDevices: true,
      showOS: true,
      showContentHighlights: true,
      showInsights: true,
      barChartColors: [
        "#000000",
        "#2a2a2a",
        "#4a4a4a",
        "#6a6a6a",
        "#8a8a8a",
        "#aaaaaa",
      ],
      pieChartSize: 45,
      pieChartWidth: 2.8,
    };
    setSettings(defaultSettings);
    localStorage.setItem("pdfSettings", JSON.stringify(defaultSettings));
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-black">
                PDF Export Editor
              </h1>
              <p className="text-gray-600 mt-2">
                Customize how your PDF report will look before exporting
              </p>
            </div>
            <Link
              href="/"
              className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg transition-colors"
            >
              ← Back to Dashboard
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Settings Panel */}
          <div className="space-y-6">
            {/* Colors Section */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold mb-4 text-black">Colors</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Primary Color
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={settings.primaryColor}
                      onChange={(e) =>
                        handleColorChange("primaryColor", e.target.value)
                      }
                      className="w-16 h-10 rounded border border-gray-300 cursor-pointer"
                    />
                    <input
                      type="text"
                      value={settings.primaryColor}
                      onChange={(e) =>
                        handleColorChange("primaryColor", e.target.value)
                      }
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Background Color
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={settings.backgroundColor}
                      onChange={(e) =>
                        handleColorChange("backgroundColor", e.target.value)
                      }
                      className="w-16 h-10 rounded border border-gray-300 cursor-pointer"
                    />
                    <input
                      type="text"
                      value={settings.backgroundColor}
                      onChange={(e) =>
                        handleColorChange("backgroundColor", e.target.value)
                      }
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Text Color
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={settings.textColor}
                      onChange={(e) =>
                        handleColorChange("textColor", e.target.value)
                      }
                      className="w-16 h-10 rounded border border-gray-300 cursor-pointer"
                    />
                    <input
                      type="text"
                      value={settings.textColor}
                      onChange={(e) =>
                        handleColorChange("textColor", e.target.value)
                      }
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Border Color
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={settings.borderColor}
                      onChange={(e) =>
                        handleColorChange("borderColor", e.target.value)
                      }
                      className="w-16 h-10 rounded border border-gray-300 cursor-pointer"
                    />
                    <input
                      type="text"
                      value={settings.borderColor}
                      onChange={(e) =>
                        handleColorChange("borderColor", e.target.value)
                      }
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Fonts Section */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold mb-4 text-black">Fonts</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Title Font Size: {settings.titleFontSize}pt
                  </label>
                  <input
                    type="range"
                    min="14"
                    max="28"
                    value={settings.titleFontSize}
                    onChange={(e) =>
                      handleSettingChange(
                        "titleFontSize",
                        parseInt(e.target.value)
                      )
                    }
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Heading Font Size: {settings.headingFontSize}pt
                  </label>
                  <input
                    type="range"
                    min="8"
                    max="18"
                    value={settings.headingFontSize}
                    onChange={(e) =>
                      handleSettingChange(
                        "headingFontSize",
                        parseInt(e.target.value)
                      )
                    }
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Body Font Size: {settings.bodyFontSize}pt
                  </label>
                  <input
                    type="range"
                    min="6"
                    max="14"
                    value={settings.bodyFontSize}
                    onChange={(e) =>
                      handleSettingChange(
                        "bodyFontSize",
                        parseInt(e.target.value)
                      )
                    }
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Font Family
                  </label>
                  <select
                    value={settings.fontFamily}
                    onChange={(e) =>
                      handleSettingChange("fontFamily", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  >
                    <option value="helvetica">Helvetica</option>
                    <option value="times">Times</option>
                    <option value="courier">Courier</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Layout Section */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold mb-4 text-black">Layout</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Page Margin: {settings.margin}mm
                  </label>
                  <input
                    type="range"
                    min="5"
                    max="30"
                    value={settings.margin}
                    onChange={(e) =>
                      handleSettingChange("margin", parseInt(e.target.value))
                    }
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Card Padding: {settings.cardPadding}mm
                  </label>
                  <input
                    type="range"
                    min="3"
                    max="15"
                    value={settings.cardPadding}
                    onChange={(e) =>
                      handleSettingChange(
                        "cardPadding",
                        parseInt(e.target.value)
                      )
                    }
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Chart Height: {settings.chartHeight}mm
                  </label>
                  <input
                    type="range"
                    min="50"
                    max="120"
                    value={settings.chartHeight}
                    onChange={(e) =>
                      handleSettingChange(
                        "chartHeight",
                        parseInt(e.target.value)
                      )
                    }
                    className="w-full"
                  />
                </div>
              </div>
            </div>

            {/* Sections Visibility */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold mb-4 text-black">Sections</h2>
              <div className="space-y-3">
                {[
                  { key: "showMetrics", label: "Key Metrics" },
                  { key: "showTopPages", label: "Top Performing Pages" },
                  { key: "showTrafficSources", label: "Traffic Sources" },
                  { key: "showCountries", label: "Top Countries" },
                  { key: "showDevices", label: "Device Breakdown" },
                  { key: "showOS", label: "Operating Systems" },
                  { key: "showContentHighlights", label: "Content Highlights" },
                  { key: "showInsights", label: "Key Insights" },
                ].map((section) => (
                  <label
                    key={section.key}
                    className="flex items-center gap-3 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={settings[section.key]}
                      onChange={(e) =>
                        handleSettingChange(section.key, e.target.checked)
                      }
                      className="w-5 h-5 text-black border-gray-300 rounded focus:ring-2 focus:ring-black"
                    />
                    <span className="text-gray-700">{section.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Chart Settings */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold mb-4 text-black">
                Chart Settings
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Pie Chart Size: {settings.pieChartSize}%
                  </label>
                  <input
                    type="range"
                    min="30"
                    max="60"
                    value={settings.pieChartSize}
                    onChange={(e) =>
                      handleSettingChange(
                        "pieChartSize",
                        parseInt(e.target.value)
                      )
                    }
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Pie Chart Container Width: {settings.pieChartWidth}x
                  </label>
                  <input
                    type="range"
                    min="2"
                    max="5"
                    step="0.1"
                    value={settings.pieChartWidth}
                    onChange={(e) =>
                      handleSettingChange(
                        "pieChartWidth",
                        parseFloat(e.target.value)
                      )
                    }
                    className="w-full"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Live PDF Preview */}
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-8">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-black">
                  Live PDF Preview
                </h2>
                <div className="space-y-2">
                  <button
                    onClick={() => setShowFullScreen(true)}
                    className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold text-sm"
                  >
                    🔍 Full Screen Preview
                  </button>
                  <button
                    onClick={handleSaveAndExport}
                    className="w-full px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors font-semibold text-sm"
                  >
                    Save & Export
                  </button>
                  <button
                    onClick={handleReset}
                    className="w-full px-4 py-2 bg-gray-200 text-black rounded-lg hover:bg-gray-300 transition-colors font-semibold text-sm"
                  >
                    Reset
                  </button>
                </div>
              </div>

              {/* PDF Preview Container */}
              <div
                className="border-2 border-gray-300 rounded-lg overflow-hidden"
                style={{
                  backgroundColor: settings.backgroundColor,
                  aspectRatio: "210/297", // A4 ratio
                  maxHeight: "600px",
                  overflowY: "auto",
                }}
              >
                <div
                  className="p-4"
                  style={{
                    padding: `${settings.margin}px`,
                    fontFamily: settings.fontFamily,
                    color: settings.textColor,
                  }}
                >
                  {/* Title */}
                  <div
                    style={{
                      fontSize: `${settings.titleFontSize}pt`,
                      fontWeight: "bold",
                      textAlign: "center",
                      marginBottom: "8px",
                      color: settings.primaryColor,
                    }}
                  >
                    Union Square House
                  </div>
                  <div
                    style={{
                      fontSize: `${settings.titleFontSize * 0.8}pt`,
                      textAlign: "center",
                      marginBottom: "10px",
                      color: settings.textColor,
                    }}
                  >
                    Performance Dashboard
                  </div>

                  {/* Report Period */}
                  <div
                    style={{
                      fontSize: `${settings.bodyFontSize}pt`,
                      textAlign: "center",
                      marginBottom: "15px",
                      color: settings.textColor,
                    }}
                  >
                    Reporting Period:{" "}
                    {format(parseISO(reportData.period.start), "MMM dd, yyyy")}{" "}
                    – {format(parseISO(reportData.period.end), "MMM dd, yyyy")}
                  </div>

                  {/* Key Metrics */}
                  {settings.showMetrics && (
                    <div
                      className="grid grid-cols-4 gap-2 mb-4"
                      style={{
                        marginBottom: "15px",
                      }}
                    >
                      {[
                        {
                          label: "Total Visitors",
                          value: reportData.metrics.totalVisitors,
                        },
                        {
                          label: "Page Views",
                          value: reportData.metrics.totalPageViews,
                        },
                        {
                          label: "Resumes",
                          value: reportData.metrics.resumesReceived,
                        },
                        {
                          label: "Conversion",
                          value: `${reportData.metrics.conversionRate}%`,
                        },
                      ].map((metric, index) => (
                        <div
                          key={index}
                          style={{
                            border: `1px solid ${settings.borderColor}`,
                            borderRadius: "4px",
                            padding: `${settings.cardPadding}px`,
                            backgroundColor: "#ffffff",
                          }}
                        >
                          <div
                            style={{
                              fontSize: `${settings.bodyFontSize - 1}pt`,
                              color: settings.textColor,
                              marginBottom: "4px",
                            }}
                          >
                            {metric.label}
                          </div>
                          <div
                            style={{
                              fontSize: `${settings.headingFontSize}pt`,
                              fontWeight: "bold",
                              color: settings.primaryColor,
                            }}
                          >
                            {typeof metric.value === "number"
                              ? metric.value.toLocaleString()
                              : metric.value}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Top Performing Pages */}
                  {settings.showTopPages && (
                    <div
                      style={{
                        marginBottom: "15px",
                        border: `1px solid ${settings.borderColor}`,
                        borderRadius: "4px",
                        padding: `${settings.cardPadding}px`,
                        backgroundColor: "#ffffff",
                      }}
                    >
                      <div
                        style={{
                          fontSize: `${settings.headingFontSize}pt`,
                          fontWeight: "bold",
                          marginBottom: "8px",
                          color: settings.primaryColor,
                        }}
                      >
                        TOP PERFORMING PAGES
                      </div>
                      <div className="space-y-1">
                        {generateBarChartPreview(reportData.topPages).map(
                          (page, index) => (
                            <div
                              key={index}
                              className="flex items-center gap-2"
                            >
                              <div
                                style={{
                                  fontSize: `${settings.bodyFontSize}pt`,
                                  width: "40%",
                                  color: settings.textColor,
                                }}
                              >
                                {page.name.substring(0, 20)}
                              </div>
                              <div
                                style={{
                                  flex: 1,
                                  height: "12px",
                                  backgroundColor: settings.borderColor,
                                  borderRadius: "2px",
                                  overflow: "hidden",
                                }}
                              >
                                <div
                                  style={{
                                    width: `${page.barHeight}%`,
                                    height: "100%",
                                    backgroundColor: settings.primaryColor,
                                  }}
                                />
                              </div>
                              <div
                                style={{
                                  fontSize: `${settings.bodyFontSize}pt`,
                                  width: "60px",
                                  textAlign: "right",
                                  color: settings.textColor,
                                }}
                              >
                                {page.visitors.toLocaleString()}
                              </div>
                            </div>
                          )
                        )}
                      </div>
                    </div>
                  )}

                  {/* Traffic Sources - Pie Chart */}
                  {settings.showTrafficSources &&
                    chartImages.trafficSources && (
                      <div
                        style={{
                          marginBottom: "15px",
                          border: `1px solid ${settings.borderColor}`,
                          borderRadius: "4px",
                          padding: `${settings.cardPadding}px`,
                          backgroundColor: "#ffffff",
                        }}
                      >
                        <div
                          style={{
                            fontSize: `${settings.headingFontSize}pt`,
                            fontWeight: "bold",
                            marginBottom: "8px",
                            color: settings.primaryColor,
                          }}
                        >
                          TRAFFIC SOURCES
                        </div>
                        <img
                          src={chartImages.trafficSources}
                          alt="Traffic Sources Chart"
                          style={{
                            width: "100%",
                            height: "auto",
                            display: "block",
                          }}
                        />
                      </div>
                    )}

                  {/* Top Countries Chart */}
                  {settings.showCountries && chartImages.countries && (
                    <div
                      style={{
                        marginBottom: "15px",
                        border: `1px solid ${settings.borderColor}`,
                        borderRadius: "4px",
                        padding: `${settings.cardPadding}px`,
                        backgroundColor: "#ffffff",
                      }}
                    >
                      <div
                        style={{
                          fontSize: `${settings.headingFontSize}pt`,
                          fontWeight: "bold",
                          marginBottom: "8px",
                          color: settings.primaryColor,
                        }}
                      >
                        TOP COUNTRIES
                      </div>
                      <img
                        src={chartImages.countries}
                        alt="Countries Chart"
                        style={{
                          width: "100%",
                          height: "auto",
                          display: "block",
                        }}
                      />
                    </div>
                  )}

                  {/* Device Breakdown - Pie Chart */}
                  {settings.showDevices && chartImages.devices && (
                    <div
                      style={{
                        marginBottom: "15px",
                        border: `1px solid ${settings.borderColor}`,
                        borderRadius: "4px",
                        padding: `${settings.cardPadding}px`,
                        backgroundColor: "#ffffff",
                      }}
                    >
                      <div
                        style={{
                          fontSize: `${settings.headingFontSize}pt`,
                          fontWeight: "bold",
                          marginBottom: "8px",
                          color: settings.primaryColor,
                        }}
                      >
                        DEVICE BREAKDOWN
                      </div>
                      <img
                        src={chartImages.devices}
                        alt="Device Breakdown Chart"
                        style={{
                          width: "100%",
                          height: "auto",
                          display: "block",
                        }}
                      />
                    </div>
                  )}

                  {/* Operating Systems - Pie Chart */}
                  {settings.showOS && chartImages.os && (
                    <div
                      style={{
                        marginBottom: "15px",
                        border: `1px solid ${settings.borderColor}`,
                        borderRadius: "4px",
                        padding: `${settings.cardPadding}px`,
                        backgroundColor: "#ffffff",
                      }}
                    >
                      <div
                        style={{
                          fontSize: `${settings.headingFontSize}pt`,
                          fontWeight: "bold",
                          marginBottom: "8px",
                          color: settings.primaryColor,
                        }}
                      >
                        OPERATING SYSTEMS
                      </div>
                      <img
                        src={chartImages.os}
                        alt="Operating Systems Chart"
                        style={{
                          width: "100%",
                          height: "auto",
                          display: "block",
                        }}
                      />
                    </div>
                  )}

                  {/* Content Highlights */}
                  {settings.showContentHighlights && (
                    <div
                      style={{
                        marginBottom: "15px",
                        border: `1px solid ${settings.borderColor}`,
                        borderRadius: "4px",
                        padding: `${settings.cardPadding}px`,
                        backgroundColor: "#ffffff",
                      }}
                    >
                      <div
                        style={{
                          fontSize: `${settings.headingFontSize}pt`,
                          fontWeight: "bold",
                          marginBottom: "8px",
                          color: settings.primaryColor,
                        }}
                      >
                        CONTENT HIGHLIGHTS
                      </div>
                      <div
                        style={{
                          fontSize: `${settings.bodyFontSize}pt`,
                          color: settings.textColor,
                          marginBottom: "4px",
                        }}
                      >
                        {reportData.blogPost.title.substring(0, 50)}...
                      </div>
                      <div
                        style={{
                          fontSize: `${settings.bodyFontSize}pt`,
                          color: settings.textColor,
                        }}
                      >
                        Lifetime Views:{" "}
                        {reportData.blogPost.lifetimeViews.toLocaleString()}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Full Screen Preview Modal */}
      {showFullScreen && (
        <div
          className="fixed inset-0 z-50 bg-black bg-opacity-90 flex items-center justify-center p-8"
          onClick={() => setShowFullScreen(false)}
        >
          <div
            className="bg-white rounded-lg shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-auto"
            onClick={(e) => e.stopPropagation()}
            style={{
              backgroundColor: settings.backgroundColor,
            }}
          >
            <div className="sticky top-0 bg-white border-b border-gray-300 p-4 flex items-center justify-between z-10">
              <h2 className="text-2xl font-bold text-black">
                Full Screen Preview
              </h2>
              <button
                onClick={() => setShowFullScreen(false)}
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg transition-colors font-semibold"
              >
                ✕ Close
              </button>
            </div>
            <div
              className="p-8"
              style={{
                padding: `${settings.margin}px`,
                fontFamily:
                  settings.fontFamily === "helvetica"
                    ? "Arial, sans-serif"
                    : settings.fontFamily === "times"
                    ? "Times, serif"
                    : "Courier, monospace",
                color: settings.textColor,
              }}
            >
              {/* Title */}
              <div
                style={{
                  fontSize: `${settings.titleFontSize}pt`,
                  fontWeight: "bold",
                  textAlign: "center",
                  marginBottom: "8px",
                  color: settings.primaryColor,
                }}
              >
                Union Square House
              </div>
              <div
                style={{
                  fontSize: `${settings.titleFontSize * 0.8}pt`,
                  textAlign: "center",
                  marginBottom: "10px",
                  color: settings.textColor,
                }}
              >
                Performance Dashboard
              </div>

              {/* Report Period */}
              <div
                style={{
                  fontSize: `${settings.bodyFontSize}pt`,
                  textAlign: "center",
                  marginBottom: "15px",
                  color: settings.textColor,
                }}
              >
                Reporting Period:{" "}
                {format(parseISO(reportData.period.start), "MMM dd, yyyy")} –{" "}
                {format(parseISO(reportData.period.end), "MMM dd, yyyy")}
              </div>

              {/* Key Metrics */}
              {settings.showMetrics && (
                <div
                  className="grid grid-cols-4 gap-2 mb-4"
                  style={{
                    marginBottom: "15px",
                  }}
                >
                  {[
                    {
                      label: "Total Visitors",
                      value: reportData.metrics.totalVisitors,
                    },
                    {
                      label: "Page Views",
                      value: reportData.metrics.totalPageViews,
                    },
                    {
                      label: "Resumes",
                      value: reportData.metrics.resumesReceived,
                    },
                    {
                      label: "Conversion",
                      value: `${reportData.metrics.conversionRate}%`,
                    },
                  ].map((metric, index) => (
                    <div
                      key={index}
                      style={{
                        border: `1px solid ${settings.borderColor}`,
                        borderRadius: "4px",
                        padding: `${settings.cardPadding}px`,
                        backgroundColor: "#ffffff",
                      }}
                    >
                      <div
                        style={{
                          fontSize: `${settings.bodyFontSize - 1}pt`,
                          color: settings.textColor,
                          marginBottom: "4px",
                        }}
                      >
                        {metric.label}
                      </div>
                      <div
                        style={{
                          fontSize: `${settings.headingFontSize}pt`,
                          fontWeight: "bold",
                          color: settings.primaryColor,
                        }}
                      >
                        {typeof metric.value === "number"
                          ? metric.value.toLocaleString()
                          : metric.value}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Top Performing Pages */}
              {settings.showTopPages && chartImages.topPages && (
                <div
                  style={{
                    marginBottom: "15px",
                    border: `1px solid ${settings.borderColor}`,
                    borderRadius: "4px",
                    padding: `${settings.cardPadding}px`,
                    backgroundColor: "#ffffff",
                  }}
                >
                  <div
                    style={{
                      fontSize: `${settings.headingFontSize}pt`,
                      fontWeight: "bold",
                      marginBottom: "8px",
                      color: settings.primaryColor,
                    }}
                  >
                    TOP PERFORMING PAGES
                  </div>
                  <img
                    src={chartImages.topPages}
                    alt="Top Pages Chart"
                    style={{
                      width: "100%",
                      height: "auto",
                      display: "block",
                    }}
                  />
                </div>
              )}

              {/* Traffic Sources */}
              {settings.showTrafficSources && chartImages.trafficSources && (
                <div
                  style={{
                    marginBottom: "15px",
                    border: `1px solid ${settings.borderColor}`,
                    borderRadius: "4px",
                    padding: `${settings.cardPadding}px`,
                    backgroundColor: "#ffffff",
                  }}
                >
                  <div
                    style={{
                      fontSize: `${settings.headingFontSize}pt`,
                      fontWeight: "bold",
                      marginBottom: "8px",
                      color: settings.primaryColor,
                    }}
                  >
                    TRAFFIC SOURCES
                  </div>
                  <img
                    src={chartImages.trafficSources}
                    alt="Traffic Sources Chart"
                    style={{
                      width: "100%",
                      height: "auto",
                      display: "block",
                    }}
                  />
                </div>
              )}

              {/* Countries */}
              {settings.showCountries && chartImages.countries && (
                <div
                  style={{
                    marginBottom: "15px",
                    border: `1px solid ${settings.borderColor}`,
                    borderRadius: "4px",
                    padding: `${settings.cardPadding}px`,
                    backgroundColor: "#ffffff",
                  }}
                >
                  <div
                    style={{
                      fontSize: `${settings.headingFontSize}pt`,
                      fontWeight: "bold",
                      marginBottom: "8px",
                      color: settings.primaryColor,
                    }}
                  >
                    TOP COUNTRIES
                  </div>
                  <img
                    src={chartImages.countries}
                    alt="Countries Chart"
                    style={{
                      width: "100%",
                      height: "auto",
                      display: "block",
                    }}
                  />
                </div>
              )}

              {/* Device Breakdown */}
              {settings.showDevices && chartImages.devices && (
                <div
                  style={{
                    marginBottom: "15px",
                    border: `1px solid ${settings.borderColor}`,
                    borderRadius: "4px",
                    padding: `${settings.cardPadding}px`,
                    backgroundColor: "#ffffff",
                  }}
                >
                  <div
                    style={{
                      fontSize: `${settings.headingFontSize}pt`,
                      fontWeight: "bold",
                      marginBottom: "8px",
                      color: settings.primaryColor,
                    }}
                  >
                    DEVICE BREAKDOWN
                  </div>
                  <img
                    src={chartImages.devices}
                    alt="Device Breakdown Chart"
                    style={{
                      width: "100%",
                      height: "auto",
                      display: "block",
                    }}
                  />
                </div>
              )}

              {/* Operating Systems */}
              {settings.showOS && chartImages.os && (
                <div
                  style={{
                    marginBottom: "15px",
                    border: `1px solid ${settings.borderColor}`,
                    borderRadius: "4px",
                    padding: `${settings.cardPadding}px`,
                    backgroundColor: "#ffffff",
                  }}
                >
                  <div
                    style={{
                      fontSize: `${settings.headingFontSize}pt`,
                      fontWeight: "bold",
                      marginBottom: "8px",
                      color: settings.primaryColor,
                    }}
                  >
                    OPERATING SYSTEMS
                  </div>
                  <img
                    src={chartImages.os}
                    alt="Operating Systems Chart"
                    style={{
                      width: "100%",
                      height: "auto",
                      display: "block",
                    }}
                  />
                </div>
              )}

              {/* Content Highlights */}
              {settings.showContentHighlights && (
                <div
                  style={{
                    marginBottom: "15px",
                    border: `1px solid ${settings.borderColor}`,
                    borderRadius: "4px",
                    padding: `${settings.cardPadding}px`,
                    backgroundColor: "#ffffff",
                  }}
                >
                  <div
                    style={{
                      fontSize: `${settings.headingFontSize}pt`,
                      fontWeight: "bold",
                      marginBottom: "8px",
                      color: settings.primaryColor,
                    }}
                  >
                    CONTENT HIGHLIGHTS
                  </div>
                  <div
                    style={{
                      fontSize: `${settings.bodyFontSize}pt`,
                      color: settings.textColor,
                      marginBottom: "4px",
                    }}
                  >
                    {reportData.blogPost.title.substring(0, 50)}...
                  </div>
                  <div
                    style={{
                      fontSize: `${settings.bodyFontSize}pt`,
                      color: settings.textColor,
                    }}
                  >
                    Lifetime Views:{" "}
                    {reportData.blogPost.lifetimeViews.toLocaleString()}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
