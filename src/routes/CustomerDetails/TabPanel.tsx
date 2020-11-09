import React, { FC } from 'react';
import { Typography } from '@material-ui/core';

interface TabPanelProps {
    children?: React.ReactNode;
    index: any;
    value: any;
}

const TabPanel: FC<TabPanelProps> = ({ children, value, index, ...args }) => {
    return (
        <Typography component="div" role="tabpanel" hidden={value !== index} {...args}>
            {value === index && children}
        </Typography>
    );
};

export default TabPanel;
