import React from "react";
import {
    useLocation,
    matchRoutes,
    useNavigate,
} from "react-router-dom";
import { routes } from '@/routes';
import { NavBar, Icon } from 'antd-mobile'

export const Header = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [{ route: { title }, pathname }] = matchRoutes(routes, location);
    return (
        <NavBar
            mode="light"
            icon={pathname === '/' ? undefined : <Icon
                type="left"
                onClick={() => {
                    navigate(history.length > 1 ? -1 : `${location.pathname}/../`);
                }}
                className='text-black'
            />}
        >
            {title}
        </NavBar>
    );
};