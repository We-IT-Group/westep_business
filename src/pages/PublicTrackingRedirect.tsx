import {useEffect, useState} from "react";
import {useParams, Link} from "react-router-dom";
import {LoaderCircle, AlertCircle, ArrowLeft} from "lucide-react";
import {apiBaseOrigin} from "../api/apiClient.ts";

export default function PublicTrackingRedirect() {
    const {code} = useParams<{ code: string }>();
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!code) return;

        const performRedirect = async () => {
             try {
                 const redirectUrl = `${apiBaseOrigin}/r/${code}`;
                 // We try to fetch with 'manual' redirect to see if the link is valid
                 // but since we want to catch errors, we'll just try a standard fetch or head
                 const response = await fetch(redirectUrl, { method: 'HEAD' });
                 
                 if (response.ok || (response.status >= 300 && response.status < 400)) {
                     window.location.replace(redirectUrl);
                 } else {
                     setError("Kurs hozir aktiv emas yoki havola o'chirilgan.");
                 }
             } catch {
                 // If network error or CORS issue (common with fetch to external/different origin)
                 // we fallback to direct redirect and let browser handle it
                 window.location.replace(`${apiBaseOrigin}/r/${code}`);
             }
        };

        performRedirect();
    }, [code]);

    if (error) {
        return (
            <div className="flex min-h-screen flex-col items-center justify-center p-6 bg-white text-center">
                <div className="w-20 h-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-6">
                    <AlertCircle className="w-10 h-10" />
                </div>
                <h1 className="text-2xl font-bold text-slate-900 mb-2">Bog'lanib bo'lmadi</h1>
                <p className="text-slate-500 mb-8 max-w-sm">
                    {error}
                </p>
                <Link to="/" className="flex items-center gap-2 text-blue-600 font-medium hover:text-blue-700 transition-colors">
                    <ArrowLeft className="w-4 h-4" />
                    Asosiy sahifaga qaytish
                </Link>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-slate-50 text-slate-600">
            <div className="relative">
                <LoaderCircle className="h-12 w-12 animate-spin text-blue-600"/>
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse" />
                </div>
            </div>
            <div className="space-y-1 text-center font-medium">
                <p className="text-slate-900">Yo'naltirilmoqda...</p>
                <p className="text-xs text-slate-400">Biz sizni kurs sahifasiga yuboryapmiz</p>
            </div>
        </div>
    );
}
