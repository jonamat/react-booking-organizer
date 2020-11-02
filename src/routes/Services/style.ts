import { makeStyles, Theme } from '@material-ui/core';

const useStyles = makeStyles((theme: Theme) => ({
    container: {
        height: '100%',

        /* MaterialTable has a horrible styling system. Override here  */
        // root
        '&>.MuiPaper-root': {
            display: 'flex',
            flexDirection: 'column',
            height: '100%',
            width: '100%',

            // header
            '&>.MuiToolbar-root': {
                // search field
                '&>.MuiFormControl-root': {
                    minWidth: 'inherit',
                    width: 120,
                    transition: theme.transitions.create(['width']),
                    [theme.breakpoints.up('sm')]: {
                        width: 150,
                        '&:focus-within': {
                            width: 250,
                        },
                    },
                },
            },

            // Table rows
            '& div:nth-child(2)': {
                flexGrow: 1,
            },

            // Icons
            '& .material-icons.MuiIcon-root': {
                color: theme.palette.primary.light,
            },
        },
    },
}));

export default useStyles;
