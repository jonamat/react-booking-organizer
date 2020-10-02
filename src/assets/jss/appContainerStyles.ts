import { makeStyles, Theme } from '@material-ui/core';

const useStyles = makeStyles((theme: Theme) => ({
    lateralDrawer: {
        height: 'calc(100vh - 64px)',
        zIndex: theme.zIndex.drawer,
    },
    fixedViewport: {
        flexGrow: 1,
        overflow: 'auto',
        height: 'calc(100vh - 56px)',
        [theme.breakpoints.up('sm')]: {
            height: 'calc(100vh - 64px)',
        },
    },
    toast: {
        borderRadius: theme.shape.borderRadius,
    },
}));

export default useStyles;
