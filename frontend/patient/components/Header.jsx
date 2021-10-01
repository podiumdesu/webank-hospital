import React from "react";
import { matchRoutes, useLocation, useNavigate } from "react-router-dom";
import { routes } from '@/routes';
import { NavBar } from 'antd-mobile';

export const Header = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [{ route: { title }, pathname }] = matchRoutes(routes, location);
    return (
        <NavBar
            back={pathname !== '/' ? undefined : null}
            onBack={() => {
                navigate(history.length > 1 ? -1 : `${location.pathname}/../`);
            }}
        >
            {title}
        </NavBar>
    );
};
