"use client";

import { useState, useEffect } from "react";

export default function Home() {
  const [data, setData] = useState([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch(`/api/trees`); // relais Next → API (voir next.config.ts)
        if (!res.ok) throw new Error(`Erreur ${res.status}`);

        setData(await res.json());
      } catch (err) {
        setError((err as Error).message);
      }
    }
    fetchData();
  }, []);

  if (error) return <p>Erreur : {error}</p>;

  return <div>{JSON.stringify(data, null, 2)}</div>;
}
