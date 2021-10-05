import React from 'react'
import blueFlower from '../../images/icon/common/blueFlower.png'
import cardBg from '../../images/medicalCard/cardBg.png';
import qr from '../../images/medicalCard/qr.svg';
import allCategoryJSON from '@/config/category.json'
import { Section } from '@/components/Section';
import { Link } from 'react-router-dom';

const modules = Object.assign(
    import.meta.glob('../../images/icon/*.png')
)
const categoryIcon = {}
const selectIcon = [
    'outPatientAppointment',
    'sameDayRegis',
    'waitingInquiry',
    'outPatientPayment',
    'reportProgress',
    'checkAppointment',
    'electronicBill',
    'covidTestAppointment'
]
await Promise.all((selectIcon).map(async i => {
    categoryIcon[i] = (await modules[`../../images/icon/${i}.png`]()).default
}))

class App extends React.Component {
    state = {
        iconData: selectIcon.map(i => ({
            icon: categoryIcon[i],
            text: allCategoryJSON[i],
            category: i
        }))
    }

    render() {
        return (
            <div className='px-4'>
                <div className='relative mx-1 mb-8'>
                    <div className='absolute top-5 left-6'>
                        <p className='leading-8 text-base font-semibold mb-1'>李小红</p>
                        <p className='text-xs leading-5'>性别：女</p>
                        <p className='text-xs leading-5'>年龄：23岁</p>
                        <p className='text-xs leading-5'>卡号：2342425325231</p>
                        <p className='text-xs mt-5 w-24 text-center leading-5 rounded-2xl bg-[#61A1F8] text-[#3C55D5]'>⇆ 切换就诊人</p>
                    </div>
                    <p className='absolute top-0 right-0 rounded-bl-lg rounded-tr-lg p-1 px-3 z-20 text-xs text-dark-black bg-[#FBCD6F]'>自费卡</p>
                    <img src={cardBg} className='w-full opacity-50' alt='' />
                    <div className='absolute right-6 top-10'>
                        <Link to='/authData/new'><img className='w-screen-1/4 h-w-screen-1/4' src={qr} alt='' /></Link>
                        <p className='text-xs text-center pt-1'>点击出示二维码</p>
                    </div>
                </div>
                <Section icon={blueFlower} title='就诊功能' items={this.state.iconData} />
            </div>
        )

    }
}
export default App
