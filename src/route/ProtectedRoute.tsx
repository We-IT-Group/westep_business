import React from "react";
import {Navigate} from "react-router-dom";

interface ProtectedRouteProps {
    children: React.ReactNode;
    allowedRoles: string[]; // Ruxsat etilgan rollar ro'yxati
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
                                                           children,
                                                       }) => {

    // const hasPermission = allowedRoles?.some((role: any) => userPermission?.includes(role));

    return false ? <>{children}</> : <Navigate to="/dashboard"/>;
};

export default ProtectedRoute;
