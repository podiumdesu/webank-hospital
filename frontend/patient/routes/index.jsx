import React from 'react';
import Home from '@/pages/MainPage';
import { Outlet, useRoutes } from 'react-router-dom';
import loadable from '@loadable/component';
import logoIcon from '@/images/logo/logoIcon.png';
import logoText from '@/images/logo/logoText.png';

const MedicalCard = loadable(() => import('@/pages/MedicalCard'));
const MedicalRecord = loadable(() => import('@/pages/MedicalRecord'));
const DetailedMedicalRecord = loadable(() => import('@/pages/MedicalRecord/detail'));
const MedicalExamination = loadable(() => import('@/pages/MedicalExamination'));
const DetailedMedicalExamination = loadable(() => import('@/pages/MedicalExamination/detail'));
const ReportProgress = loadable(() => import('@/pages/ReportProgress'));
const NewData = loadable(() => import('@/pages/AuthData/new'));
const AllData = loadable(() => import('@/pages/AuthData/all'));
const ShareData = loadable(() => import('@/pages/AuthData/share'));
const TraceMedicine = loadable(() => import('@/pages/TraceMedicine'));

export const routes = [
    {
        path: '/medicalCard',
        element: <MedicalCard />,
        title: '电子就诊卡'
    },
    {
        path: '/medicalRecord',
        element: <Outlet />,
        title: '电子病历',
        children: [
            {
                path: ':cid',
                element: <DetailedMedicalRecord />,
            },
            {
                path: '',
                element: <MedicalRecord />,
            }
        ]
    },
    {
        path: '/physicalExamData',
        element: <Outlet />,
        title: '体检数据',
        children: [
            {
                path: ':cid',
                element: <DetailedMedicalExamination />,
            },
            {
                path: '',
                element: <MedicalExamination />,
            }
        ]
    },
    {
        path: '/reportProgress',
        element: <ReportProgress />,
        title: '报告进度'
    },
    {
        path: '/traceMedicine',
        element: <TraceMedicine />,
        title: '药品溯源'
    },
    {
        path: '/authData',
        element: <Outlet />,
        title: '授权数据',
        children: [
            {
                path: 'share',
                element: <ShareData />
            },
            {
                path: 'new',
                element: <NewData />,
            },
            {
                path: '',
                element: <AllData />,
            },
        ]
    },
    {
        path: '*',
        element: <Home />,
        title: <div className='flex justify-center items-center'>
          <img src={logoIcon} alt='' className='h-4' />
          <img src={logoText} alt='' className='h-4 mx-1' />
          服务平台
        </div>
    },
];

export const Routes = () => useRoutes(routes);
