import axios from "axios";
import React, { useEffect, useState } from "react";
import GuideList from "./components/GuideList";
import GuidePage from "./components/GuidePage";

type GuideSummary = { id: string; title: string; hero: string };

export default function App() {
  const [list, setList] = useState<GuideSummary[]>([]);
  const [selected, setSelected] = useState<string | null>(null);

  useEffect(() => {
    axios
      .get("http://localhost:4001/api/guides")
      .then((r) => setList(r.data))
      .catch(() => setList([]));
  }, []);

  return (
    <div className='app-root'>
      <header className='topbar'>
        <h1>Torchlight Infinite - Guides</h1>
      </header>
      <div className='container'>
        <aside className='sidebar'>
          <GuideList
            guides={list}
            onSelect={(g) => setSelected(g)}
          />
        </aside>
        <main className='main'>
          {selected ? (
            <GuidePage id={selected} />
          ) : (
            <div className='placeholder'>Select a guide</div>
          )}
        </main>
      </div>
    </div>
  );
}
