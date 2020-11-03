import { makeStyles, Theme } from '@material-ui/core';
import { CELLS_HEIGHT } from '../../config';
import { getReservationStatus } from '../../utils';

type BackgroundColorCodes = ReturnType<typeof getReservationStatus> | 'ERROR';

const createBackgroundColor = (status: BackgroundColorCodes): string => {
    switch (status) {
        case 'DONE':
            return '#d8d8d8';
        case 'ONGOING':
            return '#f5eec4';
        case 'UNINITIATED':
            return '#c4c8f5';
        case 'ERROR':
            return '#ffa0a0';
    }
};

export const useStyles = makeStyles<
    Theme,
    { showDetails?: boolean; occupiedCellsSpace: number; reservationStatus: BackgroundColorCodes }
>((theme) => ({
    container: {
        position: 'relative',
        top: 3,
        zIndex: 1,
        overflow: 'auto',
        margin: 'auto',
        height: ({ occupiedCellsSpace }): number =>
            CELLS_HEIGHT * occupiedCellsSpace - /* top-bottom space */ 6 - /* box shadow */ 1,
        width: ({ showDetails }): string => (showDetails ? 'auto' : '95%'),
        transition: theme.transitions.create('background-color'),
        cursor: 'pointer',
        backgroundColor: ({ reservationStatus }): string => createBackgroundColor(reservationStatus),
        '&:hover': {
            backgroundColor: '#d1d5ee',
        },
    },
    spacing: {
        padding: theme.spacing(1),
    },
    date: {
        color: '#f50057',
    },
    name: {
        fontWeight: theme.typography.fontWeightMedium,
    },
    ongoing: {
        fontWeight: theme.typography.fontWeightMedium,
        color: '#f44336',
        textTransform: 'uppercase',
    },
    service: {
        color: '#0020a8',
    },
}));

export default useStyles;
