import { useEffect, useState } from "react";
import { AlphaVantageTimeSeriesDailyResponse } from "../interfaces/alphaVantage";

const API_KEY = process.env.NEXT_PUBLIC_ALPHA_VANTAGE_KEY;
const BASE_URL = "https://www.alphavantage.co/query";

interface UseAlphaVantageOptions {
  functionType: string;
  symbol: string;
  params?: Record<string, string>;
}

export function useAlphaVantage({ functionType, symbol, params = {} }: UseAlphaVantageOptions) {
  const [data, setData] = useState<AlphaVantageTimeSeriesDailyResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!functionType || !symbol) return;
    setLoading(true);
    setError(null);

    const url = new URL(BASE_URL);
    url.searchParams.append("function", functionType);
    url.searchParams.append("symbol", symbol);
    url.searchParams.append("apikey", API_KEY || "");
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.append(key, value);
    });

    fetch(url.toString())
      .then((res) => {
        if (!res.ok) throw new Error("Network response was not ok");
        return res.json();
      })
      .then((json) => {
        setData(json);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [functionType, symbol, JSON.stringify(params)]);

  return { data, loading, error };
} 