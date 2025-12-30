"use client";

import { useState, useRef, useEffect } from "react";
import { format, parseISO } from "date-fns";
import Image from "next/image";
import Link from "next/link";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { jsPDF } from "jspdf";
import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  AlignmentType,
  Media,
  ImageRun,
  Table,
  TableRow,
  TableCell,
  WidthType,
} from "docx";

// Report data
const reportData = {
  period: {
    start: "2025-11-29",
    end: "2025-12-29",
  },
  metrics: {
    totalVisitors: 2976,
    totalPageViews: 5699,
    resumesReceived: 74,
    conversionRate: 2.5,
    leadsToBitrix: 22,
  },
  topPages: [
    { name: "Homepage", visitors: 1248 },
    { name: "Team Page", visitors: 239 },
    { name: "Contact Page", visitors: 206 },
    { name: "Blog Page", visitors: 190 },
    { name: "Property Listings", visitors: 159 },
    { name: "Careers Page", visitors: 150 },
  ],
  trafficSources: [
    { name: "Google Search", visitors: 676 },
    { name: "Bing", visitors: 29 },
    { name: "Direct/Others", visitors: 2119 },
    { name: "Meta", visitors: 145 },
  ],
  countries: [
    { country: "Singapore (SG)", code: "SG", visitors: 960, views: 1643 },
    {
      country: "United Arab Emirates (AE)",
      code: "AE",
      visitors: 652,
      views: 1695,
    },
    { country: "India (IN)", code: "IN", visitors: 414, views: 974 },
    { country: "China (CN)", code: "CN", visitors: 203, views: 214 },
    { country: "United States (US)", code: "US", visitors: 153, views: 183 },
    { country: "Pakistan (PK)", code: "PK", visitors: 87, views: 128 },
    { country: "Brazil (BR)", code: "BR", visitors: 58, views: 59 },
    { country: "United Kingdom (GB)", code: "GB", visitors: 47, views: 77 },
  ],
  devices: [
    { name: "Desktop", visitors: 2338, percentage: 78.6 },
    { name: "Mobile", visitors: 637, percentage: 21.4 },
    { name: "Tablet", visitors: 1, percentage: 0.0 },
  ],
  operatingSystems: [
    { name: "Windows", percentage: 69.4 },
    { name: "iOS", percentage: 11.7 },
    { name: "Android", percentage: 9.7 },
    { name: "Mac OS", percentage: 7.8 },
    { name: "GNU/Linux", percentage: 1.0 },
    { name: "Others", percentage: 0.4 },
  ],
  blogPost: {
    title: "Why Millionaires are Flocking to Dubai in 2025",
    lifetimeViews: 37,
  },
};

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

// Custom tooltip component
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="glass-card border border-white/50 p-4 rounded-xl shadow-2xl backdrop-blur-xl">
        <p className="font-bold text-black mb-2 text-base border-b border-gray-200/50 pb-2">
          {label}
        </p>
        {payload.map((entry, index) => (
          <p key={index} className="text-sm text-black flex items-center gap-2">
            <span
              className="w-3 h-3 rounded-sm"
              style={{ backgroundColor: entry.color }}
            ></span>
            <span className="font-semibold">{entry.name}:</span>{" "}
            <span className="font-bold">
              {typeof entry.value === "number"
                ? entry.value.toLocaleString()
                : entry.value}
            </span>
          </p>
        ))}
      </div>
    );
  }
  return null;
};

// Import shared chart generators
import {
  generateBarChartImage,
  generatePieChartImage,
} from "./utils/chartGenerators";

export default function Home() {
  const [startDate, setStartDate] = useState(reportData.period.start);
  const [endDate, setEndDate] = useState(reportData.period.end);
  const [analyticsData] = useState(reportData);
  const reportRef = useRef(null);
  const [isMobile, setIsMobile] = useState(false);

  // Detect mobile screen size
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 640);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Load PDF settings from localStorage
  const [pdfSettings, setPdfSettings] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("pdfSettings");
      return saved ? JSON.parse(saved) : null;
    }
    return null;
  });

  const handleStartDateChange = (e) => {
    const newStartDate = e.target.value;
    if (newStartDate) {
      setStartDate(newStartDate);
      // Ensure end date is not before start date
      if (newStartDate > endDate) {
        setEndDate(newStartDate);
      }
    }
  };

  const handleEndDateChange = (e) => {
    const newEndDate = e.target.value;
    if (newEndDate) {
      // Ensure end date is not before start date
      if (newEndDate >= startDate) {
        setEndDate(newEndDate);
      } else {
        // If end date is before start date, update start date instead
        setStartDate(newEndDate);
        setEndDate(newEndDate);
      }
    }
  };

  const handleExportPDF = async () => {
    try {
      console.log("PDF export button clicked");

      // Load settings from localStorage
      const savedSettings =
        typeof window !== "undefined"
          ? JSON.parse(localStorage.getItem("pdfSettings") || "null")
          : null;

      // Use saved settings or defaults
      const settings = savedSettings || {
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
          "#4A90E2", // Soft blue
          "#50C878", // Mint green
          "#FF6B6B", // Coral red
          "#FFA07A", // Light salmon
          "#9370DB", // Medium purple
          "#20B2AA", // Light sea green
          "#FFD700", // Gold
          "#87CEEB", // Sky blue
          "#DDA0DD", // Plum
          "#98D8C8", // Mint
        ],
        pieChartSize: 45,
        pieChartWidth: 2.8,
      };

      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      const pageWidth = 210;
      const pageHeight = 297;
      const margin = settings.margin;
      let yPos = margin;

      // Set background color
      pdf.setFillColor(settings.backgroundColor);
      pdf.rect(0, 0, pageWidth, pageHeight, "F");

      // Helper function to add new page if needed
      const checkNewPage = (requiredHeight) => {
        if (yPos + requiredHeight > pageHeight - margin) {
          pdf.addPage();
          // Set background on new page too
          pdf.setFillColor(settings.backgroundColor);
          pdf.rect(0, 0, pageWidth, pageHeight, "F");
          yPos = margin;
          return true;
        }
        return false;
      };

      // Convert hex color to RGB for jsPDF
      const hexToRgb = (hex) => {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result
          ? {
              r: parseInt(result[1], 16),
              g: parseInt(result[2], 16),
              b: parseInt(result[3], 16),
            }
          : { r: 0, g: 0, b: 0 };
      };

      const primaryRgb = hexToRgb(settings.primaryColor);
      const textRgb = hexToRgb(settings.textColor);
      const borderRgb = hexToRgb(settings.borderColor);

      // Title
      pdf.setFontSize(settings.titleFontSize);
      pdf.setFont(settings.fontFamily, "bold");
      pdf.setTextColor(primaryRgb.r, primaryRgb.g, primaryRgb.b);
      pdf.text("Union Square House", pageWidth / 2, yPos, { align: "center" });
      yPos += 8;
      pdf.setFontSize(settings.titleFontSize * 0.8);
      pdf.setFont(settings.fontFamily, "normal");
      pdf.setTextColor(textRgb.r, textRgb.g, textRgb.b);
      pdf.text("Performance Dashboard", pageWidth / 2, yPos, {
        align: "center",
      });
      yPos += 10;

      // Report Period
      pdf.setFontSize(settings.bodyFontSize);
      pdf.setFont(settings.fontFamily, "normal");
      const periodText = `Reporting Period: ${format(
        parseISO(startDate),
        "MMM dd, yyyy"
      )} – ${format(parseISO(endDate), "MMM dd, yyyy")}`;
      pdf.text(periodText, pageWidth / 2, yPos, { align: "center" });
      yPos += 15;

      // Key Metrics Cards
      if (settings.showMetrics) {
        pdf.setFontSize(settings.headingFontSize);
        pdf.setFont(settings.fontFamily, "bold");
        pdf.setTextColor(primaryRgb.r, primaryRgb.g, primaryRgb.b);
        pdf.text("KEY METRICS", margin, yPos);
        yPos += 8;

        const metrics = [
          {
            label: "Total Visitors",
            value: analyticsData.metrics.totalVisitors,
          },
          {
            label: "Total Page Views",
            value: analyticsData.metrics.totalPageViews,
          },
          {
            label: "Resumes Received",
            value: analyticsData.metrics.resumesReceived,
          },
          {
            label: "Leads to Bitrix",
            value: analyticsData.metrics.leadsToBitrix,
          },
          {
            label: "Conversion Rate",
            value: `${analyticsData.metrics.conversionRate}%`,
          },
        ];

        const cardWidth = (pageWidth - 2 * margin - 12) / 5;
        metrics.forEach((metric, index) => {
          const xPos = margin + index * (cardWidth + 3);
          pdf.setDrawColor(borderRgb.r, borderRgb.g, borderRgb.b);
          pdf.setFillColor(255, 255, 255);
          pdf.roundedRect(xPos, yPos, cardWidth, 20, 2, 2, "FD");
          pdf.setFontSize(settings.bodyFontSize - 1);
          pdf.setFont(settings.fontFamily, "normal");
          pdf.setTextColor(textRgb.r, textRgb.g, textRgb.b);
          pdf.text(metric.label, xPos + settings.cardPadding, yPos + 5);
          pdf.setFontSize(settings.headingFontSize);
          pdf.setFont(settings.fontFamily, "bold");
          pdf.setTextColor(primaryRgb.r, primaryRgb.g, primaryRgb.b);
          pdf.text(
            typeof metric.value === "number"
              ? metric.value.toLocaleString()
              : metric.value,
            xPos + settings.cardPadding,
            yPos + 12
          );
        });
        yPos += 25;
      }

      // Top Performing Pages Chart
      if (settings.showTopPages) {
        checkNewPage(settings.chartHeight + 20);
        yPos += 10; // Add spacing between key metrics and top performing pages
        pdf.setFontSize(settings.headingFontSize);
        pdf.setFont(settings.fontFamily, "bold");
        pdf.setTextColor(primaryRgb.r, primaryRgb.g, primaryRgb.b);
        pdf.text("TOP PERFORMING PAGES", margin, yPos);
        yPos += 8;

        const topPagesChartImg = generateBarChartImage(
          analyticsData.topPages,
          700,
          settings.chartHeight * 5,
          "name",
          "visitors",
          settings.barChartColors
        );
        // Calculate aspect ratio: chart is generated at 700 wide, chartHeight*5 tall
        const barChartAspectRatio = 700 / (settings.chartHeight * 5);
        const chartWidth = pageWidth - 2 * margin;
        const chartHeight = chartWidth / barChartAspectRatio;
        pdf.addImage(
          topPagesChartImg,
          "PNG",
          margin,
          yPos,
          chartWidth,
          chartHeight
        );
        yPos += chartHeight + 10;
      }

      // Traffic Sources Chart
      if (settings.showTrafficSources) {
        checkNewPage(settings.chartHeight + 20);
        pdf.setFontSize(settings.headingFontSize);
        pdf.setFont(settings.fontFamily, "bold");
        pdf.setTextColor(primaryRgb.r, primaryRgb.g, primaryRgb.b);
        pdf.text("TRAFFIC SOURCES", margin, yPos);
        yPos += 8;

        // Use wider chart for traffic sources to accommodate 2-column legend
        const trafficPieChartWidth =
          analyticsData.trafficSources.length > 4
            ? Math.max(settings.pieChartWidth, 3.5) // Ensure enough width for 2 columns
            : settings.pieChartWidth;
        const trafficChartImg = generatePieChartImage(
          analyticsData.trafficSources,
          700,
          400,
          "visitors",
          settings.barChartColors,
          trafficPieChartWidth
        );
        // Pie chart canvas dimensions:
        // pieChartSize = min(700, 400) = 400
        // chartWidth = 400 * pieChartWidth, chartHeight = 400
        // Aspect ratio = pieChartWidth
        const trafficChartPdfWidth = pageWidth - 2 * margin;
        const trafficChartPdfHeight =
          trafficChartPdfWidth / trafficPieChartWidth;
        pdf.addImage(
          trafficChartImg,
          "PNG",
          margin,
          yPos,
          trafficChartPdfWidth,
          trafficChartPdfHeight
        );
        yPos += trafficChartPdfHeight + 10;
      }

      // Top Countries Chart
      if (settings.showCountries) {
        checkNewPage(settings.chartHeight + 20);
        pdf.setFontSize(settings.headingFontSize);
        pdf.setFont(settings.fontFamily, "bold");
        pdf.setTextColor(primaryRgb.r, primaryRgb.g, primaryRgb.b);
        pdf.text("TOP COUNTRIES", margin, yPos);
        yPos += 8;

        const countriesChartImg = generateBarChartImage(
          analyticsData.countries,
          700,
          settings.chartHeight * 5,
          "code",
          "visitors",
          settings.barChartColors
        );
        // Calculate aspect ratio: chart is generated at 700 wide, chartHeight*5 tall
        const countriesBarChartAspectRatio = 700 / (settings.chartHeight * 5);
        const countriesChartWidth = pageWidth - 2 * margin;
        const countriesChartHeight =
          countriesChartWidth / countriesBarChartAspectRatio;
        pdf.addImage(
          countriesChartImg,
          "PNG",
          margin,
          yPos,
          countriesChartWidth,
          countriesChartHeight
        );
        yPos += countriesChartHeight + 10;
      }

      // Device Breakdown Chart
      if (settings.showDevices) {
        checkNewPage(settings.chartHeight + 20);
        pdf.setFontSize(settings.headingFontSize);
        pdf.setFont(settings.fontFamily, "bold");
        pdf.setTextColor(primaryRgb.r, primaryRgb.g, primaryRgb.b);
        pdf.text("DEVICE BREAKDOWN", margin, yPos);
        yPos += 8;

        const devicesChartImg = generatePieChartImage(
          analyticsData.devices,
          700,
          400,
          "visitors",
          settings.barChartColors,
          settings.pieChartWidth
        );
        // Pie chart canvas dimensions:
        // pieChartSize = min(700, 400) = 400
        // chartWidth = 400 * pieChartWidth, chartHeight = 400
        // Aspect ratio = pieChartWidth
        const devicesChartWidth = pageWidth - 2 * margin;
        const devicesChartHeight = devicesChartWidth / settings.pieChartWidth;
        pdf.addImage(
          devicesChartImg,
          "PNG",
          margin,
          yPos,
          devicesChartWidth,
          devicesChartHeight
        );
        yPos += devicesChartHeight + 10;
      }

      // Operating Systems Chart
      if (settings.showOS) {
        checkNewPage(settings.chartHeight + 20);
        pdf.setFontSize(settings.headingFontSize);
        pdf.setFont(settings.fontFamily, "bold");
        pdf.setTextColor(primaryRgb.r, primaryRgb.g, primaryRgb.b);
        pdf.text("OPERATING SYSTEMS", margin, yPos);
        yPos += 8;

        const osChartImg = generatePieChartImage(
          analyticsData.operatingSystems.map((os) => ({
            name: os.name,
            visitors: os.percentage,
          })),
          700,
          400,
          "visitors",
          settings.barChartColors,
          settings.pieChartWidth
        );
        // Pie chart canvas dimensions:
        // pieChartSize = min(700, 400) = 400
        // chartWidth = 400 * pieChartWidth, chartHeight = 400
        // Aspect ratio = pieChartWidth
        const osChartWidth = pageWidth - 2 * margin;
        const osChartHeight = osChartWidth / settings.pieChartWidth;
        pdf.addImage(
          osChartImg,
          "PNG",
          margin,
          yPos,
          osChartWidth,
          osChartHeight
        );
        yPos += osChartHeight + 10;
      }

      // Content Highlights
      checkNewPage(40);
      pdf.setFontSize(12);
      pdf.setFont("helvetica", "bold");
      pdf.text("CONTENT HIGHLIGHTS", margin, yPos);
      yPos += 8;
      pdf.setFontSize(10);
      pdf.setFont("helvetica", "normal");
      const titleLines = pdf.splitTextToSize(
        analyticsData.blogPost.title,
        pageWidth - 2 * margin
      );
      titleLines.forEach((line) => {
        checkNewPage(6);
        pdf.text(line, margin, yPos);
        yPos += 6;
      });
      yPos += 3;
      pdf.setFontSize(9);
      pdf.text(
        `Lifetime Views: ${analyticsData.blogPost.lifetimeViews.toLocaleString()}`,
        margin,
        yPos
      );
      yPos += 10;

      // Key Insights
      checkNewPage(50);
      pdf.setFontSize(12);
      pdf.setFont("helvetica", "bold");
      pdf.text("KEY INSIGHTS", margin, yPos);
      yPos += 8;
      pdf.setFontSize(9);
      pdf.setFont("helvetica", "normal");
      const insights = [
        "The high traffic to the /team and /careers pages correlates strongly with the 74 resumes received, indicating high intent among job seekers.",
        "Your audience is highly concentrated in the UAE and Singapore, suggesting strong international investor interest.",
        "A staggering majority of users (77.8%) access the site via desktop, typical for high-value real estate research and job applications.",
      ];
      insights.forEach((insight) => {
        const lines = pdf.splitTextToSize(
          `• ${insight}`,
          pageWidth - 2 * margin - 5
        );
        lines.forEach((line) => {
          checkNewPage(6);
          pdf.text(line, margin, yPos);
          yPos += 6;
        });
        yPos += 3;
      });

      console.log("Saving PDF...");
      pdf.save(`USH-Report-${startDate}-to-${endDate}.pdf`);
      console.log("PDF export completed successfully");
    } catch (error) {
      console.error("Error exporting PDF:", error);
      console.error("Error details:", error.message, error.stack);
      alert(
        `Failed to export PDF: ${error.message}. Check console for details.`
      );
    }
  };

  const handleExportWord = async () => {
    try {
      console.log("Word export button clicked");

      console.log("Creating Word document...");
      const children = [];

      // Title
      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: "Union Square House",
              bold: true,
              size: 28,
              color: "000000",
            }),
          ],
          alignment: AlignmentType.CENTER,
          spacing: { after: 200 },
        })
      );

      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: "Performance Dashboard",
              bold: true,
              size: 24,
              color: "000000",
            }),
          ],
          alignment: AlignmentType.CENTER,
          spacing: { after: 400 },
        })
      );

      // Report Period
      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: `Reporting Period: ${format(
                parseISO(startDate),
                "MMM dd, yyyy"
              )} – ${format(parseISO(endDate), "MMM dd, yyyy")}`,
              size: 20,
              color: "666666",
            }),
          ],
          alignment: AlignmentType.CENTER,
          spacing: { after: 600 },
        })
      );

      // Key Metrics Table
      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: "KEY METRICS",
              bold: true,
              size: 22,
              color: "000000",
            }),
          ],
          spacing: { after: 300 },
        })
      );

      const metricsTable = new Table({
        width: {
          size: 100,
          type: WidthType.PERCENTAGE,
        },
        rows: [
          new TableRow({
            children: [
              new TableCell({
                children: [
                  new Paragraph({
                    children: [
                      new TextRun({
                        text: "Total Visitors",
                        size: 18,
                        color: "000000",
                      }),
                    ],
                  }),
                  new Paragraph({
                    children: [
                      new TextRun({
                        text: analyticsData.metrics.totalVisitors.toLocaleString(),
                        bold: true,
                        size: 24,
                        color: "000000",
                      }),
                    ],
                  }),
                ],
                width: { size: 20, type: WidthType.PERCENTAGE },
              }),
              new TableCell({
                children: [
                  new Paragraph({
                    children: [
                      new TextRun({
                        text: "Total Page Views",
                        size: 18,
                        color: "000000",
                      }),
                    ],
                  }),
                  new Paragraph({
                    children: [
                      new TextRun({
                        text: analyticsData.metrics.totalPageViews.toLocaleString(),
                        bold: true,
                        size: 24,
                        color: "000000",
                      }),
                    ],
                  }),
                ],
                width: { size: 20, type: WidthType.PERCENTAGE },
              }),
              new TableCell({
                children: [
                  new Paragraph({
                    children: [
                      new TextRun({
                        text: "Resumes Received",
                        size: 18,
                        color: "000000",
                      }),
                    ],
                  }),
                  new Paragraph({
                    children: [
                      new TextRun({
                        text: analyticsData.metrics.resumesReceived.toLocaleString(),
                        bold: true,
                        size: 24,
                        color: "000000",
                      }),
                    ],
                  }),
                ],
                width: { size: 20, type: WidthType.PERCENTAGE },
              }),
              new TableCell({
                children: [
                  new Paragraph({
                    children: [
                      new TextRun({
                        text: "Leads to Bitrix",
                        size: 18,
                        color: "000000",
                      }),
                    ],
                  }),
                  new Paragraph({
                    children: [
                      new TextRun({
                        text: analyticsData.metrics.leadsToBitrix.toLocaleString(),
                        bold: true,
                        size: 24,
                        color: "000000",
                      }),
                    ],
                  }),
                ],
                width: { size: 20, type: WidthType.PERCENTAGE },
              }),
              new TableCell({
                children: [
                  new Paragraph({
                    children: [
                      new TextRun({
                        text: "Conversion Rate",
                        size: 18,
                        color: "000000",
                      }),
                    ],
                  }),
                  new Paragraph({
                    children: [
                      new TextRun({
                        text: `${analyticsData.metrics.conversionRate}%`,
                        bold: true,
                        size: 24,
                        color: "000000",
                      }),
                    ],
                  }),
                ],
                width: { size: 20, type: WidthType.PERCENTAGE },
              }),
            ],
          }),
        ],
      });
      children.push(metricsTable);
      children.push(
        new Paragraph({
          spacing: { after: 400 },
        })
      );

      // Top Performing Pages Chart
      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: "TOP PERFORMING PAGES",
              bold: true,
              size: 22,
              color: "000000",
            }),
          ],
          spacing: { after: 300 },
        })
      );

      const topPagesChartImg = generateBarChartImage(
        analyticsData.topPages,
        600,
        300,
        "name",
        "visitors",
        COLORS
      );
      const topPagesBase64 = topPagesChartImg.split(",")[1];
      const topPagesBuffer = Uint8Array.from(atob(topPagesBase64), (c) =>
        c.charCodeAt(0)
      );
      children.push(
        new Paragraph({
          children: [
            new ImageRun({
              data: topPagesBuffer,
              transformation: {
                width: 5000000,
                height: 2500000,
              },
            }),
          ],
          alignment: AlignmentType.CENTER,
          spacing: { after: 400 },
        })
      );

      // Traffic Sources Chart
      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: "TRAFFIC SOURCES",
              bold: true,
              size: 22,
              color: "000000",
            }),
          ],
          spacing: { after: 300 },
        })
      );

      const trafficChartImg = generatePieChartImage(
        analyticsData.trafficSources,
        700,
        400,
        "visitors",
        COLORS
      );
      const trafficBase64 = trafficChartImg.split(",")[1];
      const trafficBuffer = Uint8Array.from(atob(trafficBase64), (c) =>
        c.charCodeAt(0)
      );
      children.push(
        new Paragraph({
          children: [
            new ImageRun({
              data: trafficBuffer,
              transformation: {
                width: 4000000,
                height: 3000000,
              },
            }),
          ],
          alignment: AlignmentType.CENTER,
          spacing: { after: 400 },
        })
      );

      // Top Countries Chart
      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: "TOP COUNTRIES",
              bold: true,
              size: 22,
              color: "000000",
            }),
          ],
          spacing: { after: 300 },
        })
      );

      const countriesChartImg = generateBarChartImage(
        analyticsData.countries,
        700,
        400,
        "code",
        "visitors",
        COLORS
      );
      const countriesBase64 = countriesChartImg.split(",")[1];
      const countriesBuffer = Uint8Array.from(atob(countriesBase64), (c) =>
        c.charCodeAt(0)
      );
      children.push(
        new Paragraph({
          children: [
            new ImageRun({
              data: countriesBuffer,
              transformation: {
                width: 5000000,
                height: 2500000,
              },
            }),
          ],
          alignment: AlignmentType.CENTER,
          spacing: { after: 400 },
        })
      );

      // Device Breakdown Chart
      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: "DEVICE BREAKDOWN",
              bold: true,
              size: 22,
              color: "000000",
            }),
          ],
          spacing: { after: 300 },
        })
      );

      const devicesChartImg = generatePieChartImage(
        analyticsData.devices,
        700,
        400,
        "visitors",
        COLORS
      );
      const devicesBase64 = devicesChartImg.split(",")[1];
      const devicesBuffer = Uint8Array.from(atob(devicesBase64), (c) =>
        c.charCodeAt(0)
      );
      children.push(
        new Paragraph({
          children: [
            new ImageRun({
              data: devicesBuffer,
              transformation: {
                width: 4000000,
                height: 3000000,
              },
            }),
          ],
          alignment: AlignmentType.CENTER,
          spacing: { after: 400 },
        })
      );

      // Operating Systems Chart
      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: "OPERATING SYSTEMS",
              bold: true,
              size: 22,
              color: "000000",
            }),
          ],
          spacing: { after: 300 },
        })
      );

      const osChartImg = generateBarChartImage(
        analyticsData.operatingSystems,
        700,
        400,
        "name",
        "percentage",
        COLORS
      );
      const osBase64 = osChartImg.split(",")[1];
      const osBuffer = Uint8Array.from(atob(osBase64), (c) => c.charCodeAt(0));
      children.push(
        new Paragraph({
          children: [
            new ImageRun({
              data: osBuffer,
              transformation: {
                width: 5000000,
                height: 2500000,
              },
            }),
          ],
          alignment: AlignmentType.CENTER,
          spacing: { after: 400 },
        })
      );

      // Content Highlights
      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: "CONTENT HIGHLIGHTS",
              bold: true,
              size: 22,
              color: "000000",
            }),
          ],
          spacing: { after: 300 },
        })
      );

      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: analyticsData.blogPost.title,
              bold: true,
              size: 20,
              color: "000000",
            }),
          ],
          spacing: { after: 200 },
        })
      );

      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: `Lifetime Views: ${analyticsData.blogPost.lifetimeViews.toLocaleString()}`,
              size: 18,
              color: "000000",
            }),
          ],
          spacing: { after: 400 },
        })
      );

      // Key Insights
      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: "KEY INSIGHTS",
              bold: true,
              size: 22,
              color: "000000",
            }),
          ],
          spacing: { after: 300 },
        })
      );

      const insights = [
        "The high traffic to the /team and /careers pages correlates strongly with the 74 resumes received, indicating high intent among job seekers.",
        "Your audience is highly concentrated in the UAE and Singapore, suggesting strong international investor interest.",
        "A staggering majority of users (77.8%) access the site via desktop, typical for high-value real estate research and job applications.",
      ];

      insights.forEach((insight) => {
        children.push(
          new Paragraph({
            children: [
              new TextRun({
                text: `• ${insight}`,
                size: 18,
                color: "000000",
              }),
            ],
            spacing: { after: 300 },
          })
        );
      });

      const doc = new Document({
        sections: [
          {
            properties: {
              page: {
                size: {
                  orientation: "portrait",
                  width: 12240, // A4 width in twips
                  height: 15840, // A4 height in twips
                },
                margins: {
                  top: 1440, // 1 inch
                  right: 1440,
                  bottom: 1440,
                  left: 1440,
                },
              },
            },
            children,
          },
        ],
      });

      console.log("Creating Word document blob...");
      try {
        const blob = await Packer.toBlob(doc);
        console.log("Blob created, size:", blob.size);

        if (!blob || blob.size === 0) {
          throw new Error("Generated blob is empty");
        }

        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `USH-Report-${startDate}-to-${endDate}.docx`;
        link.style.display = "none";
        document.body.appendChild(link);
        console.log("Triggering download...");
        link.click();
        setTimeout(() => {
          document.body.removeChild(link);
          URL.revokeObjectURL(url);
          console.log("Word export completed successfully");
        }, 100);
      } catch (packError) {
        console.error("Error creating blob:", packError);
        throw packError;
      }
    } catch (error) {
      console.error("Error exporting Word document:", error);
      console.error("Error details:", error.message);
      console.error("Error stack:", error.stack);
      alert(
        `Failed to export Word document: ${error.message}\n\nPlease check the browser console (F12) for more details.`
      );
    }
  };

  return (
    <div
      className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/20 relative overflow-hidden"
      style={{
        background:
          "linear-gradient(to bottom right, #f8fafc, rgba(239, 246, 255, 0.3), rgba(250, 245, 255, 0.2))",
      }}
    >
      {/* Liquid glass animated background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-blue-200/40 to-purple-200/30 rounded-full liquid-blob"></div>
        <div
          className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-br from-purple-200/40 to-pink-200/30 rounded-full liquid-blob"
          style={{ animationDelay: "5s" }}
        ></div>
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-br from-cyan-200/20 to-blue-200/20 rounded-full liquid-blob"
          style={{ animationDelay: "10s" }}
        ></div>
        <div
          className="absolute top-1/4 right-1/4 w-80 h-80 bg-gradient-to-br from-indigo-200/30 to-purple-200/20 rounded-full liquid-blob"
          style={{ animationDelay: "15s" }}
        ></div>
      </div>

      {/* Header with Filters and Export */}
      <div className="glass sticky top-0 z-50 border-b border-white/30 shadow-2xl backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 ">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 sm:gap-6">
            <div className="flex items-center gap-3 sm:gap-5">
              <Image
                src="/ush-logo.jpeg"
                alt="Union Square House Logo"
                width={120}
                height={120}
                className="object-contain w-16 h-16 sm:w-24 sm:h-24 lg:w-[120px] lg:h-[120px]"
                priority
              />
              <div className="border-l-2 border-gray-300 pl-3 sm:pl-5">
                <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-black tracking-tight">
                  Performance Dashboard
                </h1>
                <p className="text-xs sm:text-sm text-gray-600 mt-0.5 font-medium">
                  Union Square House
                </p>
              </div>
            </div>

            <div className="hidden md:flex gap-2 w-full sm:w-auto">
              {/* Export Button - Desktop Only */}
              <button
                onClick={handleExportPDF}
                className="px-6 py-3.5 sm:px-5 sm:py-2.5 bg-black/80 cursor-pointer backdrop-blur-md text-white rounded-2xl sm:rounded-xl hover:bg-black/90 active:scale-95 sm:active:scale-100 transition-all flex items-center justify-center gap-2 font-semibold text-sm sm:text-sm shadow-2xl flex-1 sm:flex-initial touch-manipulation"
              >
                Export PDF
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Report Content */}
      <div
        ref={reportRef}
        className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-10 py-6 sm:py-8 lg:py-10 pb-24 md:pb-10 relative z-10"
      >
        {/* Report Period */}
        <div className="mb-10 sm:mb-12 text-center relative z-10">
          <div className="inline-block px-6 sm:px-6 lg:px-8 py-4 sm:py-4 glass-card border border-white/50 rounded-3xl sm:rounded-3xl shadow-lg sm:hover:shadow-xl transition-shadow">
            <p className="text-base sm:text-base text-gray-700 font-medium">
              Reporting Period:{" "}
              <span className="font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent block sm:inline">
                {format(parseISO(startDate), "MMM dd, yyyy")} –{" "}
                {format(parseISO(endDate), "MMM dd, yyyy")}
              </span>
            </p>
          </div>
        </div>

        {/* Key Metrics Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4 lg:gap-6 mb-10 sm:mb-12 relative z-10">
          {[
            {
              label: "Total Visitors",
              value: analyticsData.metrics.totalVisitors,
              gradient: "from-blue-500/10 to-cyan-500/10",
              borderColor: "border-blue-200/50",
            },
            {
              label: "Total Page Views",
              value: analyticsData.metrics.totalPageViews,
              gradient: "from-purple-500/10 to-pink-500/10",
              borderColor: "border-purple-200/50",
            },
            {
              label: "Resumes Received",
              value: analyticsData.metrics.resumesReceived,
              gradient: "from-green-500/10 to-emerald-500/10",
              borderColor: "border-green-200/50",
            },
            {
              label: "Leads to Bitrix",
              value: analyticsData.metrics.leadsToBitrix,
              gradient: "from-teal-500/10 to-cyan-500/10",
              borderColor: "border-teal-200/50",
            },
            {
              label: "Conversion Rate",
              value: `${analyticsData.metrics.conversionRate}%`,
              gradient: "from-orange-500/10 to-amber-500/10",
              borderColor: "border-orange-200/50",
            },
          ].map((metric, index) => (
            <div
              key={index}
              className={`glass-card border ${metric.borderColor} p-3 sm:p-5 lg:p-7 rounded-2xl sm:rounded-3xl transition-all duration-300 active:scale-95 sm:active:scale-100 sm:hover:shadow-2xl sm:hover:scale-[1.02] sm:hover:border-white/60 bg-gradient-to-br ${metric.gradient} touch-manipulation`}
            >
              <h3 className="text-[10px] sm:text-xs font-semibold text-gray-600 mb-2 sm:mb-4 uppercase tracking-wider">
                {metric.label}
              </h3>
              <p className="text-2xl sm:text-3xl lg:text-5xl font-bold leading-tight bg-gradient-to-br from-gray-900 to-gray-700 bg-clip-text text-transparent">
                {typeof metric.value === "number"
                  ? metric.value.toLocaleString()
                  : metric.value}
              </p>
            </div>
          ))}
        </div>

        {/* Section 1: Top Performing Pages */}
        <div className="mb-10 sm:mb-10 relative z-10">
          <div className="mb-6 sm:mb-7 pb-4 sm:pb-5 border-b border-gray-200/50">
            <h2 className="text-xl sm:text-xl font-bold text-black uppercase tracking-wider flex items-center gap-3 sm:gap-3">
              <span className="w-1.5 h-8 sm:h-8 bg-gradient-to-b from-blue-500 to-cyan-500 rounded-full"></span>
              Top Performing Pages
            </h2>
          </div>
          <div className="glass-card border border-white/40 rounded-3xl sm:rounded-3xl p-5 sm:p-4 lg:p-6 bg-gradient-to-br from-blue-50/50 to-cyan-50/30">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={analyticsData.topPages}
                layout="vertical"
                margin={{
                  top: 20,
                  right: 10,
                  left: isMobile ? 0 : 70,
                  bottom: 20,
                }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#e5e7eb"
                  horizontal={true}
                  vertical={false}
                />
                <XAxis
                  type="number"
                  stroke="#4a4a4a"
                  tick={{ fontSize: 11, fill: "#666" }}
                />
                <YAxis
                  dataKey="name"
                  type="category"
                  width={isMobile ? 40 : 60}
                  stroke="#4a4a4a"
                  tick={{ fontSize: isMobile ? 8 : 9, fill: "#666" }}
                />
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      const entry = payload[0];
                      const dataIndex = analyticsData.topPages.findIndex(
                        (item) => item.name === label
                      );
                      const color = COLORS[dataIndex % COLORS.length];
                      return (
                        <div className="glass-card border border-white/50 p-4 rounded-xl shadow-2xl backdrop-blur-xl">
                          <p className="font-bold text-black mb-2 text-base border-b border-gray-200/50 pb-2">
                            {label}
                          </p>
                          <p className="text-sm text-black flex items-center gap-2">
                            <span
                              className="w-3 h-3 rounded-sm"
                              style={{ backgroundColor: color }}
                            ></span>
                            <span className="font-semibold">{entry.name}:</span>{" "}
                            <span className="font-bold">
                              {typeof entry.value === "number"
                                ? entry.value.toLocaleString()
                                : entry.value}
                            </span>
                          </p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Legend
                  wrapperStyle={{ paddingTop: "20px" }}
                  iconType="square"
                  iconSize={12}
                  formatter={(value) => (
                    <span style={{ color: "#4a4a4a", fontWeight: 500 }}>
                      {value}
                    </span>
                  )}
                />
                <Bar dataKey="visitors" name="Visitors" radius={[0, 8, 8, 0]}>
                  {analyticsData.topPages.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Section 2: Traffic Sources & Countries */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-6 lg:gap-8 mb-10 sm:mb-10 relative z-10">
          <div>
            <div className="mb-6 sm:mb-7 pb-4 sm:pb-5 border-b border-gray-200/50">
              <h2 className="text-xl sm:text-xl font-bold text-black uppercase tracking-wider flex items-center gap-3 sm:gap-3">
                <span className="w-1.5 h-8 sm:h-8 bg-gradient-to-b from-purple-500 to-pink-500 rounded-full"></span>
                Traffic Sources
              </h2>
            </div>
            <div className="glass-card border border-white/40 rounded-3xl sm:rounded-3xl p-5 sm:p-4 lg:p-6 bg-gradient-to-br from-purple-50/50 to-pink-50/30">
              <ResponsiveContainer width="100%" height={isMobile ? 250 : 300}>
                <PieChart>
                  <Pie
                    data={analyticsData.trafficSources}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={
                      !isMobile
                        ? ({ name, percent }) =>
                            `${name}: ${(percent * 100).toFixed(0)}%`
                        : false
                    }
                    outerRadius={isMobile ? 80 : 110}
                    fill="#000000"
                    dataKey="visitors"
                  >
                    {reportData.trafficSources.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                        stroke="#fff"
                        strokeWidth={2}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const entry = payload[0];
                        const dataIndex =
                          analyticsData.trafficSources.findIndex(
                            (item) => item.name === entry.name
                          );
                        const color = COLORS[dataIndex % COLORS.length];
                        return (
                          <div className="glass-card border border-white/50 p-4 rounded-xl shadow-2xl backdrop-blur-xl">
                            <p className="font-bold text-black mb-2 text-base border-b border-gray-200/50 pb-2">
                              {entry.name}
                            </p>
                            <p className="text-sm text-black flex items-center gap-2">
                              <span
                                className="w-3 h-3 rounded-sm"
                                style={{ backgroundColor: color }}
                              ></span>
                              <span className="font-semibold">Visitors:</span>{" "}
                              <span className="font-bold">
                                {typeof entry.value === "number"
                                  ? entry.value.toLocaleString()
                                  : entry.value}
                              </span>
                            </p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Legend
                    wrapperStyle={{ paddingTop: "20px" }}
                    iconType="square"
                    iconSize={12}
                    formatter={(value) => (
                      <span style={{ color: "#4a4a4a", fontWeight: 500 }}>
                        {value}
                      </span>
                    )}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-5 sm:mt-6 pt-5 sm:pt-5 border-t border-gray-200/50 grid grid-cols-2 sm:grid-cols-1 gap-3 sm:space-y-3">
              {analyticsData.trafficSources.map((source, index) => (
                <div
                  key={index}
                  className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 sm:gap-0 py-3 px-3 sm:px-3 rounded-xl sm:rounded-lg sm:hover:bg-white/30 active:bg-white/40 sm:active:bg-white/30 transition-colors touch-manipulation"
                >
                  <div className="flex items-center gap-2 sm:gap-3">
                    <div
                      className="w-4 h-4 sm:w-4 sm:h-4 rounded-sm border-2 border-gray-300 shadow-sm shrink-0"
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                    />
                    <span className="text-sm sm:text-sm text-gray-700 font-semibold">
                      {source.name}
                    </span>
                  </div>
                  <span className="text-sm sm:text-sm font-bold text-black bg-white/40 px-2 sm:px-3 py-1.5 sm:py-1 rounded-lg sm:rounded-md self-start sm:self-auto">
                    {source.visitors.toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div>
            <div className="mb-6 sm:mb-7 pb-4 sm:pb-5 border-b border-gray-200/50">
              <h2 className="text-xl sm:text-xl font-bold text-black uppercase tracking-wider flex items-center gap-3 sm:gap-3">
                <span className="w-1.5 h-8 sm:h-8 bg-gradient-to-b from-green-500 to-emerald-500 rounded-full"></span>
                Top Countries
              </h2>
            </div>
            <div className="glass-card border border-white/40 rounded-3xl sm:rounded-3xl p-5 sm:p-4 lg:p-6 bg-gradient-to-br from-green-50/50 to-emerald-50/30">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart
                  data={analyticsData.countries}
                  layout="vertical"
                  margin={{
                    top: 20,
                    right: 30,
                    left: isMobile ? 0 : 20,
                    bottom: 20,
                  }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="#e5e7eb"
                    horizontal={true}
                    vertical={false}
                  />
                  <XAxis
                    type="number"
                    stroke="#4a4a4a"
                    tick={{ fontSize: 11, fill: "#666" }}
                  />
                  <YAxis
                    dataKey="code"
                    type="category"
                    width={isMobile ? 30 : 70}
                    stroke="#4a4a4a"
                    tick={{ fontSize: isMobile ? 9 : 11, fill: "#666" }}
                  />
                  <Tooltip
                    content={({ active, payload, label }) => {
                      if (active && payload && payload.length) {
                        const countryIndex = analyticsData.countries.findIndex(
                          (c) => c.code === label
                        );
                        return (
                          <div className="glass-card border border-white/50 p-4 rounded-xl shadow-2xl backdrop-blur-xl">
                            <p className="font-bold text-black mb-2 text-base border-b border-gray-200/50 pb-2">
                              {analyticsData.countries[countryIndex]?.country ||
                                label}
                            </p>
                            {payload.map((entry, index) => {
                              const color =
                                entry.dataKey === "visitors"
                                  ? COLORS[countryIndex % COLORS.length]
                                  : COLORS[(countryIndex + 3) % COLORS.length];
                              return (
                                <p
                                  key={index}
                                  className="text-sm text-black flex items-center gap-2"
                                >
                                  <span
                                    className="w-3 h-3 rounded-sm"
                                    style={{ backgroundColor: color }}
                                  ></span>
                                  <span className="font-semibold">
                                    {entry.name}:
                                  </span>{" "}
                                  <span className="font-bold">
                                    {typeof entry.value === "number"
                                      ? entry.value.toLocaleString()
                                      : entry.value}
                                  </span>
                                </p>
                              );
                            })}
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Legend
                    wrapperStyle={{ paddingTop: "20px" }}
                    iconType="square"
                    iconSize={12}
                    formatter={(value, entry) => {
                      const color =
                        value === "Visitors" ? COLORS[0] : COLORS[3];
                      return (
                        <span style={{ color: "#4a4a4a", fontWeight: 500 }}>
                          {value}
                        </span>
                      );
                    }}
                    content={({ payload }) => {
                      return (
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "center",
                            gap: "20px",
                            paddingTop: "20px",
                          }}
                        >
                          {payload?.map((entry, index) => {
                            const color =
                              entry.dataKey === "visitors"
                                ? COLORS[0]
                                : COLORS[3];
                            return (
                              <div
                                key={index}
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: "8px",
                                }}
                              >
                                <div
                                  style={{
                                    width: "12px",
                                    height: "12px",
                                    backgroundColor: color,
                                    border: "2px solid #d1d5db",
                                    borderRadius: "2px",
                                  }}
                                />
                                <span
                                  style={{ color: "#4a4a4a", fontWeight: 500 }}
                                >
                                  {entry.value}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      );
                    }}
                  />
                  <Bar dataKey="visitors" name="Visitors" radius={[4, 0, 0, 4]}>
                    {analyticsData.countries.map((entry, index) => (
                      <Cell
                        key={`visitors-cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Bar>
                  <Bar dataKey="views" name="Views" radius={[4, 0, 0, 4]}>
                    {analyticsData.countries.map((entry, index) => (
                      <Cell
                        key={`views-cell-${index}`}
                        fill={COLORS[(index + 3) % COLORS.length]}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Section 3: Device Breakdown & OS */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-6 lg:gap-8 mb-10 sm:mb-10 relative z-10">
          <div>
            <div className="mb-6 sm:mb-7 pb-4 sm:pb-5 border-b border-gray-200/50">
              <h2 className="text-xl sm:text-xl font-bold text-black uppercase tracking-wider flex items-center gap-3 sm:gap-3">
                <span className="w-1.5 h-8 sm:h-8 bg-gradient-to-b from-indigo-500 to-blue-500 rounded-full"></span>
                Device Breakdown
              </h2>
            </div>
            <div className="glass-card border border-white/40 rounded-3xl sm:rounded-3xl p-5 sm:p-4 lg:p-6 bg-gradient-to-br from-indigo-50/50 to-blue-50/30">
              <ResponsiveContainer width="100%" height={isMobile ? 250 : 280}>
                <PieChart>
                  <Pie
                    data={analyticsData.devices}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={
                      !isMobile
                        ? ({ name, percentage }) => `${name}: ${percentage}%`
                        : false
                    }
                    outerRadius={isMobile ? 80 : 100}
                    fill="#000000"
                    dataKey="visitors"
                  >
                    {reportData.devices.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                        stroke="#fff"
                        strokeWidth={2}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const entry = payload[0];
                        // For PieChart, the name might be in entry.payload.name or entry.name
                        const deviceName = entry.payload?.name || entry.name;
                        const dataIndex = analyticsData.devices.findIndex(
                          (item) => item.name === deviceName
                        );
                        const color =
                          dataIndex >= 0
                            ? COLORS[dataIndex % COLORS.length]
                            : COLORS[0];
                        const deviceData =
                          analyticsData.devices[dataIndex] ||
                          analyticsData.devices[0];
                        return (
                          <div className="glass-card border border-white/50 p-4 rounded-xl shadow-2xl backdrop-blur-xl">
                            <p className="font-bold text-black mb-2 text-base border-b border-gray-200/50 pb-2">
                              {deviceName}
                            </p>
                            <p className="text-sm text-black flex items-center gap-2">
                              <span
                                className="w-3 h-3 rounded-sm"
                                style={{ backgroundColor: color }}
                              ></span>
                              <span className="font-semibold">Visitors:</span>{" "}
                              <span className="font-bold">
                                {typeof entry.value === "number"
                                  ? entry.value.toLocaleString()
                                  : entry.value}
                              </span>
                            </p>
                            <p className="text-sm text-black flex items-center gap-2 mt-1">
                              <span
                                className="w-3 h-3 rounded-sm"
                                style={{ backgroundColor: color }}
                              ></span>
                              <span className="font-semibold">Percentage:</span>{" "}
                              <span className="font-bold">
                                {deviceData?.percentage}%
                              </span>
                            </p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Legend
                    wrapperStyle={{ paddingTop: "20px" }}
                    iconType="square"
                    iconSize={12}
                    formatter={(value) => (
                      <span style={{ color: "#4a4a4a", fontWeight: 500 }}>
                        {value}
                      </span>
                    )}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-5 sm:mt-6 pt-5 sm:pt-5 border-t border-gray-200/50 grid grid-cols-2 sm:grid-cols-1 gap-3 sm:space-y-3">
              {analyticsData.devices.map((device, index) => (
                <div
                  key={index}
                  className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 sm:gap-0 py-3 sm:py-3 px-3 sm:px-3 rounded-xl sm:rounded-lg sm:hover:bg-white/30 active:bg-white/40 sm:active:bg-white/30 transition-colors border-b border-gray-100/50 last:border-0 touch-manipulation"
                >
                  <div className="flex items-center gap-2 sm:gap-3">
                    <div
                      className="w-4 h-4 sm:w-4 sm:h-4 rounded-sm border-2 border-gray-300 shadow-sm shrink-0"
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                    />
                    <span className="text-sm sm:text-sm text-gray-700 font-semibold">
                      {device.name}
                    </span>
                  </div>
                  <div className="text-left sm:text-right">
                    <span className="text-sm sm:text-sm font-bold text-black block mb-1 sm:mb-1">
                      {device.visitors.toLocaleString()}
                    </span>
                    <span className="text-xs text-gray-500 bg-white/40 px-2 py-1 sm:px-2 sm:py-0.5 rounded-lg sm:rounded inline-block">
                      {device.percentage}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <div className="mb-6 sm:mb-7 pb-4 sm:pb-5 border-b border-gray-200/50">
              <h2 className="text-xl sm:text-xl font-bold text-black uppercase tracking-wider flex items-center gap-3 sm:gap-3">
                <span className="w-1.5 h-8 sm:h-8 bg-gradient-to-b from-orange-500 to-amber-500 rounded-full"></span>
                Operating Systems
              </h2>
            </div>
            <div className="glass-card border border-white/40 rounded-3xl sm:rounded-3xl p-5 sm:p-4 lg:p-6 bg-gradient-to-br from-orange-50/50 to-amber-50/30">
              <ResponsiveContainer width="100%" height={isMobile ? 300 : 400}>
                <BarChart
                  data={analyticsData.operatingSystems}
                  margin={{
                    top: 20,
                    right: 30,
                    left: isMobile ? 10 : 20,
                    bottom: 20,
                  }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="#e5e7eb"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="name"
                    stroke="#4a4a4a"
                    tick={{ fontSize: isMobile ? 9 : 11, fill: "#666" }}
                    angle={isMobile ? -45 : 0}
                    textAnchor={isMobile ? "end" : "middle"}
                    height={isMobile ? 60 : 30}
                  />
                  <YAxis
                    stroke="#4a4a4a"
                    tick={{ fontSize: isMobile ? 9 : 11, fill: "#666" }}
                    width={isMobile ? 35 : 50}
                  />
                  <Tooltip
                    content={({ active, payload, label }) => {
                      if (active && payload && payload.length) {
                        const entry = payload[0];
                        const dataIndex =
                          analyticsData.operatingSystems.findIndex(
                            (item) => item.name === label
                          );
                        const color = COLORS[dataIndex % COLORS.length];
                        return (
                          <div className="glass-card border border-white/50 p-4 rounded-xl shadow-2xl backdrop-blur-xl">
                            <p className="font-bold text-black mb-2 text-base border-b border-gray-200/50 pb-2">
                              {label}
                            </p>
                            <p className="text-sm text-black flex items-center gap-2">
                              <span
                                className="w-3 h-3 rounded-sm"
                                style={{ backgroundColor: color }}
                              ></span>
                              <span className="font-semibold">
                                {entry.name}:
                              </span>{" "}
                              <span className="font-bold">
                                {typeof entry.value === "number"
                                  ? entry.value.toLocaleString()
                                  : entry.value}
                                %
                              </span>
                            </p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Legend
                    wrapperStyle={{ paddingTop: "20px" }}
                    iconType="square"
                  />
                  <Bar
                    dataKey="percentage"
                    name="Percentage (%)"
                    radius={[8, 8, 0, 0]}
                  >
                    {analyticsData.operatingSystems.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Section 4: Content Highlights */}
        <div className="mb-10 sm:mb-10 relative z-10">
          <div className="mb-6 sm:mb-7 pb-4 sm:pb-5 border-b border-gray-200/50">
            <h2 className="text-xl sm:text-xl font-bold text-black uppercase tracking-wider flex items-center gap-3 sm:gap-3">
              <span className="w-1.5 h-8 sm:h-8 bg-gradient-to-b from-rose-500 to-pink-500 rounded-full"></span>
              <span className="wrap-break-word">
                Content Highlights: The "Meydan" Factor
              </span>
            </h2>
          </div>
          <div className="glass-card border border-white/40 p-6 sm:p-6 lg:p-8 rounded-3xl sm:rounded-3xl transition-all duration-300 sm:hover:shadow-2xl active:scale-[0.98] sm:active:scale-100 touch-manipulation">
            <h3 className="text-lg sm:text-lg font-bold text-black mb-4 sm:mb-4 leading-snug">
              {analyticsData.blogPost.title}
            </h3>
            <p className="text-sm sm:text-sm text-gray-700 mb-5 sm:mb-6 leading-relaxed">
              This blog post continues to be a featured asset with{" "}
              <span className="font-bold text-black">
                {analyticsData.blogPost.lifetimeViews.toLocaleString()} lifetime
                views
              </span>
              , serving as a critical entry point for high-net-worth individuals
              looking for capital appreciation.
            </p>
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 pt-5 sm:pt-5 border-t border-gray-200/50">
              <span className="text-sm sm:text-xs font-semibold text-gray-600 uppercase tracking-wide">
                Lifetime Views:
              </span>
              <span className="text-3xl sm:text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                {analyticsData.blogPost.lifetimeViews.toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        {/* Insights Section */}
        <div className="glass-dark border border-white/20 p-6 sm:p-6 lg:p-8 mb-8 rounded-3xl sm:rounded-2xl shadow-xl relative z-10">
          <div className="mb-5 sm:mb-6 pb-4 sm:pb-4 border-b border-white/20">
            <h2 className="text-lg sm:text-lg font-bold text-white uppercase tracking-wider">
              Key Insights
            </h2>
          </div>
          <ul className="space-y-4 sm:space-y-4">
            {[
              "The high traffic to the /team and /careers pages correlates strongly with the 74 resumes received, indicating high intent among job seekers.",
              "Your audience is highly concentrated in the UAE and Singapore, suggesting strong international investor interest.",
              "A staggering majority of users (77.8%) access the site via desktop, typical for high-value real estate research and job applications.",
            ].map((insight, index) => (
              <li
                key={index}
                className="flex items-start gap-4 sm:gap-4 text-white"
              >
                <span className="text-white font-bold text-lg sm:text-lg mt-0.5 shrink-0">
                  •
                </span>
                <span className="text-sm sm:text-sm leading-relaxed">
                  {insight}
                </span>
              </li>
            ))}
          </ul>
        </div>

        {/* Export PDF Button - Mobile/Tablet Only */}
        <div className="fixed md:hidden bottom-0 left-0 right-0 z-50 p-4 bg-gradient-to-t from-white via-white/98 to-white/95 backdrop-blur-xl border-t border-gray-200/30 shadow-[0_-4px_20px_rgba(0,0,0,0.08)]">
          <div className="max-w-7xl mx-auto">
            <button
              onClick={handleExportPDF}
              className="w-full px-6 py-3.5 bg-black text-white rounded-xl hover:bg-gray-900 active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-2 font-semibold text-sm shadow-lg touch-manipulation"
            >
              Export PDF
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
