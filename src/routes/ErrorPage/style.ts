import { makeStyles, Theme } from '@material-ui/core';

const useStyles = makeStyles((theme: Theme) => ({
    doodle: {
        margin: theme.spacing(2, 1, 2, 1),
        height: 'auto',
        maxHeight: 300,
        width: 'auto',
    },
}));

export default useStyles;
