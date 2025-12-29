"use client";

import { useState, useRef, useEffect } from "react";
import { format, parseISO } from "date-fns";
import Image from "next/image";
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
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  AlignmentType,
} from "docx";

// Report data
const reportData = {
  period: {
    start: "2025-11-29",
    end: "2025-12-29",
  },
  metrics: {
    totalVisitors: 2715,
    totalPageViews: 5205,
    resumesReceived: 74,
    conversionRate: 2.7,
  },
  topPages: [
    { name: "Homepage (/)", visitors: 1180 },
    { name: "Team Page (/team)", visitors: 219 },
    { name: "Contact Page (/contact)", visitors: 188 },
    { name: "Blog Page (/blog)", visitors: 180 },
    { name: "Careers Page (/careers)", visitors: 146 },
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

const COLORS = [
  "#000000",
  "#2a2a2a",
  "#4a4a4a",
  "#6a6a6a",
  "#8a8a8a",
  "#aaaaaa",
];

// Custom tooltip component
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="glass-card border border-black/20 shadow-xl p-3 rounded-xl">
        <p className="font-semibold text-black mb-1">{label}</p>
        {payload.map((entry, index) => (
          <p key={index} className="text-sm text-black">
            <span className="font-medium">{entry.name}:</span>{" "}
            {typeof entry.value === "number"
              ? entry.value.toLocaleString()
              : entry.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function Home() {
  const [startDate, setStartDate] = useState(reportData.period.start);
  const [endDate, setEndDate] = useState(reportData.period.end);
  const [analyticsData, setAnalyticsData] = useState(reportData);
  const [loading, setLoading] = useState(false);
  const reportRef = useRef(null);

  // Fetch analytics data from API
  useEffect(() => {
    const fetchAnalytics = async () => {
      if (!startDate || !endDate) return;

      setLoading(true);
      try {
        const url = `/api/analytics/store?startDate=${startDate}&endDate=${endDate}`;
        const response = await fetch(url);
        const result = await response.json();

        if (result.data) {
          // Merge API data with default structure
          setAnalyticsData({
            period: { start: startDate, end: endDate },
            metrics: result.data.metrics || reportData.metrics,
            topPages: result.data.topPages || reportData.topPages,
            trafficSources:
              result.data.trafficSources || reportData.trafficSources,
            countries: result.data.countries || reportData.countries,
            devices: result.data.devices || reportData.devices,
            operatingSystems:
              result.data.operatingSystems || reportData.operatingSystems,
            blogPost: reportData.blogPost, // Keep static blog post data
          });
        } else if (result.message) {
          // No data available, keep default data
          console.log(result.message);
        }
      } catch (error) {
        console.error("Error fetching analytics:", error);
        // Keep default data on error
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [startDate, endDate]);

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
    if (!reportRef.current) return;

    const canvas = await html2canvas(reportRef.current, {
      scale: 2,
      useCORS: true,
      logging: false,
    });

    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF("p", "mm", "a4");
    const imgWidth = 210;
    const pageHeight = 297;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    let heightLeft = imgHeight;
    let position = 0;

    pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;

    while (heightLeft >= 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }

    pdf.save(`USH-Report-${startDate}-to-${endDate}.pdf`);
  };

  const handleExportWord = async () => {
    const doc = new Document({
      sections: [
        {
          properties: {},
          children: [
            new Paragraph({
              text: "Union Square House - Performance Report",
              heading: HeadingLevel.HEADING_1,
              alignment: AlignmentType.CENTER,
            }),
            new Paragraph({
              text: `Reporting Period: ${format(
                parseISO(startDate),
                "MMM dd, yyyy"
              )} - ${format(parseISO(endDate), "MMM dd, yyyy")}`,
              alignment: AlignmentType.CENTER,
            }),
            new Paragraph({ text: "" }),
            new Paragraph({
              text: "Executive Summary",
              heading: HeadingLevel.HEADING_2,
            }),
            new Paragraph({
              children: [
                new TextRun({ text: "Total Visitors: ", bold: true }),
                new TextRun({
                  text: reportData.metrics.totalVisitors.toString(),
                }),
              ],
            }),
            new Paragraph({
              children: [
                new TextRun({ text: "Total Page Views: ", bold: true }),
                new TextRun({
                  text: reportData.metrics.totalPageViews.toString(),
                }),
              ],
            }),
            new Paragraph({
              children: [
                new TextRun({ text: "Resumes Received: ", bold: true }),
                new TextRun({
                  text: reportData.metrics.resumesReceived.toString(),
                }),
              ],
            }),
            new Paragraph({
              children: [
                new TextRun({ text: "Conversion Rate: ", bold: true }),
                new TextRun({ text: `${reportData.metrics.conversionRate}%` }),
              ],
            }),
            new Paragraph({ text: "" }),
            new Paragraph({
              text: "Top Performing Pages",
              heading: HeadingLevel.HEADING_2,
            }),
            ...reportData.topPages.map(
              (page) =>
                new Paragraph({
                  children: [
                    new TextRun({ text: `${page.name}: `, bold: true }),
                    new TextRun({ text: `${page.visitors} visitors` }),
                  ],
                })
            ),
          ],
        },
      ],
    });

    const blob = await Packer.toBlob(doc);
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `USH-Report-${startDate}-to-${endDate}.docx`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 via-gray-50 to-gray-200 relative">
      {/* Animated background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-black/5 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-black/5 rounded-full blur-3xl"></div>
      </div>

      {/* Header with Filters and Export */}
      <div className="glass sticky top-0 z-50 border-b border-black/10 shadow-lg backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10 py-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="flex items-center gap-5">
              <Image
                src="/ush-logo.jpeg"
                alt="Union Square House Logo"
                width={120}
                height={120}
                className="object-contain"
                priority
              />
              <div className="border-l-2 border-gray-300 pl-5">
                <h1 className="text-2xl font-bold text-black tracking-tight">
                  Performance Dashboard
                </h1>
                <p className="text-sm text-gray-600 mt-0.5 font-medium">
                  Union Square House
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              {/* Date Filters */}
              <div className="flex gap-2">
                <input
                  type="date"
                  value={startDate}
                  onChange={handleStartDateChange}
                  max={endDate}
                  className="px-4 py-2.5 glass-card border border-black/20 rounded-xl focus:ring-2 focus:ring-black/30 focus:border-black/40 text-gray-900 font-medium text-sm transition-all backdrop-blur-sm"
                />
                <input
                  type="date"
                  value={endDate}
                  onChange={handleEndDateChange}
                  min={startDate}
                  className="px-4 py-2.5 glass-card border border-black/20 rounded-xl focus:ring-2 focus:ring-black/30 focus:border-black/40 text-gray-900 font-medium text-sm transition-all backdrop-blur-sm"
                />
              </div>

              {/* Export Buttons */}
              <div className="flex gap-2">
                <button
                  onClick={handleExportPDF}
                  className="px-5 py-2.5 bg-black/90 backdrop-blur-sm text-white rounded-xl hover:bg-black transition-all flex items-center gap-2 font-semibold text-sm shadow-lg hover:shadow-xl"
                >
                  Export PDF
                </button>
                <button
                  onClick={handleExportWord}
                  className="px-5 py-2.5 glass-card border border-black/20 rounded-xl hover:bg-white/90 transition-all flex items-center gap-2 font-semibold text-sm shadow-md hover:shadow-lg"
                >
                  Export Word
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Report Content */}
      <div
        ref={reportRef}
        className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10 py-10 relative z-10"
      >
        {/* Report Period */}
        <div className="mb-10 text-center relative z-10">
          <div className="inline-block px-6 py-3 glass-card border border-black/20 rounded-2xl shadow-lg">
            <p className="text-base text-gray-700 font-medium">
              Reporting Period:{" "}
              <span className="font-bold text-black">
                {format(parseISO(startDate), "MMM dd, yyyy")} –{" "}
                {format(parseISO(endDate), "MMM dd, yyyy")}
              </span>
              {loading && (
                <span className="ml-3 text-sm text-gray-500">(Loading...)</span>
              )}
            </p>
          </div>
        </div>

        {/* Key Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-10 relative z-10">
          {[
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
              label: "Conversion Rate",
              value: `${analyticsData.metrics.conversionRate}%`,
            },
          ].map((metric, index) => (
            <div
              key={index}
              className="glass-card border border-black/20 p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02]"
            >
              <h3 className="text-xs font-semibold text-gray-600 mb-3 uppercase tracking-wider">
                {metric.label}
              </h3>
              <p className="text-4xl font-bold text-black leading-tight">
                {typeof metric.value === "number"
                  ? metric.value.toLocaleString()
                  : metric.value}
              </p>
            </div>
          ))}
        </div>

        {/* Section 1: Top Performing Pages */}
        <div className="glass-card border border-black/20 p-8 mb-8 rounded-2xl shadow-xl relative z-10">
          <div className="mb-6 pb-4 border-b border-black/10">
            <h2 className="text-lg font-bold text-black uppercase tracking-wider">
              Top Performing Pages
            </h2>
          </div>
          <ResponsiveContainer width="100%" height={350}>
            <BarChart
              data={analyticsData.topPages}
              margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#e5e7eb"
                vertical={false}
              />
              <XAxis
                dataKey="name"
                angle={-45}
                textAnchor="end"
                height={80}
                stroke="#4a4a4a"
                tick={{ fontSize: 11, fill: "#666" }}
                interval={0}
              />
              <YAxis
                stroke="#4a4a4a"
                tick={{ fontSize: 11, fill: "#666" }}
                width={60}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ paddingTop: "20px" }} iconType="square" />
              <Bar
                dataKey="visitors"
                fill="#000000"
                name="Visitors"
                radius={[0, 0, 0, 0]}
                barSize={60}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Section 2: Traffic Sources & Countries */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8 relative z-10">
          <div className="glass-card border border-black/20 p-8 rounded-2xl shadow-xl">
            <div className="mb-6 pb-4 border-b border-black/10">
              <h2 className="text-lg font-bold text-black uppercase tracking-wider">
                Traffic Sources
              </h2>
            </div>
            <ResponsiveContainer width="100%" height={350}>
              <PieChart>
                <Pie
                  data={analyticsData.trafficSources}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) =>
                    `${name}: ${(percent * 100).toFixed(0)}%`
                  }
                  outerRadius={110}
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
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
            <div className="mt-6 pt-4 border-t border-black/10 space-y-2">
              {analyticsData.trafficSources.map((source, index) => (
                <div
                  key={index}
                  className="flex justify-between items-center py-1"
                >
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 border border-black"
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                    />
                    <span className="text-sm text-gray-700 font-medium">
                      {source.name}
                    </span>
                  </div>
                  <span className="text-sm font-bold text-black">
                    {source.visitors.toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="glass-card border border-black/20 p-8 rounded-2xl shadow-xl">
            <div className="mb-6 pb-4 border-b border-black/10">
              <h2 className="text-lg font-bold text-black uppercase tracking-wider">
                Top Countries
              </h2>
            </div>
            <ResponsiveContainer width="100%" height={350}>
              <BarChart
                data={analyticsData.countries}
                layout="vertical"
                margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
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
                  width={70}
                  stroke="#4a4a4a"
                  tick={{ fontSize: 11, fill: "#666" }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend
                  wrapperStyle={{ paddingTop: "20px" }}
                  iconType="square"
                />
                <Bar
                  dataKey="visitors"
                  fill="#000000"
                  name="Visitors"
                  radius={[0, 4, 4, 0]}
                />
                <Bar
                  dataKey="views"
                  fill="#4a4a4a"
                  name="Views"
                  radius={[0, 4, 4, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Section 3: Device Breakdown & OS */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8 relative z-10">
          <div className="glass-card border border-black/20 p-8 rounded-2xl shadow-xl">
            <div className="mb-6 pb-4 border-b border-black/10">
              <h2 className="text-lg font-bold text-black uppercase tracking-wider">
                Device Breakdown
              </h2>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={analyticsData.devices}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percentage }) => `${name}: ${percentage}%`}
                  outerRadius={100}
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
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
            <div className="mt-6 pt-4 border-t border-black/10 space-y-3">
              {analyticsData.devices.map((device, index) => (
                <div
                  key={index}
                  className="flex justify-between items-center py-2 border-b border-black/5 last:border-0"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-4 h-4 border border-black"
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                    />
                    <span className="text-sm text-gray-700 font-medium">
                      {device.name}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-bold text-black block">
                      {device.visitors.toLocaleString()}
                    </span>
                    <span className="text-xs text-gray-500">
                      {device.percentage}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="glass-card border border-black/20 p-8 rounded-2xl shadow-xl">
            <div className="mb-6 pb-4 border-b border-black/10">
              <h2 className="text-lg font-bold text-black uppercase tracking-wider">
                Operating Systems
              </h2>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={analyticsData.operatingSystems}
                margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#e5e7eb"
                  vertical={false}
                />
                <XAxis
                  dataKey="name"
                  stroke="#4a4a4a"
                  tick={{ fontSize: 11, fill: "#666" }}
                />
                <YAxis
                  stroke="#4a4a4a"
                  tick={{ fontSize: 11, fill: "#666" }}
                  width={50}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend
                  wrapperStyle={{ paddingTop: "20px" }}
                  iconType="square"
                />
                <Bar
                  dataKey="percentage"
                  fill="#000000"
                  name="Percentage (%)"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Section 4: Content Highlights */}
        <div className="glass-card border border-black/20 p-8 mb-8 rounded-2xl shadow-xl relative z-10">
          <div className="mb-6 pb-4 border-b border-black/10">
            <h2 className="text-lg font-bold text-black uppercase tracking-wider">
              Content Highlights: The "Meydan" Factor
            </h2>
          </div>
          <div className="glass border border-black/20 p-6 rounded-xl backdrop-blur-md">
            <h3 className="text-base font-bold text-black mb-3 leading-snug">
              {analyticsData.blogPost.title}
            </h3>
            <p className="text-sm text-gray-700 mb-5 leading-relaxed">
              This blog post continues to be a featured asset with{" "}
              <span className="font-bold text-black">
                {analyticsData.blogPost.lifetimeViews.toLocaleString()} lifetime
                views
              </span>
              , serving as a critical entry point for high-net-worth individuals
              looking for capital appreciation.
            </p>
            <div className="flex items-center gap-3 pt-4 border-t border-black/10">
              <span className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                Lifetime Views:
              </span>
              <span className="text-3xl font-bold text-black">
                {analyticsData.blogPost.lifetimeViews.toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        {/* Insights Section */}
        <div className="glass-dark border border-white/20 p-8 mb-8 rounded-2xl shadow-xl relative z-10">
          <div className="mb-6 pb-4 border-b border-white/20">
            <h2 className="text-lg font-bold text-white uppercase tracking-wider">
              Key Insights
            </h2>
          </div>
          <ul className="space-y-4">
            {[
              "The high traffic to the /team and /careers pages correlates strongly with the 74 resumes received, indicating high intent among job seekers.",
              "Your audience is highly concentrated in the UAE and Singapore, suggesting strong international investor interest.",
              "A staggering majority of users (77.8%) access the site via desktop, typical for high-value real estate research and job applications.",
            ].map((insight, index) => (
              <li key={index} className="flex items-start gap-4 text-white">
                <span className="text-white font-bold text-lg mt-0.5">•</span>
                <span className="text-sm leading-relaxed">{insight}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
