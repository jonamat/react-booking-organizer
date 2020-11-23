module.exports = {
    Droppable: ({ children }) =>
        children(
            {
                draggableProps: {
                    style: {},
                },
                innerRef: () => undefined,
            },
            {},
        ),
    Draggable: ({ children }) =>
        children(
            {
                draggableProps: {
                    style: {},
                },
                innerRef: () => undefined,
            },
            {},
        ),
    DragDropContext: ({ children }) => children,
};
