import { makeStyles, Theme } from '@material-ui/core';

const useStyles = makeStyles((theme: Theme) => ({
    container: {
        padding: theme.spacing(2),
    },
    divider: {
        marginTop: theme.spacing(1),
        marginBottom: theme.spacing(1),
    },
    form: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
    },
    field: {
        marginTop: theme.spacing(1),
        marginBottom: theme.spacing(1),
        width: '100%',
        [theme.breakpoints.up('md')]: {
            width: '80%',
        },
    },
    label: {
        backgroundColor: 'white',
        paddingLeft: 5,
        paddingRight: 5,
    },
    submitButton: {
        '& button': {
            margin: theme.spacing(1),
        },
        alignSelf: 'flex-end',
        [theme.breakpoints.up('md')]: {
            alignSelf: 'auto',
        },
    },
}));

export default useStyles;
