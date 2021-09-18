import React from 'react'
import covidTest from '../../images/mainPage/carousel-covidTest.png'
import { Carousel, WingBlank, Grid, Flex } from 'antd-mobile';
import './index.css'
import categoryJSON from '@/config/category.json'

const modules = Object.assign(
    import.meta.glob('../../images/mainPage/*.png'),
    import.meta.glob('../../images/icon/*.png')
)

const grid2data = await Promise.all(Object.keys(
  {
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
).map((async i => {
    return {
        bg: (await modules[`../../images/mainPage/${i}-bg.png`]()).default,
        icon: (await modules[`../../images/mainPage/${i}-icon.png`]()).default,
        category: grid2data[i].category,
        clickText: grid2data[i].clickText,
        textColor: grid2data[i].textColor
    }
})))

const categoryIcon = {}
const carouselData = await Promise.all(['covidTest', 'covidTest'].map(async i => (
    (await modules[`../../images/mainPage/carousel-${i}.png`]()).default 
)))

const data1 = Array.from(new Array(9)).map(() => ({
    icon: 'https://gw.alipayobjects.com/zos/rmsportal/WXoqXTHrSnRcUwEaQgXJ.png',
  }));

  
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
          text: categoryJSON[val]
      })),

    });

  }
  render() {
    return (
      <WingBlank>
        <p className='banner' style={{color: 'rgba(0, 0, 0, 0.7)', fontSize: '18px', padding: '20px 0 10px 0'}}>链 + 医疗服务平台</p>
        <Carousel
          autoplay={false}
          infinite
        >
          {this.state.carouselData.map(val => (
            <a
              key={val}
              href='http://www.alipay.com'
              style={{ display: 'inline-block', width: '100%', height: this.state.imgHeight }}
            >
              <img
                src={this.state.carouselData}
                alt=''
                style={{ width: '100%', verticalAlign: 'top' }}
                onLoad={() => {
                  // fire window resize event to change height
                  window.dispatchEvent(new Event('resize'));
                  this.setState({ imgHeight: 'auto' });
                }}
              />
            </a>
          ))}
        </Carousel>
        <Flex>
            {grid2data.map((dataItem) => (
                <Flex.Item>
                    <div style={{
                        backgroundImage: `url(${dataItem.bg})`, 
                        backgroundSize: '100% auto', 
                        minHeight: '110px' , 
                        margin: '15px 0 25px 0'
                    }}>
                        <div style={{paddingTop: '20%', textAlign: 'center'}}>
                            <p style={{lineHeight: '25px'}}>
                                <img style={{width: '15px', marginBottom: '-1px'}} src={dataItem.icon}></img>
                                <span style={{fontSize: '17px', color: "white", fontWeight: 'bold', paddingLeft: "6px"}}>{dataItem.category}</span>
                            </p>
                            <span style={{color: `${dataItem.textColor}`, fontSize: '13px'}}>{dataItem.clickText}</span>
                        </div>
                    </div>
                </Flex.Item>
            ))}
        </Flex>
        <Grid data={this.state.gridData} hasLine={false} activeStyle={false}
                  renderItem={dataItem => (
                    <div style={{ padding: '0px' }}>
                      <img src={dataItem.icon} style={{ width: '40%' }} alt='' />
                      <div style={{ color: 'rgba(4, 52, 52, 0.7)', fontSize: '7px', margin: '5px 0 30px 0' }}>
                        <span>{dataItem.text}</span>
                      </div>
                    </div>
                  )}
        />
      </WingBlank>
    );
  }
}


export default App