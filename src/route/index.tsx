import React from "react";
import {RouteObject, useRoutes} from "react-router-dom";
import {authProtectedRoutes, publicRoutes} from "./allRoutes";
import AuthProtected from "./AuthProtected.tsx";
import AppLayout from "../layout/AppLayout.tsx";

type AppRoute = {
    index?: boolean;
    path?: string;
    element: React.ReactNode;
    children?: AppRoute[];
};

const mapRoute = (route: AppRoute): RouteObject => {
    if (route.index) {
        return {
            index: true,
            element: route.element,
        };
    }

    return {
        path: route.path,
        element: route.element,
        children: route.children?.map(mapRoute),
    };
};

const Index = () => {
    const routes = useRoutes([
        ...publicRoutes.map(mapRoute),
        {
            element: (
                <AuthProtected>
                    <AppLayout/>
                </AuthProtected>
            ),
            children: authProtectedRoutes.map(mapRoute),
        },
    ]);

    return <React.Fragment>{routes}</React.Fragment>;
};

export default Index;
