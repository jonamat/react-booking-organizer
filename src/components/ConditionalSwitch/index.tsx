import React, { FC, Children, isValidElement } from 'react';
import { Switch } from 'react-router';

import RenderGroup from '../RenderGroup';

const ConditionalSwitch: FC = ({ children }) => {
    const routes = Children.map(children, (child) => {
        if (!isValidElement(child)) return;
        if (child?.type === RenderGroup) return !!child.props.condition ? child.props.children : null;
        else return child;
    });

    return <Switch>{routes}</Switch>;
};

export default ConditionalSwitch;
