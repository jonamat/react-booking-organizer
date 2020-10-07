import { MoveEmployeeCreator } from '../../types';

/**
 * Move and save in local storage the column position of a specific employee in the Reservation table
 * @param direction In which direction the employee moves
 * @param id Id of the employee to move
 */
const moveEmployee: MoveEmployeeCreator = (direction: 'BACK' | 'FORWARD', id: string) => (dispatch, getState): void => {
    const {
        status: { employeesOrder },
        database: { employees },
    } = getState();

    if (!employees) return;

    let localOrder = employeesOrder || employees.map((employee) => employee.id);

    const index = localOrder.indexOf(id);

    // Changes in employees
    if (index == -1) {
        localOrder = employees.map((employee) => employee.id);
    }

    switch (direction) {
        case 'BACK':
            if (index == 0) return;
            localOrder[index] = localOrder[index - 1];
            localOrder[index - 1] = id;
            break;
        case 'FORWARD':
            if (index == localOrder.length - 1) return;
            localOrder[index] = localOrder[index + 1];
            localOrder[index + 1] = id;
            break;
    }

    localStorage.setItem('employees_order', JSON.stringify(employeesOrder));

    dispatch({
        type: 'UPDATE_EMPLOYEES_ORDER',
        employeesOrder: [...localOrder],
    });
};

export default moveEmployee;
