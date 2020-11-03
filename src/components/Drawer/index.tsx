import React, { FC } from 'react';
import { bindActionCreators } from 'redux';
import { useDispatch } from 'react-redux';
import { RouteComponentProps, withRouter } from 'react-router';
import {
    Drawer as MuiDrawer,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    Divider,
    Grid,
    SvgIcon,
    Typography,
} from '@material-ui/core';

import Logo from '../../assets/img/logo_white.svg';
import { openDialog } from '../../redux';
import Support from '../Support';
import { logout } from '../../utils';
import useStyles from './style';

// Icons
import CalendarViewDayRoundedIcon from '@material-ui/icons/CalendarViewDayRounded';
import SupervisorAccountRoundedIcon from '@material-ui/icons/SupervisorAccountRounded';
import BuildRoundedIcon from '@material-ui/icons/BuildRounded';
import FaceRoundedIcon from '@material-ui/icons/FaceRounded';
import ExitToAppRoundedIcon from '@material-ui/icons/ExitToAppRounded';
import HelpOutlineRoundedIcon from '@material-ui/icons/HelpOutlineRounded';
import CakeRoundedIcon from '@material-ui/icons/CakeRounded';

interface DrawerProps {
    toggleDrawer: () => void;
    drawerOpen: boolean;
    variant?: 'permanent' | 'persistent' | 'temporary';
}

const Drawer: FC<DrawerProps & RouteComponentProps> = ({ drawerOpen, toggleDrawer, history, variant }) => {
    const classes = useStyles();
    const actions = bindActionCreators({ openDialog }, useDispatch());

    const handleSupportClick = () => {
        actions.openDialog({
            title: 'Contatta il supporto tecnico',
            content: <Support />,
        });
    };

    return (
        <MuiDrawer variant={variant} data-testid="drawer" anchor="left" open={drawerOpen} onClose={toggleDrawer}>
            <Grid
                container
                wrap="nowrap"
                direction="column"
                alignItems="center"
                justify="center"
                className={classes.header}
            >
                <SvgIcon classes={{ root: classes.logo }}>
                    <Logo />
                </SvgIcon>

                <Typography className={classes.title} variant="h6" noWrap>
                    Gestionale {process.env.COMPANY_NAME.toUpperCase()}
                </Typography>
            </Grid>
            <div role="presentation" onClick={toggleDrawer}>
                <List data-testid="pages">
                    {[
                        {
                            label: 'Appuntamenti',
                            href: '/',
                            icon: <CalendarViewDayRoundedIcon color="primary" />,
                        },
                        {
                            label: 'Clienti',
                            href: '/customers',
                            icon: <SupervisorAccountRoundedIcon color="primary" />,
                        },
                        {
                            label: 'Servizi',
                            href: '/services',
                            icon: <BuildRoundedIcon color="primary" />,
                        },
                        {
                            label: 'Personale',
                            href: '/employees',
                            icon: <FaceRoundedIcon color="primary" />,
                        },
                        {
                            label: 'Compleanni',
                            href: '/birthdays',
                            icon: <CakeRoundedIcon color="primary" />,
                        },
                    ].map((item) => (
                        <ListItem button key={item.label} onClick={() => history.push(item.href)}>
                            <ListItemIcon>{item.icon}</ListItemIcon>
                            <ListItemText primary={item.label} />
                        </ListItem>
                    ))}
                </List>
                <Divider />
                <List>
                    {[
                        {
                            label: 'Logout',
                            onClick: logout,
                            icon: <ExitToAppRoundedIcon color="primary" />,
                        },
                        {
                            label: 'Supporto',
                            onClick: handleSupportClick,
                            icon: <HelpOutlineRoundedIcon color="primary" />,
                        },
                    ].map((item) => (
                        <ListItem button key={item.label} onClick={item.onClick}>
                            <ListItemIcon>{item.icon}</ListItemIcon>
                            <ListItemText primary={item.label} />
                        </ListItem>
                    ))}
                </List>
            </div>
        </MuiDrawer>
    );
};

export default withRouter(Drawer);
