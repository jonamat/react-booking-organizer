import { makeStyles, Theme, fade } from '@material-ui/core';

const useStyles = makeStyles((theme: Theme) => ({
    grow: {
        flexGrow: 2,
    },
    navbarGutters: {
        padding: theme.spacing(0, 1, 0, 2),
    },
    drawerButton: {
        display: 'block',
        marginRight: theme.spacing(2),
        [theme.breakpoints.up('sm')]: {
            display: 'none',
        },
    },
    logo: {
        display: 'none',
        width: '1.5em',
        height: '1.5em',
        marginRight: theme.spacing(3),
        [theme.breakpoints.up('sm')]: {
            display: 'block',
        },
    },
    title: {
        display: 'none',
        fontFamily: '"EB Garamond", serif',
        fontSize: 25,
        letterSpacing: '0.03em',
        [theme.breakpoints.up('sm')]: {
            display: 'block',
        },
    },
    search: {
        flexGrow: 1,
        padding: theme.spacing(0, 2),
        marginRight: theme.spacing(1),
        borderRadius: theme.shape.borderRadius,
        backgroundColor: fade(theme.palette.common.white, 0.3),
        transition: theme.transitions.create(['opacity', 'width']),
        opacity: 0.7,
        '&:hover, &:focus-within': {
            backgroundColor: fade(theme.palette.common.white, 0.3),
            opacity: 1,
        },
        width: '100%',
        [theme.breakpoints.up('sm')]: {
            marginLeft: theme.spacing(3),
            width: 80,
            '&:focus-within': {
                width: 250,
            },
        },
    },
    autocompleteIndicators: {
        color: 'inherit',
    },
    textField: {
        width: '100%',
        margin: theme.spacing(1, 0, 1, 0),
    },
    input: {
        flexWrap: 'nowrap',
        color: 'inherit',
        width: '100%',
    },
}));

export default useStyles;
