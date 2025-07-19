"use client";

import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
import { useAlphaVantage } from "../hooks/useAlphaVantage";
import { useMemo, useState, useEffect } from "react";
import { OhlcDisplay } from "../components/OhlcDisplay";
import { SMASelector } from "../components/SMASelector";
import { PeriodSelector } from "../components/PeriodSelector";
import { AlphaVantageTimeSeriesDailyResponse } from "../interfaces/alphaVantage";
import { SymbolInput } from "../components/SymbolInput";

const SMA_PERIODS = [10, 20, 50, 100];
const PERIODS = [
  { label: "1M", value: "1M" },
  { label: "3M", value: "3M" },
  { label: "6M", value: "6M" },
  { label: "1Y", value: "1Y" },
  { label: "YTD", value: "YTD" },
  { label: "MAX", value: "MAX" },
  { label: "Custom", value: "CUSTOM" },
];

function calculateSMA(data: [number, number][], period: number): [number, number][] {
  if (data.length < period) return [];
  const sma: [number, number][] = [];
  for (let i = period - 1; i < data.length; i++) {
    const sum = data.slice(i - period + 1, i + 1).reduce((acc, d) => acc + d[1], 0);
    sma.push([data[i][0], sum / period]);
  }
  return sma;
}

function getPeriodRange(period: string, allDates: number[]): { start: number; end: number } {
  const end = allDates[allDates.length - 1];
  const now = new Date(end);
  let start: number;
  switch (period) {
    case "1M":
      start = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate()).getTime();
      break;
    case "3M":
      start = new Date(now.getFullYear(), now.getMonth() - 3, now.getDate()).getTime();
      break;
    case "6M":
      start = new Date(now.getFullYear(), now.getMonth() - 6, now.getDate()).getTime();
      break;
    case "1Y":
      start = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate()).getTime();
      break;
    case "YTD":
      start = new Date(now.getFullYear(), 0, 1).getTime();
      break;
    case "MAX":
    default:
      start = allDates[0];
      break;
  }
  return { start, end };
}

export default function Home() {
  const [symbol, setSymbol] = useState<string>("AAPL");
  const { data, loading, error } = useAlphaVantage({
    functionType: "TIME_SERIES_DAILY",
    symbol,
  });

  const [selectedSMAs, setSelectedSMAs] = useState<number[]>([]);
  const [selectedPeriod, setSelectedPeriod] = useState<string>("1Y");
  const [customStart, setCustomStart] = useState<Date | null>(null);
  const [customEnd, setCustomEnd] = useState<Date | null>(null);
  const [hovered, setHovered] = useState<any>(null);

  useEffect(() => {
    setHovered(null);
  }, [symbol]);

  const options = useMemo(() => {
    if (!data || !data["Time Series (Daily)"]) return {};
    const timeSeries = data["Time Series (Daily)"];
    let chartData: [number, number][] = Object.entries(timeSeries)
      .map(([date, values]): [number, number] => {
        const v = values as Record<string, string>;
        return [
          new Date(date).getTime(),
          parseFloat(v["4. close"]),
        ];
      })
      .sort((a, b) => a[0] - b[0]);

    if (chartData.length > 0) {
      let start = chartData[0][0];
      let end = chartData[chartData.length - 1][0];
      if (selectedPeriod !== "CUSTOM") {
        const range = getPeriodRange(selectedPeriod, chartData.map(d => d[0]));
        start = range.start;
        end = range.end;
      } else if (customStart && customEnd) {
        start = customStart.getTime();
        end = customEnd.getTime();
      }
      chartData = chartData.filter(([date]) => date >= start && date <= end);
    }

    const ohlcMap: Record<number, any> = {};
    if (data && data["Time Series (Daily)"]) {
      Object.entries(data["Time Series (Daily)"]).forEach(([date, values]) => {
        const v = values as Record<string, string>;
        ohlcMap[new Date(date).getTime()] = v;
      });
    }

    const series = [
      {
        type: "line" as const,
        name: `${symbol} Close Price`,
        data: chartData,
        point: {
          events: {
            mouseOver: function (this: any) {
              setHovered({
                date: this.x,
                ...ohlcMap[this.x],
              });
            },
          },
        },
      },
      ...selectedSMAs.map((period) => ({
        type: "line" as const,
        name: `SMA ${period}`,
        data: calculateSMA(chartData, period),
        dashStyle: "ShortDash",
        enableMouseTracking: false,
      })),
    ];

    return {
      title: { text: `${symbol} End of Day (EOD) Stock Price` },
      xAxis: { type: "datetime" },
      yAxis: { title: { text: "Price (USD)" } },
      series,
      chart: { height: 500 },
      tooltip: { enabled: true },
    };
  }, [data, selectedSMAs, selectedPeriod, customStart, customEnd, symbol]);

  const handleSMAChange = (period: number) => {
    setSelectedSMAs((prev) =>
      prev.includes(period)
        ? prev.filter((p) => p !== period)
        : [...prev, period]
    );
  };

  let latest = null;
  if (data && data["Time Series (Daily)"]) {
    const all = Object.entries(data["Time Series (Daily)"])
      .map(([date, values]) => [new Date(date).getTime(), values] as [number, any])
      .sort((a, b) => a[0] - b[0]);
    if (all.length > 0) {
      latest = { date: all[all.length - 1][0], ...all[all.length - 1][1] };
    }
  }
  const display = hovered || latest;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8">
      <SymbolInput value={symbol} onChange={setSymbol} />
      <h1 className="text-2xl font-bold mb-4">{symbol} End of Day (EOD) Stock Price</h1>
      {display && (
        <OhlcDisplay
          date={display.date}
          open={display["1. open"]}
          high={display["2. high"]}
          low={display["3. low"]}
          close={display["4. close"]}
          volume={display["5. volume"]}
        />
      )}
      <SMASelector
        periods={SMA_PERIODS}
        selected={selectedSMAs}
        onChange={handleSMAChange}
      />
      <PeriodSelector
        periods={PERIODS}
        selected={selectedPeriod}
        onChange={setSelectedPeriod}
        customStart={customStart}
        customEnd={customEnd}
        setCustomStart={setCustomStart}
        setCustomEnd={setCustomEnd}
      />
      {loading && <p>Loading...</p>}
      {error && <p className="text-red-500">Error: {error}</p>}
      {!loading && !error && data && (data["Note"] || data["Error Message"]) && (
        <p className="text-red-500">{data["Note"] || data["Error Message"]}</p>
      )}
      {!loading && !error && data && data["Time Series (Daily)"] && (
        <HighchartsReact highcharts={Highcharts} options={options} />
      )}
      {!loading && !error && data && !data["Time Series (Daily)"] && !data["Note"] && !data["Error Message"] && (
        <p className="text-red-500">No data found for symbol "{symbol}".</p>
      )}
      {!loading && !error && !data && (
        <p>No data available.</p>
      )}
    </div>
  );
}
