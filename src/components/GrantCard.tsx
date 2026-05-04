import type { Grant, ImpactLevel } from "@/types/grant";

const IMPACT_BADGE: Record<ImpactLevel, string> = {
  high: "bg-green-100 text-green-800",
  medium: "bg-yellow-100 text-yellow-800",
  low: "bg-gray-100 text-gray-700",
};

const IMPACT_LABEL: Record<ImpactLevel, string> = {
  high: "Recommended",
  medium: "Available",
  low: "Institutional",
};

function isSafeUrl(url: string | undefined): url is string {
  if (!url) return false;
  try {
    const { protocol } = new URL(url);
    return protocol === "https:" || protocol === "http:";
  } catch {
    return false;
  }
}

function getTrustBadge(url: string | undefined): { label: string; className: string } | null {
  if (!url) return null;
  if (url.includes(".gov")) return { label: "Official Source", className: "text-blue-700 bg-blue-50 border-blue-100" };
  if (url.includes(".edu")) return { label: "Academic Program", className: "text-purple-700 bg-purple-50 border-purple-100" };
  return { label: "Verified", className: "text-green-700 bg-green-50 border-green-100" };
}

interface Props {
  grant: Grant;
}

export default function GrantCard({ grant }: Props) {
  const trustBadge = getTrustBadge(grant.sourceUrl);

  return (
    <article className="flex flex-col rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md">
      <header className="mb-3">
        <div className="flex items-start justify-between gap-3">
          <h2 className="text-base font-bold leading-snug text-gray-900">
            {grant.name}
          </h2>
          <span
            className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium ${IMPACT_BADGE[grant.impact]}`}
          >
            {IMPACT_LABEL[grant.impact]}
          </span>
        </div>

        <div className="mt-2 flex flex-wrap items-center gap-1.5">
          {grant.categories.map((cat) => (
            <span
              key={cat}
              className="rounded-md bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700"
            >
              {cat}
            </span>
          ))}
          {trustBadge && (
            <span
              className={`rounded-md border px-2 py-0.5 text-xs font-medium ${trustBadge.className}`}
            >
              {trustBadge.label}
            </span>
          )}
        </div>
      </header>

      <dl className="flex-1 space-y-3 text-sm">
        <div>
          <dt className="font-semibold text-gray-900">Eligibility</dt>
          <dd className="mt-0.5 text-gray-700">{grant.eligibility}</dd>
        </div>
        <div>
          <dt className="font-semibold text-gray-900">Coverage</dt>
          <dd className="mt-0.5 text-gray-700">{grant.coverage}</dd>
        </div>
        <div>
          <dt className="font-semibold text-gray-900">How to Apply</dt>
          <dd className="mt-0.5 text-gray-700">{grant.action}</dd>
        </div>
      </dl>

      <footer className="mt-4 flex items-center justify-between border-t border-gray-100 pt-3">
        <p className="text-xs text-gray-400">
          Verified {grant.lastVerified} · {grant.region}
        </p>
        {isSafeUrl(grant.sourceUrl) && (
          <a
            href={grant.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block rounded-lg bg-blue-600 px-3 py-1.5 text-sm font-semibold text-white transition-colors hover:bg-blue-700 active:bg-blue-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
          >
            View Official Source →
          </a>
        )}
      </footer>
    </article>
  );
}
