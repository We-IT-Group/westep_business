import {useEffect, useState} from "react";
import {Copy, Globe, Link2, ShoppingBag} from "lucide-react";
import {Button} from "../../ui/button.tsx";
import type {CopyUrlItem} from "./types.ts";
import {copyToClipboard} from "./utils.ts";
import {showSuccessToast} from "../../../utils/toast.tsx";

const iconMap = {
    share: Link2,
    landing: Globe,
    student: ShoppingBag,
};

function CopyUrlsRow({items}: {items: CopyUrlItem[]}) {
    const [copiedKey, setCopiedKey] = useState<string | null>(null);

    useEffect(() => {
        if (!copiedKey) return;
        const timer = window.setTimeout(() => setCopiedKey(null), 1500);
        return () => window.clearTimeout(timer);
    }, [copiedKey]);

    const handleCopy = async (item: CopyUrlItem) => {
        const copied = await copyToClipboard(item.value);
        if (copied) {
            setCopiedKey(item.key);
            showSuccessToast(`${item.label} nusxalandi.`);
        }
    };

    return (
        <div className="space-y-3">
            {items.map((item) => {
                const Icon = iconMap[item.key as keyof typeof iconMap] || Link2;
                const copied = copiedKey === item.key;

                return (
                    <div key={item.key} className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3">
                        <div className="min-w-0">
                            <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                                <Icon className="h-4 w-4 text-slate-500"/>
                                {item.label}
                            </div>
                            <p className="mt-1 text-xs text-slate-500">{item.description}</p>
                        </div>
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className={`min-w-[118px] rounded-lg transition-colors duration-150 ${
                                copied ? "border-emerald-200 bg-emerald-50 text-emerald-700" : ""
                            }`}
                            onClick={() => void handleCopy(item)}
                        >
                            <Copy className="h-4 w-4"/>
                            {copied ? "Nusxalandi ✓" : "Nusxa olish"}
                        </Button>
                    </div>
                );
            })}
        </div>
    );
}

export default CopyUrlsRow;
