"use client";
/* eslint-disable */

import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
import { useAlphaVantage } from "../hooks/useAlphaVantage";
import { useMemo, useState, useEffect } from "react";
import { OhlcDisplay } from "../components/OhlcDisplay";
import { SMASelector } from "../components/SMASelector";
import { PeriodSelector } from "../components/PeriodSelector";
import { SymbolInput } from "../components/SymbolInput";
import { Navbar } from "../components/Navbar";

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

  useEffect(() => {
    import("highcharts/modules/stock").then((module: any) => {
      // Highcharts stock module does not have proper types, so we use 'any'
      if (typeof module === "function") {
        module(Highcharts);
      } else if (module && typeof module.default === "function") {
        module.default(Highcharts);
      }
    });
  }, []);

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

    // Prepare OHLC data for candlestick
    let ohlcData: [number, number, number, number, number][] = Object.entries(timeSeries)
      .map(([date, values]): [number, number, number, number, number] => {
        const v = values as Record<string, string>;
        return [
          new Date(date).getTime(),
          parseFloat(v["1. open"]),
          parseFloat(v["2. high"]),
          parseFloat(v["3. low"]),
          parseFloat(v["4. close"]),
        ];
      })
      .sort((a, b) => a[0] - b[0]);

    // Prepare volume data for column series
    let volumeData: [number, number][] = Object.entries(timeSeries)
      .map(([date, values]): [number, number] => {
        const v = values as Record<string, string>;
        return [
          new Date(date).getTime(),
          parseFloat(v["5. volume"]),
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
      ohlcData = ohlcData.filter(([date]) => date >= start && date <= end);
      volumeData = volumeData.filter(([date]) => date >= start && date <= end);
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
        type: "candlestick" as const,
        name: `${symbol} Candlestick`,
        data: ohlcData,
        tooltip: {
          valueDecimals: 2
        },
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
        zIndex: 2,
      },
      {
        type: "column" as const,
        name: "Volume",
        data: volumeData,
        yAxis: 1,
        color: "#8884d8",
        tooltip: {
          valueDecimals: 0,
          valueSuffix: " shares"
        },
        zIndex: 1,
      },
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
        zIndex: 3,
      },
      ...selectedSMAs.map((period) => ({
        type: "line" as const,
        name: `SMA ${period}`,
        data: calculateSMA(chartData, period),
        dashStyle: "ShortDash",
        enableMouseTracking: false,
        zIndex: 4,
      })),
    ];

    return {
      title: { text: `${symbol} End of Day (EOD) Stock Price` },
      xAxis: { type: "datetime", crosshair: true },
      yAxis: [
        { title: { text: "Price (USD)" }, height: "70%", top: "0%" },
        { title: { text: "Volume" }, top: "75%", height: "25%", offset: 0, opposite: false }
      ],
      series,
      chart: { height: 500 },
      tooltip: {
        shared: true,
        useHTML: true,
        formatter: function (this: any): string {
          const points: any[] = this.points || [this];
          let s: string = `<b>${Highcharts.dateFormat('%A, %b %e, %Y', this.x)}</b><br/>`;
          let ohlc: any = null;
          let volume: number | undefined = undefined;
          let smas: string[] = [];
          points.forEach((point: any) => {
            if (point.series.type === 'candlestick' && point.point) {
              ohlc = point.point;
            } else if (point.series.type === 'column' && typeof point.y === 'number') {
              volume = point.y;
            } else if (point.series.name.startsWith('SMA')) {
              smas.push(`<span style='color:${point.color}'>${point.series.name}: <b>${point.y?.toFixed(2)}</b></span>`);
            }
          });
          if (ohlc) {
            s += `<span style='color:#fff'>O: <b>${ohlc.open}</b> H: <b>${ohlc.high}</b> L: <b>${ohlc.low}</b> C: <b>${ohlc.close}</b></span><br/>`;
          }
          if (typeof volume === 'number') {
            s += `<span style='color:#8884d8'>Volume: <b>${(volume as number).toLocaleString()}</b></span><br/>`;
          }
          if (smas.length) {
            s += smas.join('<br/>') + '<br/>';
          }
          return s;
        }
      },
      plotOptions: {
        series: {
          dataGrouping: {
            enabled: false
          }
        }
      },
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
    <div className="min-h-screen bg-[#111]">
      <Navbar />
      <main className="flex flex-col items-center justify-center min-h-[calc(100vh-64px)] py-2 sm:py-8">
        <div className="w-full max-w-full sm:max-w-4xl bg-[#18191A] rounded-2xl shadow-lg border border-[#222] p-2 sm:p-8 flex flex-col items-center overflow-x-auto">
          <div className="w-full flex flex-col gap-2 sm:gap-4 items-center">
            <SymbolInput value={symbol} onChange={setSymbol} />
            <h1 className="text-lg sm:text-3xl font-bold mb-1 sm:mb-2 text-white text-center break-words">{symbol} End of Day (EOD) Stock Price</h1>
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
          </div>
          <div className="w-full flex justify-center items-center min-h-[220px] sm:min-h-[400px] mt-2 sm:mt-4">
            {loading && <p className="text-white">Loading...</p>}
            {error && <p className="text-red-500">Error: {error}</p>}
            {!loading && !error && data && (data["Note"] || data["Error Message"]) && (
              <p className="text-red-500">{data["Note"] || data["Error Message"]}</p>
            )}
            {!loading && !error && data && data["Time Series (Daily)"] && (
              <div className="w-full overflow-x-auto">
                <HighchartsReact highcharts={Highcharts} options={options} />
              </div>
            )}
            {!loading && !error && data && !data["Time Series (Daily)"] && !data["Note"] && !data["Error Message"] && (
              <p className="text-red-500">No data found for symbol "{symbol}".</p>
            )}
            {!loading && !error && !data && (
              <p className="text-white">No data available.</p>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
