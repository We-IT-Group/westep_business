import {Navigate} from "react-router-dom";
import Spinner from "../../components/common/Spinner.tsx";
import {isTeacherSideRole, useUser} from "../../api/auth/useAuth.ts";

export default function HomeRedirect() {
    const {data: user, isLoading} = useUser();

    if (isLoading) {
        return <Spinner/>;
    }

    return <Navigate to={isTeacherSideRole(user?.roleName) ? "/dashboard" : "/courses"} replace/>;
}
