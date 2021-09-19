import React from 'react'
import covidTest from '../../images/mainPage/carousel-covidTest.png'
import { Link } from 'react-router-dom'
import { Carousel, WingBlank, Flex } from 'antd-mobile';
import './index.css'
import categoryJSON from '@/config/category.json'

const modules = Object.assign(
  import.meta.glob('../../images/mainPage/*.png'),
  import.meta.glob('../../images/icon/*.png')
)
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

const categoryIcon = {}
const carouselData = await Promise.all(['covidTest', 'covidTest'].map(async i => (
  (await modules[`../../images/mainPage/carousel-${i}.png`]()).default
)))

await Promise.all(Object.keys(categoryJSON).map(async (i) => {
  categoryIcon[i] = (await modules[`../../images/icon/${i}.png`]()).default
}))

class App extends React.Component {
  state = {
    carouselData: [],
    gridData: [],
    imgHeight: 176,
  }

  async componentDidMount() {
    this.setState({
      carouselData: await Promise.all(['covidTest'].map(async i => {
        return (await modules[`../../images/mainPage/carousel-${i}.png`]()).default
      })),
      gridData: Object.keys(categoryJSON).map((val) => ({
        icon: categoryIcon[val],
        text: categoryJSON[val],
        category: val,
      })),
    });
  }

  render() {
    return (
      <WingBlank>
        <p className='py-4 text-center text-opacity-80 text-lg'>
          链
          <span className='font-bold text-blue-400'>＋</span>
          医疗服务平台
        </p>
        <Carousel
          autoplay={false}
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
        <div className='grid grid-cols-4 gap-y-8'>
          {this.state.gridData.map((dataItem, i) => (
            <Link to={`/${dataItem.category}`} key={i}>
              <div className='flex flex-col items-center'>
                <img src={dataItem.icon} className='w-1/2' alt='' />
                <div className='mt-1 text-xs' style={{ color: 'rgba(4, 52, 52, 0.7)' }}>
                  <span>{dataItem.text}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </WingBlank>
    );
  }
}


export default App