import React from 'react'
import { Link } from 'react-router-dom'
import blueFlower from '../../images/medicalCard/blueFlower.png'
import cardBg from '../../images/medicalCard/cardBg.png'
import allCategoryJSON from '@/config/category.json'
import QRCode from 'qrcode';

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

const qrCode = await QRCode.toDataURL('2342425325231');

class App extends React.Component {
    state = {
        iconData: []
    }
    async componentDidMount() {
        this.setState({
            iconData: selectIcon.map(i => ({
                icon: categoryIcon[i],
                text: allCategoryJSON[i],
                category: i
            }))
        })
    }
    render() {
        return (
            <>
                <div className='relative m-1'>
                    <div className='absolute top-5 left-6'>
                        <p className='leading-8 text-base font-semibold mb-1'>李小红</p>
                        <p className='text-xs leading-5'>性别：女</p>
                        <p className='text-xs leading-5'>年龄：23岁</p>
                        <p className='text-xs leading-5'>卡号：2342425325231</p>
                        <p className='text-xs mt-5 w-24 text-center leading-5 rounded-2xl' style={{ backgroundColor: '#61A1F8', color: '#3C55D5 ' }}>⇆ 切换就诊人</p>
                    </div>
                    <p className='absolute top-0 right-0 rounded-bl-lg rounded-tr-lg p-1 px-3 z-20 text-xs' style={{ color: '#252517', background: '#FBCD6F' }}>自费卡</p>
                    <img src={cardBg} className='w-full opacity-50' />
                    <div className='absolute right-6 top-10'>
                        <img className='w-screen-1/4 h-w-screen-1/4' src={qrCode} />
                        <p className='text-xs text-center pt-1' style={{ color: '#252517' }}>点击出示二维码</p>
                    </div>
                </div>
                <p className='m-1 mt-8 flex items-center'>
                    <img className='inline-block w-4' src={blueFlower} />
                    <span className='text-lg leading-6 ml-2' style={{ color: '#242424' }}>就诊功能</span>
                </p>
                <div className='grid grid-cols-4 gap-y-8 mt-8'>
                    {this.state.iconData.map((dataItem, i) => (
                        <Link to={`/${dataItem.category}`} key={i}>
                            <div className='flex flex-col items-center'>
                                <img src={dataItem.icon} className='w-1/2' alt='' />
                                <div className='mt-2 text-xs'>
                                    <span style={{color: 'rgba(4, 52, 52, 0.6)'}}>{dataItem.text}</span>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            </>
        )

    }
}
export default App