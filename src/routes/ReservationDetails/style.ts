import { makeStyles, Theme } from '@material-ui/core';

const useStyles = makeStyles((theme: Theme) => ({
    container: {
        padding: theme.spacing(2),
    },
    header: {
        display: 'flex',
        paddingTop: theme.spacing(2),
        paddingBottom: theme.spacing(2),
    },
    subtitle: {
        fontWeight: theme.typography.fontWeightMedium,
    },
    grow: {
        flexGrow: 1,
    },
}));

export default useStyles;
