/**
 * Unit test suite
 *
 * Target: CustomerDetails component
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
import { render, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';

// Test configuration
import { __mockCustomers } from '../../../__mocks__/react-redux';

// Component to test
import CustomerDetails from '..';

const match = {
    params: {
        customerId: __mockCustomers[0].id,
    },
};

/* -------------------------------------------------------------------------- */
/*                                    Mocks                                   */
/* -------------------------------------------------------------------------- */

jest.mock('../../../utils', () => ({
    deleteCustomer: jest.fn(() => Promise.resolve()),
}));
jest.mock('../../../components/ReservationPanel', () => () => null);
const mockOpenDialog = jest.fn();
jest.mock('redux', () => ({
    ...(jest.requireActual('redux') as Record<string, any>),
    bindActionCreators: () => ({
        openDialog: mockOpenDialog,
        closeDialog: () => undefined,
    }),
}));
const history = {
    push: jest.fn(),
};

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
    return render(<CustomerDetails history={history} match={match} {...props} />);
};

/* -------------------------------------------------------------------------- */
/*                                    Tests                                   */
/* -------------------------------------------------------------------------- */

describe('CustomerDetails', () => {
    describe('Data accuracy', () => {
        it('shows correct data', () => {
            const { getByText, queryAllByText } = renderComponent();

            expect(getByText('Nome').previousElementSibling).toHaveTextContent(
                __mockCustomers[0].name + ' ' + __mockCustomers[0].surname || '',
            );
            expect(getByText('Identificatore aggiuntivo').previousElementSibling).toHaveTextContent(
                __mockCustomers[0].additionalIdentifier || '---',
            );
            expect(getByText('Telefono').previousElementSibling).toHaveTextContent(__mockCustomers[0].phone || '---');
            expect(getByText('Note').previousElementSibling).toHaveTextContent(__mockCustomers[0].notes || '---');
            expect(queryAllByText('Appuntamenti passati')[0].previousElementSibling).toHaveTextContent('1');
            expect(queryAllByText('Appuntamenti futuri')[0].previousElementSibling).toHaveTextContent('1');
        });
    });

    describe('User experience', () => {
        it('redirects users at "Add Reservation" button click', () => {
            const { getByTestId } = renderComponent();
            fireEvent.click(getByTestId('add-reservation'));
            expect(history.push).toBeCalledTimes(1);
            expect(history.push).toBeCalledWith('/add-reservation?customerId=' + __mockCustomers[0].id);
        });

        it('redirects users at "Edit" button click', () => {
            const { getByTestId } = renderComponent();

            fireEvent.click(getByTestId('edit-customer'));
            expect(history.push).toBeCalledTimes(1);
            expect(history.push).toBeCalledWith('/edit-customer/' + __mockCustomers[0].id);
        });

        it('display confirmation dialog at "Delete" button click', () => {
            const { getByTestId } = renderComponent();

            fireEvent.click(getByTestId('delete-customer'));

            expect(mockOpenDialog).toBeCalledTimes(1);
        });
    });

    it('matches snapshot', () => {
        const snapshot = renderer
            .create(
                <StylesProvider generateClassName={createGenerateClassName({ disableGlobal: true })}>
                    {/* @ts-ignore */}
                    <CustomerDetails match={match} />
                </StylesProvider>,
            )
            .toJSON();
        expect(snapshot).toMatchSnapshot();
    });
});
