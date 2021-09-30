import React from 'react';
import Home from '@/pages/MainPage';
import { useRoutes, Outlet } from 'react-router-dom';
import loadable from '@loadable/component'

const MedicalCard = loadable(() => import('@/pages/MedicalCard'));
const MedicalRecord = loadable(() => import('@/pages/MedicalRecord'));
const MedicalRecordDetail = loadable(() => import('@/pages/MedicalRecord/detail'));
const ReportProgress = loadable(() => import('@/pages/ReportProgress'));
const AuthData = loadable(() => import('@/pages/AuthData'));
const NewAuthData = loadable(() => import('@/pages/AuthData/new'));
const AllAuthData = loadable(() => import('@/pages/AuthData/all'));

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
        element: <MedicalRecordDetail />,
      },
      {
        path: '',
        element: <MedicalRecord />,
      }
    ]
  },
  {
    path: '/reportProgress',
    element: <ReportProgress />,
    title: '报告进度'
  },
  {
    path: '/authData',
    element: <AuthData />,
    title: '授权数据',
    children: [
      {
        path: 'new',
        element: <NewAuthData />,
      },
      {
        path: '',
        element: <AllAuthData />,
      },
    ]
  },
  {
    path: '*',
    element: <Home />,
    title: <>链<span className='font-bold text-blue-400'>＋</span>医疗服务平台</>
  },
];

export const Routes = () => useRoutes(routes);
