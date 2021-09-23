import React from "react";
import {
    useLocation,
    matchRoutes
} from "react-router-dom";
import { routes } from '@/routes';
import { NavBar, Icon } from 'antd-mobile'

export const Header = () => {
    const [{ route: { title }, pathname }] = matchRoutes(routes, useLocation());
    return (
        <NavBar
            mode="light"
            icon={pathname === '/' ? undefined : <Icon onClick={() => history.back()} type="left" className='text-black' />}
        >
            {title}
        </NavBar>
    );
};