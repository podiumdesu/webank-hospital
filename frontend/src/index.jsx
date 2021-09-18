import React from 'react'
import ReactDOM from 'react-dom'
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom'
import routesConfig from './routes/index'
import 'antd-mobile/dist/antd-mobile.css';
import '@/styles/main.css';


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