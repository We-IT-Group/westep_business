import {useNavigate} from "react-router-dom";
import {useEffect} from "react";

export const useRequireState = (key: string, redirectTo: string = "/login") => {

    const navigate = useNavigate();

    useEffect(() => {
        const hasState = JSON.parse(sessionStorage.getItem('form') as string);
        if (!hasState || !hasState[key]) {
            navigate(redirectTo);
        }
    }, [key, redirectTo, navigate]);
};