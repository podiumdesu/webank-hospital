import React from "react";
import {
    useLocation,
    matchRoutes,
    Link
} from "react-router-dom";
import { routes } from '@/routes';
import { NavBar, Icon } from 'antd-mobile'

export const Header = () => {
    const [{ route: { title }, pathname }] = matchRoutes(routes, useLocation());
    return (
        <NavBar
            mode="light"
            icon={pathname === '/' ? undefined : <Link to={`${useLocation().pathname}/../`}><Icon type="left" className='text-black' /></Link>}
        >
            {title}
        </NavBar>
    );
};