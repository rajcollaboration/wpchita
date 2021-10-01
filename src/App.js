import React from 'react'
import {
    BrowserRouter as Router,
    Switch,
    Route
} from "react-router-dom"

import SignIn from "./Pages/SignIn"
import SignUp from "./Pages/SignUp"
import LockScreen from "./Pages/LockScreen"
import PrivateRoute from './Utils/PrivateRoute';
import PublicRoute from './Utils/PublicRoute';
import ResetPassword from "./Pages/ResetPassword"
import PhoneCode from "./Pages/PhoneCode"
import Layout from "./App/Layout"

function App() {
    return (
        <Router>
            <Switch>
                <PublicRoute path="/sign-in" component={SignIn}/>
                <Route path="/sign-up" component={SignUp}/>
                <Route path="/lock-screen" component={LockScreen}/>
                <Route path="/reset-password" component={ResetPassword}/>
                <Route path="/phone-code" component={PhoneCode}/>
                <PrivateRoute path="/dashboard" component={Layout}/>
                <PublicRoute path="/" component={SignIn}/>
            </Switch>
        </Router>
    )
}

export default App
