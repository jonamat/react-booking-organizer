/**
 * Unit test suite
 *
 * Target: Reservations component
 * Tests:
 * - Data position correctness
 * - Redirection
 * - Snapshot matching
 * - Functionality
 */

// Test resources
import React from 'react';
import renderer from 'react-test-renderer';
import { StylesProvider, createGenerateClassName } from '@material-ui/core';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';

// Test configuration
import { __mockEmployees, __mockReservations } from '../../../__mocks__/react-redux';

// Component to test
import ReservationsTable from '../ReservationsTable';

const defProps = {
    employees: __mockEmployees,
    reservations: __mockReservations,
    handleNewReservation: () => undefined,
    date: __mockReservations[0].date,
    employeesOrder: null,
    moveEmployee: () => undefined,
};

/* -------------------------------------------------------------------------- */
/*                                    Mocks                                   */
/* -------------------------------------------------------------------------- */
jest.mock('react-router', () => ({
    withRouter: (component) => component,
}));
jest.mock('../../../components/ReservationPanel', () => () => null);

/* -------------------------------------------------------------------------- */
/*                              Bridge operations                             */
/* -------------------------------------------------------------------------- */

beforeEach(() => {
    jest.clearAllMocks();
});

/* -------------------------------------------------------------------------- */
/*                               Render wrapper                               */
/* -------------------------------------------------------------------------- */

/**
 * Render the component with the custom configuration
 * @param props Component props
 */
const renderComponent = (props?) => {
    return render(<ReservationsTable {...defProps} {...props} />);
};

/* -------------------------------------------------------------------------- */
/*                                    Tests                                   */
/* -------------------------------------------------------------------------- */

describe('ReservationsTable', () => {
    describe('Data position', () => {
        it('shows correct data', () => {
            const { queryAllByTestId } = renderComponent();

            // Test employees
            __mockEmployees.forEach((employee) => expect(queryAllByTestId(employee.id)?.length).toBeTruthy());

            // Test reservations
            expect(queryAllByTestId('reservation-panel-container')?.length).toBe(1);
        });
    });

    it('matches snapshot', () => {
        const snapshot = renderer
            .create(
                <StylesProvider generateClassName={createGenerateClassName({ disableGlobal: true })}>
                    <ReservationsTable {...defProps} />
                </StylesProvider>,
            )
            .toJSON();
        expect(snapshot).toMatchSnapshot();
    });
});
