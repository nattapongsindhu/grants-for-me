"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import type { Grant, Category } from "@/types/grant";
import GrantCard from "@/components/GrantCard";
import SearchBar from "@/components/SearchBar";
import FilterCategory from "@/components/FilterCategory";

interface Props {
  grants: Grant[];
  lastUpdated: string;
}

function isStaleData(lastUpdated: string): boolean {
  const diffMs = Date.now() - new Date(lastUpdated).getTime();
  return diffMs / (1000 * 60 * 60 * 24) > 3;
}

export default function GrantsClient({ grants, lastUpdated }: Props) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  // Initialize state from URL params on mount
  const [query, setQueryState] = useState<string>(
    () => searchParams.get("query") ?? ""
  );
  const [activeCategory, setActiveCategoryState] = useState<Category | null>(
    () => (searchParams.get("category") as Category | null) ?? null
  );
  const [formattedDate, setFormattedDate] = useState<string>("—");
  const isStale = useMemo(() => isStaleData(lastUpdated), [lastUpdated]);

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

  const updateUrl = useCallback(
    (newQuery: string, newCategory: Category | null) => {
      const params = new URLSearchParams();
      if (newQuery.trim()) params.set("query", newQuery.trim());
      if (newCategory) params.set("category", newCategory);
      const qs = params.toString();
      router.replace(`${pathname}${qs ? `?${qs}` : ""}`, { scroll: false });
    },
    [router, pathname]
  );

  const setQuery = useCallback(
    (val: string) => {
      setQueryState(val);
      updateUrl(val, activeCategory);
    },
    [activeCategory, updateUrl]
  );

  const setActiveCategory = useCallback(
    (cat: Category | null) => {
      setActiveCategoryState(cat);
      updateUrl(query, cat);
    },
    [query, updateUrl]
  );

  const clearFilters = useCallback(() => {
    setQueryState("");
    setActiveCategoryState(null);
    router.replace(pathname, { scroll: false });
  }, [router, pathname]);

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
      {isStale && (
        <div
          role="alert"
          className="border-b border-amber-200 bg-amber-50 px-4 py-3 text-center text-sm text-amber-800"
        >
          <strong>Notice:</strong> Data may be stale. Listings need re-verification.
        </div>
      )}

      <div className="mx-auto max-w-4xl px-4 py-10">
        <header className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">
            Free Workforce Training Grants
          </h1>
          <p className="mt-2 text-gray-600">
            California grants for IT, Maintenance, and Healthcare training — no cost to you.
          </p>
          <p className="mt-1 text-sm font-medium text-gray-500">
            Last Updated: <span className="text-gray-700">{formattedDate}</span>
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
          <div className="mt-16 flex flex-col items-center gap-3 text-center">
            <p className="text-lg font-medium text-gray-600">No grants match your search.</p>
            <p className="text-sm text-gray-400">
              Try a different keyword or remove the active filter.
            </p>
            <button
              onClick={clearFilters}
              className="mt-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
            >
              Clear Filters
            </button>
          </div>
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
