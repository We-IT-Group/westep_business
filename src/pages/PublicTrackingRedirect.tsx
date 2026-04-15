import {useEffect} from "react";
import {useParams} from "react-router-dom";
import {LoaderCircle} from "lucide-react";
import {apiBaseOrigin} from "../api/apiClient.ts";

export default function PublicTrackingRedirect() {
    const {code} = useParams<{ code: string }>();

    useEffect(() => {
        if (!code) return;
        window.location.replace(`${apiBaseOrigin}/r/${code}`);
    }, [code]);

    return (
        <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-slate-50 text-slate-600">
            <LoaderCircle className="h-6 w-6 animate-spin"/>
            <p className="text-sm">Redirecting to promo link...</p>
        </div>
    );
}
