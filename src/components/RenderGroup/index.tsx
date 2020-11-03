import React, { FC } from 'react';

const RenderGroup: FC<{ condition: any }> = ({ children, condition }) => (!!condition ? <>{children}</> : null);

export default RenderGroup;
