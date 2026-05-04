import fs from "fs";
import path from "path";
import { Suspense } from "react";
import type { GrantsData } from "@/types/grant";
import GrantsClient from "./GrantsClient";

function loadGrants(): GrantsData {
  const filePath = path.join(process.cwd(), "public", "data", "grants.json");
  const raw = fs.readFileSync(filePath, "utf-8");
  return JSON.parse(raw) as GrantsData;
}

export default function HomePage() {
  const data = loadGrants();
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-gray-50 flex items-center justify-center">
          <p className="text-gray-400 text-sm">Loading grants...</p>
        </main>
      }
    >
      <GrantsClient grants={data.grants} lastUpdated={data.lastUpdated} />
    </Suspense>
  );
}
