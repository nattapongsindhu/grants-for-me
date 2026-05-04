"use client";

import { useState, useMemo, useEffect } from "react";
import type { Grant, Category } from "@/types/grant";
import GrantCard from "@/components/GrantCard";
import SearchBar from "@/components/SearchBar";
import FilterCategory from "@/components/FilterCategory";

interface Props {
  grants: Grant[];
  lastUpdated: string;
}

export default function GrantsClient({ grants, lastUpdated }: Props) {
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<Category | null>(null);
  const [formattedDate, setFormattedDate] = useState<string>("—");

  useEffect(() => {
    setFormattedDate(
      new Date(lastUpdated).toLocaleString("en-US", {
        timeZone: "America/Los_Angeles",
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        timeZoneName: "short",
      })
    );
  }, [lastUpdated]);

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();
    return grants.filter((g) => {
      const matchesCategory =
        activeCategory === null || g.categories.includes(activeCategory);
      const matchesQuery =
        q === "" ||
        g.name.toLowerCase().includes(q) ||
        g.eligibility.toLowerCase().includes(q) ||
        g.coverage.toLowerCase().includes(q) ||
        g.tags.some((t) => t.toLowerCase().includes(q));
      return matchesCategory && matchesQuery;
    });
  }, [grants, query, activeCategory]);

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-4xl px-4 py-10">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
            Free Workforce Training Grants
          </h1>
          <p className="mt-2 text-gray-600">
            California grants for IT, Maintenance, and Healthcare training — no cost to you.
          </p>
          <p className="mt-1 text-sm text-gray-500 font-medium">
            Last Updated:{" "}
            <span className="text-gray-700">{formattedDate}</span>
          </p>
        </header>

        <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-center">
          <SearchBar value={query} onChange={setQuery} />
          <FilterCategory active={activeCategory} onChange={setActiveCategory} />
        </div>
        <p className="mb-6 text-xs text-gray-400">
          Showing {filtered.length} of {grants.length} grants
        </p>

        {filtered.length === 0 ? (
          <p className="text-center text-gray-500 mt-16">
            No grants match your search. Try a different keyword or category.
          </p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2">
            {filtered.map((grant) => (
              <GrantCard key={grant.id} grant={grant} />
            ))}
          </div>
        )}

        <footer className="mt-16 border-t pt-6 text-center text-xs text-gray-400">
          Grants verified from public California workforce sources. Verify eligibility
          directly with each program before applying.
        </footer>
      </div>
    </main>
  );
}
