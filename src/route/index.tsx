import React from 'react';
import {Routes, Route} from 'react-router-dom';

//routes
import {authProtectedRoutes, publicRoutes} from './allRoutes';
import AuthProtected from "./AuthProtected.tsx";
import AppLayout from "../layout/AppLayout.tsx";

type AppRoute = {
    index?: boolean;
    path?: string;
    element: React.ReactNode;
    children?: AppRoute[];
};

const Index = () => {

    const renderRoutes = (routes: AppRoute[]) =>
        routes.map((route, idx) => (
            <Route
                key={idx}
                index={route.index}
                path={route.path}
                element={route.element}
            >
                {route.children ? renderRoutes(route.children) : null}
            </Route>
        ));

    return (
        <React.Fragment>
            <Routes>
                <Route>
                    {publicRoutes.map((route, idx) => (
                        <Route path={route.path} element={
                            route.element
                        } key={idx}/>
                    ))}
                </Route>

                <Route element={<AuthProtected>
                    <AppLayout/>
                </AuthProtected>
                }>
                    {renderRoutes(authProtectedRoutes)}
                </Route>
            </Routes>
        </React.Fragment>
    );
};

export default Index;
