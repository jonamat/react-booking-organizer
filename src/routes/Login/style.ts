import { makeStyles, Theme } from '@material-ui/core';

const useStyles = makeStyles((theme: Theme) => ({
    logo: {
        margin: theme.spacing(5, 2, 3, 2),
        height: 75,
        width: 75,
        [theme.breakpoints.up('sm')]: {
            margin: theme.spacing(8, 2, 3, 2),
            height: 100,
            width: 100,
        },
    },
    form: {
        width: '100%',
        padding: theme.spacing(1),
    },
    submit: {
        margin: theme.spacing(3, 0, 2),
    },
}));

export default useStyles;
