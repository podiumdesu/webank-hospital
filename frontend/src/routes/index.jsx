import React from 'react';
import Home from '@/pages/MainPage';
import { useRoutes } from 'react-router-dom';
import loadable from '@loadable/component'

const MedicalCard = loadable(() => import('@/pages/MedicalCard'));

export const routes = [
  {
    path: "/medicalCard",
    element: <MedicalCard />,
    title: '电子就诊卡'
  },
  {
    path: '*',
    element: <Home />,
    title: <>链<span className='font-bold text-blue-400'>＋</span>医疗服务平台</>
  },
];

export const Routes = () => useRoutes(routes);
