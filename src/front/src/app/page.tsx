'use client';

import { useState, useEffect } from 'react';


export default function Home() {

  const [data, setData] = useState(null);

  useEffect(() => {
    async function fetchData() {
      const res = await fetch('http://localhost:4000/api/');
      if (!res.ok) throw new Error('Erreur réseau');
      const json = await res.json();
      setData(json);
    }
    fetchData();
  }, []);

  return <div>{JSON.stringify(data)}</div>;
}
