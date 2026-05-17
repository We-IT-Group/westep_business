import type {AnalyticsFilterValue} from "./types.ts";
import {sourceTypeOptions} from "./utils.ts";

function SourceTabs({
    value,
    onChange,
}: {
    value: AnalyticsFilterValue;
    onChange: (next: AnalyticsFilterValue) => void;
}) {
    const items: Array<{value: AnalyticsFilterValue; label: string}> = [
        {value: "ALL", label: "Barchasi"},
        ...sourceTypeOptions.map((option) => ({value: option.value, label: option.label})),
    ];

    return (
        <section className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
            <div className="flex flex-wrap gap-2">
                {items.map((item) => (
                    <button
                        key={item.value}
                        type="button"
                        onClick={() => onChange(item.value)}
                        className={`rounded-lg px-4 py-2 text-sm font-semibold transition-all duration-150 ${
                            value === item.value
                                ? "bg-slate-950 text-white shadow-sm"
                                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                        }`}
                    >
                        {item.label}
                    </button>
                ))}
            </div>
        </section>
    );
}

export default SourceTabs;
