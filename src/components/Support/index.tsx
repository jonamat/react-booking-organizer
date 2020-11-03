import React, { FC } from 'react';
import { useDispatch } from 'react-redux';
import { bindActionCreators } from 'redux';
import {
    Grid,
    DialogContent,
    List,
    DialogContentText,
    ListItem,
    ListItemIcon,
    ListItemText,
    DialogActions,
    Button,
} from '@material-ui/core';

import { closeDialog } from '../../redux';

// Icons
import PhoneIphoneIcon from '@material-ui/icons/PhoneIphone';
import MailIcon from '@material-ui/icons/Mail';
import WhatsAppIcon from '@material-ui/icons/WhatsApp';
import TelegramIcon from '@material-ui/icons/Telegram';

const Support: FC<any> = () => {
    const actions = bindActionCreators({ closeDialog }, useDispatch());

    return (
        <>
            <DialogContent>
                <DialogContentText>
                    Per qualsiasi problema puoi contattare il supporto tecnico tramite questi canali:
                </DialogContentText>
                <Grid container>
                    <Grid item xs={12} sm={6}>
                        <List disablePadding>
                            {[
                                {
                                    label: 'Cellulare',
                                    value: process.env.PHONE,
                                    icon: <PhoneIphoneIcon color="primary" />,
                                },
                                {
                                    label: 'Email',
                                    value: process.env.EMAIL,
                                    icon: <MailIcon color="primary" />,
                                },
                            ].map((item, index) => (
                                <ListItem key={index}>
                                    <ListItemIcon>{item.icon}</ListItemIcon>
                                    <ListItemText primary={item.value} secondary={item.label} />
                                </ListItem>
                            ))}
                        </List>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <List disablePadding>
                            {[
                                {
                                    label: 'WhatsApp',
                                    value: process.env.PHONE,
                                    icon: <WhatsAppIcon color="primary" />,
                                },
                                {
                                    label: 'Telegram',
                                    value: process.env.TELEGRAM,
                                    icon: <TelegramIcon color="primary" />,
                                },
                            ].map((item, index) => (
                                <ListItem key={index}>
                                    <ListItemIcon>{item.icon}</ListItemIcon>
                                    <ListItemText primary={item.value} secondary={item.label} />
                                </ListItem>
                            ))}
                        </List>
                    </Grid>
                </Grid>
            </DialogContent>
            <DialogActions>
                <Button onClick={actions.closeDialog} color="primary" autoFocus>
                    Chiudi
                </Button>
            </DialogActions>
        </>
    );
};

export default Support;
