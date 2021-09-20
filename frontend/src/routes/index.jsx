import React from 'react';
import Home from '@/pages/MainPage';
import MedicalCard from '@/pages/MedicalCard';
import { useRoutes } from 'react-router-dom';

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
