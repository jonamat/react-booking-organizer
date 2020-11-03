import React, { FC } from 'react';
import { Grid } from '@material-ui/core';

const fullPageStyles = {
    position: 'absolute',
    height: '100vh',
    width: '100vw',
};

const Center: FC<any> = ({ children, fullPage, ...args }) => {
    const containerProps = {
        style: fullPage ? fullPageStyles : undefined,
        ...args,
    };
    return (
        <Grid container justify="center" alignItems="center" {...containerProps}>
            <Grid item>{children}</Grid>
        </Grid>
    );
};

export default Center;
