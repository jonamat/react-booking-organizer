/**
 * Unit test suite
 *
 * Target: AddReservation component
 * Tests:
 * - Responses handling
 * - Redirection
 * - User interaction interruption on loading
 * - Middleware function call
 * - Visual feedbacks
 * - Snapshot matching
 * - Functionality
 *
 * For data validation, API call and errors handling see {@link '../../../utils/addReservation'}
 */

// Test resources
import React from 'react';
import renderer from 'react-test-renderer';
import { StylesProvider, createGenerateClassName } from '@material-ui/core';
import { render, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import DateFnsUtils from '@date-io/date-fns';
import { MuiPickersUtilsProvider } from '@material-ui/pickers';

// Test configuration
import { addReservation } from '../../../utils';
import { __mockCustomers, __mockServices, __mockEmployees, __mockReservations } from '../../../__mocks__/react-redux';

// Mocked modules
import { toast } from 'react-toastify';

// Component to test
import AddReservation from '..';

// WARN: It could change based on timezone
const parsedDate = new Date('1 Jan 2040 10:00 GMT+0100');

/* -------------------------------------------------------------------------- */
/*                                    Mocks                                   */
/* -------------------------------------------------------------------------- */
jest.mock('../../../utils', () => ({
    ...(jest.requireActual('../../../utils') as Record<string, any>),
    addReservation: jest.fn(() => Promise.resolve({ id: 'fakeID', date: new Date('1 Jan 2040 10:00 GMT+0100') })),
    generateClosestValidDate: () => new Date('1 Jan 2020 10:00 GMT+0100'),
}));
jest.mock('../../../components/HolidaysField', () => () => null);
jest.mock('../../../components/ShiftsField', () => () => null);
const spyTSuccess = jest.spyOn(toast, 'success');
const spyTError = jest.spyOn(toast, 'error');
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
    return render(
        <MuiPickersUtilsProvider utils={DateFnsUtils}>
            <AddReservation history={history} location={{}} {...props} />
        </MuiPickersUtilsProvider>,
    );
};

/* -------------------------------------------------------------------------- */
/*                                    Tests                                   */
/* -------------------------------------------------------------------------- */

describe('AddReservation component', () => {
    describe('Upload system', () => {
        it('calls the db middleware function with correct user inputs', () => {
            const { getByTestId } = renderComponent();

            // Customer input
            fireEvent.input(getByTestId('customer'), { target: { value: __mockCustomers[0].name } });
            fireEvent.keyDown(getByTestId('customer'), { key: 'Enter', code: 'Enter' });

            // Date input and validation
            fireEvent.change(getByTestId('date'), { target: { value: '01/01/2040 10:00' } });
            fireEvent.blur(getByTestId('date'));

            // Other text fields
            fireEvent.input(getByTestId('service'), { target: { value: __mockServices[0].id } });
            fireEvent.input(getByTestId('employee'), { target: { value: __mockEmployees[0].id } });
            fireEvent.input(getByTestId('notes'), { target: { value: 'notes' } });

            fireEvent.click(getByTestId('submit-button'));

            expect(addReservation as jest.Mock).toBeCalledTimes(1);

            expect(Array.from((addReservation as jest.Mock).mock.calls[0][0].entries())).toEqual([
                ['serviceId', __mockServices[0].id],
                ['employeeId', __mockEmployees[0].id],
                ['notes', 'notes'],
            ]);
            expect((addReservation as jest.Mock).mock.calls[0][1]).toEqual(__mockCustomers[0]);
            expect((addReservation as jest.Mock).mock.calls[0][2]).toEqual(parsedDate);
            expect((addReservation as jest.Mock).mock.calls[0][3]).toEqual({
                employees: __mockEmployees,
                services: __mockServices,
                reservations: __mockReservations,
            });
            expect((addReservation as jest.Mock).mock.calls[0][4]).toBeUndefined();
        });

        it('prevents sending of invalid dates', async () => {
            const { getByTestId, queryAllByText } = renderComponent();

            // Date input and validation
            fireEvent.change(getByTestId('date'), { target: { value: '99/99/2090 70:00' } }); // invalid day month hour
            fireEvent.blur(getByTestId('date'));

            expect((await queryAllByText('Data non valida')).length).toBeTruthy();

            // Date input and validation
            fireEvent.change(getByTestId('date'), { target: { value: '10/10/2090 07:00' } });
            fireEvent.blur(getByTestId('date'));

            expect((await queryAllByText('Data non valida')).length).toBeFalsy();
        });

        it('parses and loads queries in url', () => {
            const { getByTestId } = renderComponent({
                location: {
                    search: `customerId=${__mockCustomers[0].id}&employeeId=${__mockEmployees[0].id}&date=2040-01-01&hour=10:00`,
                },
            });

            expect((getByTestId('customer') as HTMLInputElement).value).toBe(
                `${__mockCustomers[0].name} ${__mockCustomers[0].surname}`,
            );
            expect((getByTestId('employee') as HTMLInputElement).value).toBe(__mockEmployees[0].id);
            expect((getByTestId('date') as HTMLInputElement).value).toBe('01/01/2040 10:00');
        });
    });

    describe('User experience', () => {
        it('Autocomplete field sorts customers properly', () => {
            const { getByTestId } = renderComponent();
            fireEvent.click(getByTestId('customer'));
            fireEvent.input(getByTestId('customer'), { target: { value: __mockCustomers[0].name.slice(0, 5) } });
            fireEvent.keyDown(getByTestId('customer'), { key: 'Enter', code: 'Enter' });
            expect(getByTestId('customer')).toHaveValue(__mockCustomers[0].name + ' ' + __mockCustomers[0].surname);
        });

        it('redirects user on success', async () => {
            const { getByTestId } = renderComponent();

            // Customer input
            fireEvent.input(getByTestId('customer'), { target: { value: __mockCustomers[0].name } });
            fireEvent.keyDown(getByTestId('customer'), { key: 'Enter', code: 'Enter' });

            // Date input and validation
            fireEvent.change(getByTestId('date'), { target: { value: '01/01/2040 10:00' } });
            fireEvent.blur(getByTestId('date'));

            // Other text fields
            fireEvent.input(getByTestId('service'), { target: { value: __mockServices[0].id } });
            fireEvent.input(getByTestId('employee'), { target: { value: __mockEmployees[0].id } });

            fireEvent.click(getByTestId('submit-button'));

            await waitFor(() => {
                expect(history.push).toBeCalledTimes(1);
                expect(history.push).toBeCalledWith(`/reservations?date=2040-01-01`);
            });
        });

        it('calls toast on success', async () => {
            const { getByTestId } = renderComponent();

            // Customer input
            fireEvent.input(getByTestId('customer'), { target: { value: __mockCustomers[0].name } });
            fireEvent.keyDown(getByTestId('customer'), { key: 'Enter', code: 'Enter' });

            // Date input and validation
            fireEvent.change(getByTestId('date'), { target: { value: '01/01/2040 10:00' } });
            fireEvent.blur(getByTestId('date'));

            // Other text fields
            fireEvent.input(getByTestId('service'), { target: { value: __mockServices[0].id } });
            fireEvent.input(getByTestId('employee'), { target: { value: __mockEmployees[0].id } });

            fireEvent.click(getByTestId('submit-button'));

            await waitFor(() => {
                expect(spyTSuccess).toBeCalledTimes(1);
            });
        });

        it('calls toast on error', async () => {
            (addReservation as jest.Mock).mockImplementation(() => Promise.reject('some error'));

            const { getByTestId } = renderComponent();

            // Customer input
            fireEvent.input(getByTestId('customer'), { target: { value: __mockCustomers[0].name } });
            fireEvent.keyDown(getByTestId('customer'), { key: 'Enter', code: 'Enter' });

            // Date input and validation
            fireEvent.change(getByTestId('date'), { target: { value: '01/01/2040 10:00' } });
            fireEvent.blur(getByTestId('date'));

            // Other text fields
            fireEvent.input(getByTestId('service'), { target: { value: __mockServices[0].id } });
            fireEvent.input(getByTestId('employee'), { target: { value: __mockEmployees[0].id } });

            fireEvent.click(getByTestId('submit-button'));

            await waitFor(() => {
                expect(spyTError).toBeCalledTimes(1);
            });
        });

        it('disables submit button on loading', async () => {
            (addReservation as jest.Mock).mockImplementation(() => Promise.reject('some error'));

            const { getByTestId } = renderComponent();

            // Customer input
            fireEvent.input(getByTestId('customer'), { target: { value: __mockCustomers[0].name } });
            fireEvent.keyDown(getByTestId('customer'), { key: 'Enter', code: 'Enter' });

            // Date input and validation
            fireEvent.change(getByTestId('date'), { target: { value: '01/01/2040 10:00' } });
            fireEvent.blur(getByTestId('date'));

            // Other text fields
            fireEvent.input(getByTestId('service'), { target: { value: __mockServices[0].id } });
            fireEvent.input(getByTestId('employee'), { target: { value: __mockEmployees[0].id } });

            fireEvent.click(getByTestId('submit-button'));

            await waitFor(() => {
                expect(getByTestId('submit-button').hasAttribute('disabled')).toBeFalsy();
            });
        });
    });

    it('matches snapshot', () => {
        const snapshot = renderer
            .create(
                <MuiPickersUtilsProvider utils={DateFnsUtils}>
                    <StylesProvider generateClassName={createGenerateClassName({ disableGlobal: true })}>
                        {/* @ts-ignore */}
                        <AddReservation />
                    </StylesProvider>
                </MuiPickersUtilsProvider>,
            )
            .toJSON();
        expect(snapshot).toMatchSnapshot();
    });
});
