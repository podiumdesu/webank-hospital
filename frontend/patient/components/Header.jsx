import React from "react";
import {
    useLocation,
    matchRoutes,
    Link
} from "react-router-dom";
import { routes } from '@/routes';
import { NavBar, Icon } from 'antd-mobile'

export const Header = () => {
    const location = useLocation();
    const [{ route: { title }, pathname }] = matchRoutes(routes, location);
    return (
        <NavBar
            mode="light"
            icon={pathname === '/' ? undefined : <Link to={`${location.pathname}/../`}><Icon type="left" className='text-black' /></Link>}
        >
            {title}
        </NavBar>
    );
};