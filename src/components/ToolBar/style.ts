import { makeStyles, Theme } from '@material-ui/core';

const useStyles = makeStyles((theme: Theme) => ({
    container: {
        height: '100%',
        display: 'none',
        [theme.breakpoints.up('sm')]: {
            display: 'flex',
            width: 64, // Navbar height
            flexShrink: 0,
            backgroundColor: theme.palette.primary.main,
        },
    },
    icon: {
        marginTop: theme.spacing(1),
        marginBottom: theme.spacing(1),
        color: theme.palette.primary.contrastText,
    },
    divider: {
        marginTop: theme.spacing(1),
        marginBottom: theme.spacing(1),
        backgroundColor: theme.palette.primary.contrastText,
        alignSelf: 'stretch',
    },
}));

export default useStyles;
