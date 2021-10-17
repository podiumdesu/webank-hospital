import React, { useState } from 'react'
import { Link } from 'react-router-dom';
import { Swiper } from 'antd-mobile';
import './index.css';
import categoryJSON from '@/config/category.json';
import { Section, SectionBody } from '@/components/Section';
import blueFlower from '@/images/icon/common/blueFlower.png';
import person from '@/images/icon/common/person.png';
import medicalCardBG from '@/images/mainPage/medicalCard-bg.png';
import medicalCardIcon from '@/images/mainPage/medicalCard-icon.png';
import medicalRecordBG from '@/images/mainPage/medicalRecord-bg.png';
import medicalRecordIcon from '@/images/mainPage/medicalRecord-icon.png';
import covidTest from '@/images/mainPage/carousel-covidTest.png';
import covidMask from '@/images/mainPage/carousel-covidMask.png';
import covidVacci from '@/images/mainPage/carousel-covidVacci.png';
import { useAsyncEffect } from '#/hooks/useAsyncEffect';

const mainIcons = import.meta.glob('../../images/icon/*.png');
const otherIcons = import.meta.glob('../../images/icon/other/*.png');
const personalIcons = import.meta.glob('../../images/icon/personal/*.png');

const grid2Json = [
  {
    bg: medicalCardBG,
    icon: medicalCardIcon,
    text: '电子就诊卡',
    category: 'medicalCard',
    clickText: '点击出示就诊卡 > ',
    textColor: '#3C55D5',
  },
  {
    bg: medicalRecordBG,
    icon: medicalRecordIcon,
    text: '电子病历',
    category: 'medicalRecord',
    clickText: '查看往期病历 > ',
    textColor: '#0BAE83',
  }
];

const getSectionItems = (icons) => Promise.all(Object.entries(icons).map(async ([path, module]) => {
  const name = path.match(/\S+(?=\.png$)/g)[0];
  return {
    icon: (await module()).default,
    text: name,
    category: '/',
  };
}));

export default () => {
  const [mainItems, setMainItems] = useState([]);
  const [otherItems, setOtherItems] = useState([]);
  const [personalItems, setPersonalItems] = useState([]);
  useAsyncEffect(async () => {
    setMainItems(await Promise.all(Object.entries(categoryJSON).map(async ([i, text]) => ({
      icon: (await mainIcons[`../../images/icon/${i}.png`]()).default,
      text,
      category: i,
    }))));
    setOtherItems(await getSectionItems(otherIcons));
    setPersonalItems(await getSectionItems(personalIcons));
  }, []);
  return (
    <>
      <div className='px-4'>
        <Swiper autoplay indicatorProps={{ color: 'white' }}>
          {[covidTest, covidMask, covidVacci].map(val => (
            <Swiper.Item key={val}>
              <img src={val} alt='' className='w-full' />
            </Swiper.Item>
          ))}
        </Swiper>
        <div className='grid grid-cols-2 gap-2 mb-6 mt-3'>
          {grid2Json.map((dataItem, i) => (
            <div key={i} className='relative'>
              <img src={dataItem.bg} className='w-full' alt='' />
              <div className='absolute flex flex-col justify-center items-center w-full h-full top-0'>
                <p className='flex justify-center items-center gap-1.5'>
                  <img className="w-4" src={dataItem.icon} alt='' />
                  <span className='font-bold text-white text-base'>{dataItem.text}</span>
                </p>
                <Link className='text-xs' to={`/${dataItem.category}`} style={{ color: `${dataItem.textColor}` }}>{dataItem.clickText}</Link>
              </div>
            </div>
          ))}
        </div>
        <SectionBody items={mainItems} />
      </div>
      <div className='h-1 opacity-25 bg-[#C8DBFF]' />
      <div className='px-4'>
        <Section title='其他功能' items={otherItems} icon={blueFlower} />
      </div>
      <div className='h-1 opacity-25 bg-[#C8DBFF]' />
      <div className='px-4'>
        <Section title='个人中心' items={personalItems} icon={person} />
      </div>
    </>
  );
}
