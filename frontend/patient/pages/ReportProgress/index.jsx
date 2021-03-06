import React from 'react'

import allReport from '@/config/reportProgress.json'


const filterReport = {
    "unchecked": [],
    "unfinished": [],
    "finished": []
}
allReport.map((i) => {
    filterReport[i.type].push(i)
})

class ShowPart extends React.Component {
    changeableStyle = {
        'unchecked': {
            'background': '#66A6F9',
        },
        'unfinished': {
            'background': '#FBD177',
        },
        'finished': {
            'background': '#49DFB8',
        }
    }
    render() {
        const report = this.props.dataItem
        const type = this.props.type
        return (
            <div className='text-sm'>
                <p className='w-24 text-left leading-7 pl-6 rounded-r-full text-dark-black' style={this.changeableStyle[type]}>{type === 'unchecked' ? '等待检查' : type === 'unfinished' ? '待出结果' : '已出结果'}</p>
                <div className='px-4'>
                    { report.map((i, _idx) => (
                        <div className='bg-white w-full p-4 my-4 rounded-xl' key={_idx}>
                            <p className='pb-2 text-6178EE'>
                                <span className='font-normal'>{new Date(i.time).toLocaleString('zh-CN', { dateStyle: 'long' })} {new Date(i.time).toLocaleString('zh-CN', { timeStyle: 'short', hour12: false })}</span>
                            </p>
                            <p className='text-light-black leading-6'>申请科室：{i.applicationDepartment}  医生：{i.applicationDoctor}</p>
                            <p className='text-light-black leading-6'>检查科室：{i.checkDepartment}  医生：{i.checkDoctor}</p>
                            <p className='text-light-black leading-6'>检查项目：{i.checkItem}</p>
                            {
                                type === 'unchecked' ? (
                                    <p className='text-dark-black leading-8 fnt-normal'>请于检查室<span className='text-6178EE'>{i.waitingRoom}</span>外取号等待</p>
                                ) : (<></>)
                            }
                            {
                                type === 'finished' ? (
                                    <p className='text-light-black leading-6'>已关联入病历单号：<span className='text-6178EE'>{i.medicalRecordId}</span></p>
                                ) : (<></>)
                            }
                        </div>
                    ))}
                </div>
            </div>
        )
    }
}
class App extends React.Component {
    componentDidMount() {
    }
    render() {
        return (
            <div className='flex-1 bg-[#C8DBFF33]'>
                <div className='pt-4'>
                    {
                        Object.keys(filterReport).map((i) => (
                            filterReport[i].length > 0 ? <ShowPart key={i} type={i} dataItem={filterReport[i]} /> : <></>
                        ))
                    }
                </div>
            </div>

        )
    }
}
export default App
