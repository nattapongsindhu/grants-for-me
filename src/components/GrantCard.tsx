import type { Grant, ImpactLevel } from "@/types/grant";

const IMPACT_BADGE: Record<ImpactLevel, string> = {
  high: "bg-green-100 text-green-800",
  medium: "bg-yellow-100 text-yellow-800",
  low: "bg-gray-100 text-gray-700",
};

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
          className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${IMPACT_BADGE[grant.impact]}`}
        >
          {grant.impact} impact
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
        {grant.sourceUrl && (
          <a
            href={grant.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-medium text-blue-600 hover:underline"
          >
            Visit site →
          </a>
        )}
      </footer>
    </article>
  );
}
