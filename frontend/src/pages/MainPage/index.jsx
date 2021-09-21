import React from 'react'
import { Link } from 'react-router-dom'
import { Carousel, Flex, WingBlank } from 'antd-mobile';
import './index.css'
import categoryJSON from '@/config/category.json'
import { Section, SectionBody } from '@/components/Section';
import blueFlower from '../../images/icon/common/blueFlower.png'
import person from '../../images/icon/common/person.png'

const modules = Object.assign(
  import.meta.glob('../../images/mainPage/*.png'),
  import.meta.glob('../../images/icon/*.png')
)
const otherIcons = import.meta.glob('/src/images/icon/other/*.png');
const personalIcons = import.meta.glob('/src/images/icon/personal/*.png');

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

class App extends React.Component {
  state = {
    carouselData: [],
    imgHeight: 176,
  }

  async componentDidMount() {
    this.setState({
      carouselData: await Promise.all(['covidTest', 'covidMask', 'covidVacci'].map(async i => {
        return (await modules[`../../images/mainPage/carousel-${i}.png`]()).default
      })),
    });
  }

  render() {
    return (
      <>
        <WingBlank>
          <Carousel
            // autoplay
            infinite
          >
            {this.state.carouselData.map(val => (
              <a
                key={val}
                href='/'
                className='w-full inline-block'
                style={{ height: this.state.imgHeight }}
              >
                <img
                  src={val}
                  alt=''
                  className='w-full'
                  onLoad={() => {
                    // fire window resize event to change height
                    window.dispatchEvent(new Event('resize'));
                    this.setState({ imgHeight: 'auto' });
                  }}
                />
              </a>
            ))}
          </Carousel>
          <Flex className='my-6'>
            {grid2data.map((dataItem, i) => (
              <Flex.Item key={i} className='relative'>
                <img src={dataItem.bg} className='w-full' />
                <div className='absolute flex flex-col justify-center items-center w-full h-full top-0'>
                  <p className='flex justify-center items-center gap-1.5'>
                    <img className='w-4' src={dataItem.icon}></img>
                    <span className='font-bold text-white text-base'>{dataItem.text}</span>
                  </p>
                  <Link className='text-xs' to={`/${dataItem.category}`} style={{ color: `${dataItem.textColor}` }}>{dataItem.clickText}</Link>
                </div>
              </Flex.Item>
            ))}
          </Flex>
          <SectionBody items={mainItems} />
        </WingBlank>
        <div className='h-1 opacity-25' style={{ background: '#C8DBFF' }} />
        <WingBlank>
          <Section title='其他功能' items={otherItems} icon={blueFlower} />
        </WingBlank>
        <div className='h-1 opacity-25' style={{ background: '#C8DBFF' }} />
        <WingBlank>
          <Section title='个人中心' items={personalItems} icon={person} />
        </WingBlank>
      </>
    );
  }
}


export default App