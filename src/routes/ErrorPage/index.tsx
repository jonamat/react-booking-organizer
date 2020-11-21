import React, { FC } from 'react';
import { Grid, Typography, Button, Box } from '@material-ui/core';
import { FallbackProps } from 'react-error-boundary';

import ErrorDoodle from '../../assets/img/error.svg';
import useStyles from './style';

const ErrorPage: FC<FallbackProps> = ({ error, resetErrorBoundary }) => {
    const classes = useStyles();

    return (
        <Grid container direction="column" alignItems="center">
            <ErrorDoodle className={classes.doodle} />
            <Typography variant="h4" align="center">
                Ops! Qualcosa è andato storto
            </Typography>
            {error && (
                <Box p={2}>
                    <Typography variant="h6" align="center">
                        Errore
                    </Typography>
                    <Typography variant="body1" align="center">
                        {error.message}
                    </Typography>
                </Box>
            )}

            <Typography variant="h6" align="center" gutterBottom>
                Premere il tasto per tentare il ripristino
            </Typography>
            <Button variant="outlined" onClick={resetErrorBoundary}>
                Ripristina
            </Button>
        </Grid>
    );
};

export default ErrorPage;
