import React, { useEffect } from 'react';
import { BrowserRouter, Switch } from "react-router-dom";
import { Redirect, Route } from "react-router"
import Home from './home';

export default function App() {
    return (
        <BrowserRouter>
            <Switch>
                <Route exact path='/home' component={Home}></Route>
                <Redirect from="/" to="/home" />
            </Switch>
        </BrowserRouter>
    );
}