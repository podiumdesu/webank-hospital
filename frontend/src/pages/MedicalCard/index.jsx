import React from 'react'
import { NavBar, Icon } from 'antd-mobile'
import { Link } from 'react-router-dom'
class App extends React.Component {
    render() {
        return (
            <NavBar
            mode="light"
            icon={<Link to='/'><Icon type="left" /></Link>}
          >电子就诊卡</NavBar>
        )
    }
}
export default App