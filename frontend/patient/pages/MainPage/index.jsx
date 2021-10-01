import React from 'react'
import { Link } from 'react-router-dom'
import { Swiper } from 'antd-mobile';
import './index.css'
import categoryJSON from '@/config/category.json'
import { Section, SectionBody } from '@/components/Section';
import blueFlower from '../../images/icon/common/blueFlower.png'
import person from '../../images/icon/common/person.png'

const modules = Object.assign(
  import.meta.glob('../../images/mainPage/*.png'),
  import.meta.glob('../../images/icon/*.png')
)
const otherIcons = import.meta.glob('../../images/icon/other/*.png');
const personalIcons = import.meta.glob('../../images/icon/personal/*.png');

const grid2Json = {
  'medicalCard': {
    category: '电子就诊卡',
    clickText: '点击出示就诊卡 > ',
    textColor: '#3C55D5'
  },
  'medicalRecord': {
    category: '电子病历',
    clickText: '查看往期病历 > ',
    textColor: '#0BAE83',
  }
}
const grid2data = await Promise.all(Object.keys(grid2Json).map((async i => {
  return {
    bg: (await modules[`../../images/mainPage/${i}-bg.png`]()).default,
    icon: (await modules[`../../images/mainPage/${i}-icon.png`]()).default,
    category: i,
    text: grid2Json[i].category,
    clickText: grid2Json[i].clickText,
    textColor: grid2Json[i].textColor
  }
})))

const getSectionItems = (icons) => Promise.all(Object.entries(icons).map(async ([path, module]) => {
  const name = path.match(/(?<=\d+ ).*(?=\.png)/);
  return {
    icon: (await module()).default,
    text: name,
    category: '/',
  };
}));

const mainItems = await Promise.all(Object.entries(categoryJSON).map(async ([i, text]) => ({
  icon: (await modules[`../../images/icon/${i}.png`]()).default,
  text,
  category: i,
})));
const otherItems = await getSectionItems(otherIcons);
const personalItems = await getSectionItems(personalIcons);
const carouselData = await Promise.all(['covidTest', 'covidMask', 'covidVacci'].map(async i => {
  return (await modules[`../../images/mainPage/carousel-${i}.png`]()).default
}))

class App extends React.Component {
  render() {
    return (
      <>
        <div className='px-4'>
          <Swiper autoplay indicatorProps={{ color: 'white' }}>
            {carouselData.map(val => (
              <Swiper.Item key={val}>
                <img src={val} alt='' />
              </Swiper.Item>
            ))}
          </Swiper>
          <div className='grid grid-cols-2 gap-2 mb-6 mt-3'>
            {grid2data.map((dataItem, i) => (
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
}


export default App
