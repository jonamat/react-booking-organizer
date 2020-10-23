import React, { FC, useRef, FormEvent, useState } from 'react';
import {
    Container,
    Button,
    TextField,
    FormControlLabel,
    Checkbox,
    Grid,
    Typography,
    CircularProgress,
    SvgIcon,
} from '@material-ui/core/';
import { bindActionCreators } from 'redux';
import { useDispatch } from 'react-redux';
import { toast } from 'react-toastify';

import { login } from '../../utils';
import { openDialog } from '../../redux';
import Logo from '../../assets/img/logo_black.svg';
import Support from '../../components/Support';
import useStyles from './style';
import { SANDBOX_USERNAME, SANDBOX_PASSWORD } from '../../config';

const Login: FC = () => {
    const classes = useStyles();
    const [loading, isLoading] = useState<boolean>(false);
    const inputForm = useRef<HTMLFormElement>(null);
    const actions = bindActionCreators({ openDialog }, useDispatch());
    const isSandbox = process.env.TARGET_DB === 'sandbox';

    const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (!inputForm.current) return;

        // Disable user interactions
        isLoading(true);

        // AuthListener will redirect user to protected routes
        login(new FormData(inputForm.current)).catch((error) => {
            toast.error(error.message);
            isLoading(false);
        });
    };

    const handleSupportClick = () =>
        actions.openDialog({
            title: 'Contatta il supporto tecnico',
            content: <Support />,
        });

    return (
        <Container maxWidth="xs">
            <Grid container direction="column" alignItems="center" justify="center" data-testid="login-page">
                <SvgIcon className={classes.logo}>
                    <Logo />
                </SvgIcon>
                <Typography align="center" variant="h5">
                    Gestionale {process.env.COMPANY_NAME.toUpperCase()}
                </Typography>
                <form className={classes.form} ref={inputForm} onSubmit={handleSubmit}>
                    <TextField
                        variant="outlined"
                        margin="normal"
                        required
                        fullWidth
                        label="Email"
                        name="email"
                        autoComplete="email"
                        autoFocus
                        inputProps={{ 'data-testid': 'email-fld' }}
                        disabled={loading}
                        defaultValue={isSandbox ? SANDBOX_USERNAME : ''}
                    />
                    <TextField
                        variant="outlined"
                        margin="normal"
                        required
                        fullWidth
                        name="password"
                        label="Password"
                        type="password"
                        autoComplete="current-password"
                        inputProps={{ 'data-testid': 'password-fld' }}
                        disabled={loading}
                        defaultValue={isSandbox ? SANDBOX_PASSWORD : ''}
                    />
                    <FormControlLabel
                        control={<Checkbox value="remember" name="remember" disabled={loading} color="primary" />}
                        label="Ricordami"
                    />
                    <Button
                        type="submit"
                        fullWidth
                        variant="contained"
                        color="primary"
                        startIcon={loading ? <CircularProgress size={20} /> : null}
                        className={classes.submit}
                        data-testid="submit-btn"
                        disabled={loading}
                    >
                        {loading ? 'Caricamento' : 'Login'}
                    </Button>
                    <Typography variant="subtitle1" align="center" onClick={handleSupportClick}>
                        Non ricordi la password? Richiedi il supporto
                    </Typography>
                </form>
            </Grid>
        </Container>
    );
};

export default Login;
