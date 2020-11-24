import { makeStyles, Theme } from '@material-ui/core';

const useStyles = makeStyles((theme: Theme) => ({
    root: {
        width: 'auto',
        cursor: 'pointer',
        '&:hover': {
            backgroundColor: '#f0f8ff',
        },
    },
    spacing: {
        padding: theme.spacing(2),
    },
    label: {
        fontWeight: theme.typography.fontWeightMedium,
    },
    strong: {
        fontWeight: theme.typography.fontWeightMedium,
    },
    dialog: {
        overflow: 'overlay',
        minWidth: 295,

        [theme.breakpoints.up('sm')]: {
            minWidth: 396,
        },
    },
    day: {
        paddingBottom: theme.spacing(1),
    },
    pickers: {
        padding: theme.spacing(1, 0, 1, 0),
    },
}));

export default useStyles;
