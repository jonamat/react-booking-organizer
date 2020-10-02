const theme = {
    palette: {
        primary: {
            main: '#000',
            light: '#2b2b2b',
        },
        secondary: {
            main: '#3f253b',
            light: 'rgba(63, 37, 59, 0.7)',
        },
    },
    typography: {
        allVariants: {
            fontFamily: "'Quicksand', sans-serif",
        },
        body1: {
            fontSize: 16,
        },
        body2: {
            fontSize: 16,
        },
        caption: {
            fontSize: 14,
        },
    },
    overrides: {
        MuiCssBaseline: {
            '@global': {
                '*::-webkit-scrollbar': {
                    '-webkit-appearance': 'none',
                },
                '*::-webkit-scrollbar:horizontal': {
                    height: '10px !important',
                },
                '*::-webkit-scrollbar:vertical': {
                    width: '10px !important',
                },
                '*::-webkit-scrollbar-thumb': {
                    borderRadius: 45,
                    border: '1px solid white !important',
                    backgroundColor: 'rgba(0, 0, 0, .3)',
                },
            },
        },
    },
};

export default theme;
