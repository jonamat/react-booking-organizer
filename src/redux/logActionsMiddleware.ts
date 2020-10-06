import { Middleware } from 'redux';

/**
 * Redux middleware for logging store updates in console
 */
const logActionsMiddleware: Middleware = () => (next) => (action) => {
    if (action.type[0] !== '@')
        console.log(
            '%cStore updated',
            'background-color: #e0e2f7; color: #000; border-radius: 2px; padding: 2px 4px; font-weight: 600;',
            action,
        );
    next(action);
};

export default logActionsMiddleware;
