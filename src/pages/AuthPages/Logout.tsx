import {useEffect} from "react";
import {Navigate} from "react-router-dom";
import {useLogout} from "../../api/auth/useAuth.ts";



const Logout = () => {


    const {mutate,isPending} = useLogout()

    useEffect(() => {
        mutate()
    }, []);


    if (isPending) {
        return <Navigate to={"/login"}/>;
    }

    return <></>;
};


export default Logout;