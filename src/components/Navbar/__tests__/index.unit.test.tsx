/**
 * Unit test suite
 *
 * Target: Navbar component
 * Tests:
 * - Autocomplete integration
 * - Snapshot matching
 * - Functionality
 */

// Test resources
import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import renderer from 'react-test-renderer';
import { createMemoryHistory } from 'history';
import { StylesProvider, createGenerateClassName } from '@material-ui/core';

// Test configuration
import { Customer, Reservation } from '../../../types';

// Component to test
import Navbar from '../';

const customers: Array<Customer> = [
    {
        id: 'customer-FAKE-ID',
        name: 'customer-FAKE-NAME',
        additionalIdentifier: 'customer-FAKE-IDENTIFIER',
    },
];
const mockReservation: Reservation = {
    id: 'reservation-FAKE-ID',
    date: new Date(),
    serviceId: 'service-FAKE-ID',
    customerId: 'customer-FAKE-ID',
    employeeId: 'employee-FAKE-ID',
    notes: 'FAKE-NOTES',
};
const reservations: Array<Reservation> = [mockReservation];

/* -------------------------------------------------------------------------- */
/*                                    Mocks                                   */
/* -------------------------------------------------------------------------- */

jest.mock('react-router', () => ({
    withRouter: (component) => component,
}));
jest.mock('react-redux', () => ({
    connect: () => (component) => component,
}));
jest.mock('../../../utils', () => ({
    getReservationsByDate: function (): Array<Reservation> {
        return [mockReservation];
    },
}));
const history = {
    push: jest.fn(),
};
const mockToggleDrawer = jest.fn();

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
    return render(
        <Navbar
            history={history}
            customers={customers}
            reservations={reservations}
            toggleDrawer={mockToggleDrawer}
            {...props}
        />,
    );
};

/* -------------------------------------------------------------------------- */
/*                                    Tests                                   */
/* -------------------------------------------------------------------------- */

describe('Navbar', () => {
    describe('Autocomplete', () => {
        it('sorts customers properly', () => {
            const { getByTestId } = renderComponent();
            fireEvent.click(getByTestId('search-field'));
            fireEvent.input(getByTestId('search-field'), { target: { value: 'customer' } });
            fireEvent.keyDown(getByTestId('search-field'), { key: 'Enter', code: 'Enter' });
            expect(getByTestId('search-field')).toHaveValue('customer-FAKE-NAME customer-FAKE-IDENTIFIER');
        });

        it('redirects to customer-details page when a customer is triggered from list', () => {
            const { getByTestId } = renderComponent();
            fireEvent.click(getByTestId('search-field'));
            fireEvent.input(getByTestId('search-field'), { target: { value: 'customer' } });
            fireEvent.keyDown(getByTestId('search-field'), { key: 'Enter', code: 'Enter' });
            expect(history.push).toBeCalledWith('/customer-details/customer-FAKE-ID');
        });
    });

    describe('Today button', () => {
        it('redirects to Today page on Today button click', () => {
            const { getByTestId } = renderComponent();
            fireEvent.click(getByTestId('today-btn'));
            expect(history.push).toBeCalledWith('/');
        });

        it('badge shows correct reservations number', () => {
            const { getByTestId } = renderComponent();
            expect(getByTestId('today-btn').nextSibling).toHaveTextContent('1');
        });
    });

    describe('Drawer button', () => {
        it('calls drawer at click', () => {
            const { getByTestId } = renderComponent();
            fireEvent.click(getByTestId('drawer-btn'));
            expect(mockToggleDrawer).toHaveBeenCalled();
        });
    });

    it('matches snapshot', () => {
        const history = createMemoryHistory();
        const snapshot = renderer
            .create(
                <StylesProvider generateClassName={createGenerateClassName({ disableGlobal: true })}>
                    {/* @ts-ignore */}
                    <Navbar history={history} customers={customers} reservations={reservations} />
                </StylesProvider>,
            )
            .toJSON();
        expect(snapshot).toMatchSnapshot();
    });
});
