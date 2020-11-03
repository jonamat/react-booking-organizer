import { makeStyles, Theme } from '@material-ui/core';

const useStyles = makeStyles((theme: Theme) => ({
    header: {
        height: 200,
        padding: theme.spacing(1),
        backgroundColor: theme.palette.primary.main,
    },
    logo: {
        width: '1.5em',
        height: '1.5em',
        margin: theme.spacing(2),
    },
    title: {
        fontFamily: '"EB Garamond", serif',
        fontSize: 20,
        letterSpacing: '0.03em',
        color: theme.palette.primary.contrastText,
    },
}));

export default useStyles;
