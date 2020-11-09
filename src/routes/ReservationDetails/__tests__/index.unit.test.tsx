/**
 * Unit test suite
 *
 * Target: ReservationDetails component
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
import { addMinutes } from 'date-fns';

// Test configuration
import {
    __mockCustomers,
    __mockServices,
    __mockEmployees,
    __mockReservations,
    __setUseStore,
} from '../../../__mocks__/react-redux';
import { TIME_DATE_FORMAT } from '../../../config';

// Mocked modules
import { toast } from 'react-toastify';

// Component to test
import ReservationDetails from '..';

const match = {
    params: {
        reservationId: __mockReservations[0].id,
    },
};

/* -------------------------------------------------------------------------- */
/*                                    Mocks                                   */
/* -------------------------------------------------------------------------- */

jest.mock('../../../utils', () => ({
    ...(jest.requireActual('../../../utils') as Record<string, any>),
    deleteReservation: jest.fn(),
}));
const spyTError = jest.spyOn(toast, 'error');
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
    goBack: jest.fn(),
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
    return render(<ReservationDetails match={match} history={history} {...props} />);
};

/* -------------------------------------------------------------------------- */
/*                                    Tests                                   */
/* -------------------------------------------------------------------------- */

describe('ReservationDetails', () => {
    describe('Data accuracy', () => {
        it('shows correct data', () => {
            const { getByText } = renderComponent();

            // Customer details preview
            expect(getByText('Nome').previousElementSibling).toHaveTextContent(
                __mockCustomers[0].name + ' ' + __mockCustomers[0].surname || '',
            );
            expect(getByText('Identificatore aggiuntivo').previousElementSibling).toHaveTextContent(
                __mockCustomers[0].additionalIdentifier || '---',
            );
            expect(getByText('Telefono').previousElementSibling).toHaveTextContent(__mockCustomers[0].phone || '---');
            expect(getByText('Note personali cliente').previousElementSibling).toHaveTextContent(
                __mockCustomers[0].notes || '---',
            );

            // Actual reservation details
            expect(getByText('Stato').previousElementSibling).toHaveTextContent('Completato');
            expect(getByText('Servizio').previousElementSibling).toHaveTextContent(__mockServices[0].name);
            expect(getByText('Dipendente assegnato').previousElementSibling).toHaveTextContent(__mockEmployees[0].name);
            expect(getByText('Inizio appuntamento').previousElementSibling).toHaveTextContent(
                __mockReservations[0].date.toLocaleDateString('it-IT', TIME_DATE_FORMAT),
            );
            expect(getByText('Fine appuntamento').previousElementSibling).toHaveTextContent(
                addMinutes(
                    new Date(__mockReservations[0].date.getTime()),
                    __mockServices[0].averageDuration,
                ).toLocaleDateString('it-IT', TIME_DATE_FORMAT),
            );
            expect(getByText('Note appuntamento').previousElementSibling).toHaveTextContent(
                __mockReservations[0].notes || '---',
            );
        });
    });

    describe('User experience', () => {
        it('prevents crashes if reservation not exists', () => {
            renderComponent({ match: { params: { reservationId: 'missing_id' } } });

            expect(spyTError).toBeCalledTimes(1);
        });

        it('prevents crashes if some information are missing', () => {
            // Change implementation of useStore in react-redux manual mock
            __setUseStore(() => ({
                getState: () => ({
                    database: {
                        customers: __mockCustomers,
                        employees: __mockEmployees,
                        services: [
                            /* es. services deleted */
                        ],
                        reservations: __mockReservations,
                    },
                }),
            }));

            renderComponent();

            expect(spyTError).toBeCalledTimes(1);

            // Restore useStore
            __setUseStore(() => ({
                getState: () => ({
                    database: {
                        customers: __mockCustomers,
                        employees: __mockEmployees,
                        services: __mockServices,
                        reservations: __mockReservations,
                    },
                }),
            }));
        });

        it('redirects users at "Go to reservation day" button click', () => {
            const { getByTestId } = renderComponent();

            fireEvent.click(getByTestId('go-to-day'));
            expect(history.push).toBeCalledTimes(1);
            expect(history.push).toBeCalledWith(
                '/reservations?date=' + __mockReservations[0].date.toISOString().slice(0, 10),
            );
        });

        it('redirects users at "Customer details" button click', () => {
            const { getByTestId } = renderComponent();

            fireEvent.click(getByTestId('customer-details'));
            expect(history.push).toBeCalledTimes(1);
            expect(history.push).toBeCalledWith('/customer-details/' + __mockCustomers[0].id);
        });

        it('redirects users at "Add Reservation" button click', () => {
            const { getByTestId } = renderComponent();
            fireEvent.click(getByTestId('add-reservation'));
            expect(history.push).toBeCalledTimes(1);
            expect(history.push).toBeCalledWith('/add-reservation?customerId=' + __mockCustomers[0].id);
        });

        it('redirects users at "Edit" button click', () => {
            const { getByTestId } = renderComponent();

            fireEvent.click(getByTestId('edit-reservation'));
            expect(history.push).toBeCalledTimes(1);
            expect(history.push).toBeCalledWith('/edit-reservation/' + __mockReservations[0].id);
        });

        it('display confirmation dialog at "Delete" button click', () => {
            const { getByTestId } = renderComponent();

            fireEvent.click(getByTestId('delete-reservation'));

            expect(mockOpenDialog).toBeCalledTimes(1);
        });
    });

    it('matches snapshot', () => {
        const snapshot = renderer
            .create(
                <StylesProvider generateClassName={createGenerateClassName({ disableGlobal: true })}>
                    {/* @ts-ignore */}
                    <ReservationDetails match={match} history={history} />
                </StylesProvider>,
            )
            .toJSON();
        expect(snapshot).toMatchSnapshot();
    });
});
