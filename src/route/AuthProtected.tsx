import React from 'react';
import {Navigate} from 'react-router-dom';
import {isTeacherSideRole, useUser} from "../api/auth/useAuth.ts";
import Spinner from "../components/common/Spinner.tsx";
import {removeItem} from "../utils/utils.ts";

const AuthProtected = ({children}: { children: React.ReactNode }) => {
    const {data: user, isLoading, isError} = useUser();
    if (isLoading) return <Spinner/>;
    if (isError || !user) return <Navigate to="/login" replace/>;
    if (!isTeacherSideRole(user.roleName)) {
        removeItem("accessToken");
        removeItem("refreshToken");
        return <Navigate to="/login" replace/>;
    }

    return <>{children}</>;
};


export default AuthProtected;
