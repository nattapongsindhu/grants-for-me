export type ImpactLevel = "high" | "medium" | "low";

export type Category = "IT/Cybersecurity" | "Maintenance" | "Healthcare";

export interface Grant {
  id: string;
  name: string;
  categories: Category[];
  eligibility: string;
  coverage: string;
  action: string;
  sourceUrl?: string;
  impact: ImpactLevel;
  region: string;
  tags: string[];
  lastVerified: string;
}

export interface GrantsData {
  lastUpdated: string;
  version: string;
  grants: Grant[];
}
