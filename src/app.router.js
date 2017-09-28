import React from 'react';
import PropTypes from 'prop-types';
import { Router, Route, hashHistory, Redirect } from 'react-router';

import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';

import HeaderBarComponent from 'd2-ui/lib/app-header/HeaderBar';
import headerBarStore$ from 'd2-ui/lib/app-header/headerBar.store';
import withStateFrom from 'd2-ui/lib/component-helpers/withStateFrom';

import AppTheme from './layout/theme';

import Snackbar from './layout/Snackbar.component';
import Sidebar from './layout/Sidebar.component';

import ProfileSettings from './profileSettings/profileSettings.component';
import AccountSettings from './accountSettings/accountSettings.component';
import UserSettings from './userSettings/userSettings.component';
import ViewProfile from './viewProfile/viewProfile.component';

const HeaderBar = withStateFrom(headerBarStore$, HeaderBarComponent);

function WrAppadApp(props) {
    return <div><Sidebar currentSection={props.routes[1].path} />{props.children}</div>;
}
WrAppadApp.propTypes = { routes: PropTypes.array.isRequired, children: PropTypes.any.isRequired };

class AppRouter extends React.Component {
    constructor(props) {
        super(props);

        const d2 = this.props.d2;
        this.getTranslation = d2.i18n.getTranslation.bind(d2.i18n);
    }

    getChildContext() {
        return {
            d2: this.props.d2,
            muiTheme: AppTheme,
        };
    }

    render() {
        return (
            <MuiThemeProvider muiTheme={AppTheme} >
                <div className="app-wrapper">
                    <HeaderBar />
                    <Snackbar />
                    <Router history={hashHistory}>
                        <Route component={WrAppadApp}>
                            <Route path="userSettings" component={UserSettings} />
                            <Route path="profileSettings" component={ProfileSettings} />
                            <Route path="accountSettings" component={AccountSettings} />
                            <Route path="viewProfile" component={ViewProfile} />
                            <Redirect from="/" to="/viewProfile" />
                        </Route>
                    </Router>
                </div>
            </MuiThemeProvider>
        );
    }
}

AppRouter.propTypes = { d2: PropTypes.object.isRequired };
AppRouter.childContextTypes = { d2: PropTypes.object, muiTheme: PropTypes.object };

export default AppRouter;
