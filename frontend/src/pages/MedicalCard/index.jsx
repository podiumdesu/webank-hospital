import React from 'react'
import { NavBar, Icon, WingBlank } from 'antd-mobile'
import { Link } from 'react-router-dom'
import blueFlower from '../../images/medicalCard/blueFlower.png'
import cardBg from '../../images/medicalCard/cardBg.png'

class App extends React.Component {
    render() {
        return (
            <WingBlank>
                <NavBar
                    mode="light"
                    icon={<Link to='/'><Icon type="left" className='-ml-4 text-black' /></Link>}
                >
                    电子就诊卡
                </NavBar>
                <div className='relative'>
                    <div className='absolute top-8 left-6'>
                        <p >李小红</p>
                        <p>性别：女</p>
                        <p>卡号：2342425325231</p>
                        <p>切换就诊人</p>
                    </div>
                    <p className='absolute top-0 right-0 rounded-bl-lg rounded-tr-lg p-1 pl-3 z-20 text-xs' style={{ color: '#252517', background: '#FBCD6F' }}>自费卡</p>
                    <img src={cardBg} className='w-full opacity-50' />
                    <div className='absolute flex flex-col justify-center items-center w-full h-full top-0'>
                        <img className='w-screen-1/4 h-w-screen-1/4 absolute right-6 top-10' src={cardBg}></img>
                        <span className='font-bold text-whie text-base'>{}</span>
                    </div>
                </div>

            </WingBlank>
        )

    }
}
export default App