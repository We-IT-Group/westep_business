import type {LinkStats} from "./types.ts";
import {analyticsLabels, readMetricValue} from "./utils.ts";

function MetricsSummaryBar({summary}: {summary: LinkStats}) {
    return (
        <section className="grid grid-cols-2 gap-3 md:grid-cols-4 lg:grid-cols-6">
            {analyticsLabels.map((item) => (
                <div key={item.label} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.05em] text-slate-400">{item.label}</p>
                    <p className="mt-2 text-xl font-semibold text-slate-950">{readMetricValue(summary, item.key, item.money)}</p>
                </div>
            ))}
        </section>
    );
}

export default MetricsSummaryBar;
