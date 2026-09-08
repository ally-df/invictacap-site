"use client";

import dynamic from "next/dynamic";
import { useSite } from "@/lib/store";
import { LiteResolver } from "./LiteResolver";
import { ScrollSync } from "./ScrollSync";
import { EnterGate } from "./EnterGate";
import { Nav } from "./Nav";
import { Footer } from "./Footer";
import { TopBlock } from "./TopBlock";
import { Statement } from "./sections/Statement";
import { Strategy } from "./sections/Strategy";
import { Sectors } from "./sections/Sectors";
import { Approach } from "./sections/Approach";
import { Notes } from "./sections/Notes";
import { Partners } from "./sections/Partners";
import { Contact } from "./sections/Contact";

const Scene = dynamic(() => import("@/components/scene/Scene"), { ssr: false });

/** Mounts the WebGL scene only once lite has been resolved as off. */
function SceneMount() {
  const lite = useSite((s) => s.lite);
  const liteResolved = useSite((s) => s.liteResolved);
  if (lite || !liteResolved) return null;
  return <Scene />;
}

export function HomePage() {
  return (
    <>
      <LiteResolver />
      <ScrollSync />
      <SceneMount />
      <EnterGate />
      <Nav />
      <main className="home-main relative z-10">
        <TopBlock />
        <Statement />
        <Strategy />
        <Sectors />
        <Approach />
        <Notes />
        <Partners />
        <Contact />
        <Footer />
      </main>
    </>
  );
}
