import { makeStyles, Theme } from '@material-ui/core';
import { CELLS_HEIGHT, CELLS_WIDTH, HEAD_COL_WIDTH } from '../../config';

const useStyles = makeStyles((theme) => ({
    container: {
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
    },
    header: {
        padding: theme.spacing(2, 1, 1, 1),
        flexShrink: 0,
    },
    datePicker: {
        display: 'none',
    },
    grow: {
        flexGrow: 1,
    },
    table: {
        display: 'flex',
        height: '100%',
        overflow: 'hidden',
        padding: theme.spacing(1),
    },
}));

export const useReservationTableStyles = makeStyles((theme: Theme) => ({
    tableContainer: {
        overflow: 'auto',
        borderRadius: theme.shape.borderRadius,
    },
    table: {
        width: '100%',
        tableLayout: 'fixed',
        borderCollapse: 'collapse',
        textAlign: 'center',
        '& td, & th': {
            padding: 0,
            height: CELLS_HEIGHT,
            width: CELLS_WIDTH,
        },
        // Fixed header
        '& th': {
            backgroundColor: theme.palette.primary.main,
            color: theme.palette.primary.contrastText,
            zIndex: 2,
            // Hours col
            '&:first-child': {
                width: HEAD_COL_WIDTH,
                position: 'sticky',
                left: 0,
                zIndex: 4,
            },
        },
        '& thead tr': {
            '& th': {
                position: 'sticky',
                top: 0,
            },
        },
        // Hours literals
        '& td:first-child': {
            backgroundColor: theme.palette.primary.light,
            color: theme.palette.primary.contrastText,
            position: 'sticky',
            left: 0,
            width: HEAD_COL_WIDTH,
            zIndex: 2,
        },
        // Row highlight
        '& tr:hover': {
            '& td': {
                [theme.breakpoints.up('sm')]: {
                    backgroundColor: '#b4bbe4',
                    cursor: 'default',
                },
            },
        },
    },
    // Prevent cell growing
    fixHeightWrapper: {
        height: CELLS_HEIGHT,
    },
    headerText: {
        fontWeight: theme.typography.fontWeightMedium,
    },
    notOnDutyIcon: {
        color: '#e2e2e2',
    },
    moveIcon: {
        color: '#2e2e2e',
        '&:hover': {
            color: '#b2b2b2',
        },
    },
}));

export default useStyles;
