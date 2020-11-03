import React, { FC, ReactNode } from 'react';
import { RouteComponentProps, withRouter } from 'react-router';
import { connect, ConnectedProps } from 'react-redux';
import { Tooltip, SvgIcon, AppBar, Toolbar, IconButton, Typography, TextField, Badge } from '@material-ui/core';
import Autocomplete from '@material-ui/lab/Autocomplete';

import { Customer, RootState } from '../../types';
import { getReservationsByDate } from '../../utils';
import Logo from '../../assets/img/logo_white.svg';
import useStyles from './style';

// Icons
import AssignmentIcon from '@material-ui/icons/Assignment';
import SearchIcon from '@material-ui/icons/Search';

const mapStateToProps = (state: RootState) => ({
    reservations: state.database.reservations,
    customers: state.database.customers,
});
const connector = connect(mapStateToProps);
type ReduxProps = ConnectedProps<typeof connector>;

interface NavbarProps extends RouteComponentProps, ReduxProps {
    toggleDrawer: () => void;
}

const Navbar: FC<NavbarProps> = ({ customers, reservations, history, toggleDrawer }) => {
    const classes = useStyles();

    if (!reservations || !customers) {
        console.warn('Internal error - Resources loading logic broken');
        reservations = reservations || [];
        customers = customers || [];
    }

    const reservationsToday = getReservationsByDate(reservations, new Date()).length;

    const handleCustomerSearch = (customer: Customer | null) => {
        customer && history.push('/customer-details/' + customer.id);
    };

    return (
        <div className={classes.grow} data-testid="navbar">
            <AppBar position="sticky">
                <Toolbar classes={{ gutters: classes.navbarGutters }}>
                    <IconButton
                        className={classes.drawerButton}
                        edge="start"
                        onClick={toggleDrawer}
                        color="inherit"
                        data-testid="drawer-btn"
                    >
                        <SvgIcon>
                            <Logo />
                        </SvgIcon>
                    </IconButton>

                    <SvgIcon classes={{ root: classes.logo }}>
                        <Logo />
                    </SvgIcon>

                    <Typography className={classes.title} variant="h6" noWrap>
                        Gestionale {process.env.COMPANY_NAME.toUpperCase()}
                    </Typography>
                    <div className={classes.grow} />
                    <div className={classes.search}>
                        <Autocomplete
                            classes={{
                                popupIndicator: classes.autocompleteIndicators,
                                clearIndicator: classes.autocompleteIndicators,
                            }}
                            options={customers}
                            getOptionLabel={(customer: Customer): string =>
                                customer.name +
                                (customer.surname ? ' ' + customer.surname : '') +
                                (customer.additionalIdentifier ? ' ' + customer.additionalIdentifier : '')
                            }
                            autoHighlight
                            /**
                             * This actually does not work due to a Autocomplete bug
                             * https://github.com/mui-org/material-ui/issues/20286
                             * use onMouseDownCapture workaround
                             */
                            openOnFocus={false}
                            clearText="Cancella"
                            closeText="Chiudi"
                            noOptionsText="Cliente non trovato"
                            onChange={(_event: any, customer: Customer | null) => handleCustomerSearch(customer)}
                            renderInput={(params): ReactNode => (
                                <TextField
                                    {...params}
                                    classes={{
                                        root: classes.textField,
                                    }}
                                    InputProps={{
                                        ...params.InputProps,
                                        disableUnderline: true,
                                        startAdornment: <SearchIcon />,
                                        classes: {
                                            root: classes.input,
                                        },
                                        onMouseDownCapture: (e) => e.stopPropagation(),
                                    }}
                                    inputProps={{
                                        ...params.inputProps,
                                        'data-testid': 'search-field',
                                        id: 'Autocomplete',
                                    }}
                                    placeholder="Cerca…"
                                />
                            )}
                        />
                    </div>
                    <Tooltip title="Appuntamenti oggi">
                        <IconButton color="inherit" onClick={() => history.push('/')}>
                            <Badge badgeContent={reservationsToday} color="secondary">
                                <AssignmentIcon data-testid="today-btn" />
                            </Badge>
                        </IconButton>
                    </Tooltip>
                </Toolbar>
            </AppBar>
        </div>
    );
};

export default connector(withRouter(Navbar));
