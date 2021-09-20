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
                <div className='relative m-1'>
                    <div className='absolute top-5 left-6'>
                        <p className='leading-8 text-base font-semibold mb-1'>李小红</p>
                        <p className='text-xs leading-5'>性别：女</p>
                        <p className='text-xs leading-5'>年龄：23岁</p>
                        <p className='text-xs leading-5'>卡号：2342425325231</p>
                        <p className='text-xs mt-5 w-24 text-center leading-5 rounded-2xl' style={{backgroundColor: '#61A1F8', color:'#3C55D5 '}}>⇆ 切换就诊人</p>
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