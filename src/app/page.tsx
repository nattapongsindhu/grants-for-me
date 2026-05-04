import fs from "fs";
import path from "path";
import type { GrantsData } from "@/types/grant";
import GrantsClient from "./GrantsClient";

function loadGrants(): GrantsData {
  const filePath = path.join(process.cwd(), "public", "data", "grants.json");
  const raw = fs.readFileSync(filePath, "utf-8");
  return JSON.parse(raw) as GrantsData;
}

export default function HomePage() {
  const data = loadGrants();
  return <GrantsClient grants={data.grants} lastUpdated={data.lastUpdated} />;
}
