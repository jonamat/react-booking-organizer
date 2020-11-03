import React, { FC } from 'react';
import { connect, ConnectedProps } from 'react-redux';
import { bindActionCreators } from 'redux';
import { RouteComponentProps, withRouter } from 'react-router';
import { Divider, Tooltip, IconButton, Grid, Badge } from '@material-ui/core';

import { logout } from '../../utils';
import { openDialog } from '../../redux';
import Support from '../Support';
import useStyles from './style';

// Icons
import CalendarViewDayRoundedIcon from '@material-ui/icons/CalendarViewDayRounded';
import SupervisorAccountRoundedIcon from '@material-ui/icons/SupervisorAccountRounded';
import BuildRoundedIcon from '@material-ui/icons/BuildRounded';
import FaceRoundedIcon from '@material-ui/icons/FaceRounded';
import ExitToAppRoundedIcon from '@material-ui/icons/ExitToAppRounded';
import HelpOutlineRoundedIcon from '@material-ui/icons/HelpOutlineRounded';
import CakeRoundedIcon from '@material-ui/icons/CakeRounded';
import { RootState } from '../../types';

const mapStateToProps = (state: RootState) => ({
    birthdaysToday: state.status.birthdaysToday,
});
const mapDispatchToProps = (dispatch) => bindActionCreators({ openDialog }, dispatch);
const connector = connect(mapStateToProps, mapDispatchToProps);
type ReduxProps = ConnectedProps<typeof connector>;

const Toolbar: FC<RouteComponentProps & ReduxProps> = ({ history, openDialog, birthdaysToday }) => {
    const classes = useStyles();

    const handleSupportClick = () =>
        openDialog({
            title: 'Contatta il supporto tecnico',
            content: <Support />,
        });

    return (
        <Grid
            className={classes.container}
            container
            direction="column"
            alignItems="center"
            data-testid="toolbar"
            wrap="nowrap"
        >
            {[
                {
                    label: 'Appuntamenti',
                    href: '/',
                    icon: <CalendarViewDayRoundedIcon />,
                },
                {
                    label: 'Clienti',
                    href: '/customers',
                    icon: <SupervisorAccountRoundedIcon />,
                },
                {
                    label: 'Servizi',
                    href: '/services',
                    icon: <BuildRoundedIcon />,
                },
                {
                    label: 'Personale',
                    href: '/employees',
                    icon: <FaceRoundedIcon />,
                },
                {
                    label: 'Compleanni',
                    href: '/birthdays',
                    icon: (
                        <Badge badgeContent={birthdaysToday} color="secondary">
                            <CakeRoundedIcon data-testid="birthday-toolbar-btn" />
                        </Badge>
                    ),
                },
            ].map(({ label, href, icon }) => (
                <Tooltip key={label} title={label}>
                    <IconButton className={classes.icon} onClick={() => history.push(href)}>
                        {icon}
                    </IconButton>
                </Tooltip>
            ))}

            <Divider variant="middle" className={classes.divider} />
            {[
                {
                    label: 'Logout',
                    onClick: logout,
                    icon: <ExitToAppRoundedIcon />,
                },
                {
                    label: 'Supporto',
                    onClick: handleSupportClick,
                    icon: <HelpOutlineRoundedIcon />,
                },
            ].map(({ label, onClick, icon }) => (
                <Tooltip key={label} title={label}>
                    <IconButton className={classes.icon} onClick={onClick}>
                        {icon}
                    </IconButton>
                </Tooltip>
            ))}
        </Grid>
    );
};

export default connector(withRouter(Toolbar));
