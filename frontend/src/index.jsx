// import React from 'react';
// import { render } from 'react-dom';
// import 'antd-mobile/dist/antd-mobile.css';
// import MainPage from '@/pages/MainPage/index';
// import '@/styles/main.css';

// render(<MainPage></MainPage>,document.getElementById('root'));

import React from 'react'
import ReactDOM from 'react-dom'
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom'
import routesConfig from './routes/index'



ReactDOM.render(
    <Router>
        <Switch>
            {routesConfig.map((route, i) => (
                <Route
                    key={i}
                    path={route.path}
                    render={props => (
                        <route.component {...props} routes={route.routes} />
                    )}
                />
            ))}
        </Switch>
    </Router>,
    document.getElementById('root')
)