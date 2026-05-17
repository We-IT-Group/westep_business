import type {LinkStats} from "./types.ts";
import {analyticsLabels, readMetricValue} from "./utils.ts";

function LinkStatsPanel({stats}: {stats: LinkStats}) {
    return (
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="grid grid-cols-2 gap-3">
                {analyticsLabels.map((item) => (
                    <div key={item.label} className="rounded-lg border border-slate-100 bg-slate-50 px-3 py-3">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.05em] text-slate-400">{item.label}</p>
                        <p className="mt-2 text-base font-semibold text-slate-950">{readMetricValue(stats, item.key, item.money)}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default LinkStatsPanel;
