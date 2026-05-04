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

interface Props {
  grant: Grant;
}

export default function GrantCard({ grant }: Props) {
  return (
    <article className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm hover:shadow-md transition-shadow">
      <header className="flex items-start justify-between gap-3 mb-3">
        <h2 className="text-base font-semibold text-gray-900 leading-snug">
          {grant.name}
        </h2>
        <span
          className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium ${IMPACT_BADGE[grant.impact]}`}
        >
          {IMPACT_LABEL[grant.impact]}
        </span>
      </header>

      <div className="flex flex-wrap gap-1.5 mb-3">
        {grant.categories.map((cat) => (
          <span
            key={cat}
            className="rounded-md bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700"
          >
            {cat}
          </span>
        ))}
      </div>

      <dl className="space-y-2 text-sm text-gray-700">
        <div>
          <dt className="font-medium text-gray-900">Eligibility</dt>
          <dd>{grant.eligibility}</dd>
        </div>
        <div>
          <dt className="font-medium text-gray-900">Coverage</dt>
          <dd>{grant.coverage}</dd>
        </div>
        <div>
          <dt className="font-medium text-gray-900">How to Apply</dt>
          <dd>{grant.action}</dd>
        </div>
      </dl>

      <footer className="mt-4 flex items-center justify-between">
        <span className="text-xs text-gray-400">
          Verified {grant.lastVerified} · {grant.region}
        </span>
        {isSafeUrl(grant.sourceUrl) && (
          <a
            href={grant.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block rounded-lg bg-blue-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-blue-700 active:bg-blue-800 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            Visit site →
          </a>
        )}
      </footer>
    </article>
  );
}
