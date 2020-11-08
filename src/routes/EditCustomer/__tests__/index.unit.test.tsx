/**
 * Unit test suite
 *
 * Target: EditCustomer component
 * Tests:
 * - Responses handling
 * - Redirection
 * - User interaction interruption on loading
 * - Middleware function call
 * - Visual feedbacks
 * - Snapshot matching
 * - Functionality
 *
 * For data validation, API call and errors handling see {@link '../../../utils/editCustomer'}
 */

// Test resources
import React from 'react';
import renderer from 'react-test-renderer';
import { StylesProvider, createGenerateClassName } from '@material-ui/core';
import { render, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import DateFnsUtils from '@date-io/date-fns';
import { MuiPickersUtilsProvider } from '@material-ui/pickers';
import itLocale from 'date-fns/locale/it';

// Test configuration
import { editCustomer } from '../../../utils';
import { __mockCustomers } from '../../../__mocks__/react-redux';

// Mocked modules
import { toast } from 'react-toastify';

// Component to test
import EditCustomer from '..';

const match = {
    params: {
        customerId: __mockCustomers[0].id,
    },
};

/* -------------------------------------------------------------------------- */
/*                                    Mocks                                   */
/* -------------------------------------------------------------------------- */

jest.mock('../../../utils', () => ({
    editCustomer: jest.fn(() => Promise.resolve({ id: 'fakeID', name: 'Carl' })),
}));
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
        <MuiPickersUtilsProvider utils={DateFnsUtils} locale={itLocale}>
            <EditCustomer history={history} match={match} {...props} />
        </MuiPickersUtilsProvider>,
    );
};

/* -------------------------------------------------------------------------- */
/*                                    Tests                                   */
/* -------------------------------------------------------------------------- */

describe('EditCustomer component', () => {
    describe('Upload system', () => {
        it('calls the db middleware function with correct user inputs', () => {
            const { getByTestId, getByText } = renderComponent();

            const birthday = new Date();

            fireEvent.input(getByTestId('name'), { target: { value: 'name' } });
            fireEvent.input(getByTestId('surname'), { target: { value: 'surname' } });
            fireEvent.input(getByTestId('additionalIdentifier'), { target: { value: 'additionalIdentifier' } });
            fireEvent.input(getByTestId('phone'), { target: { value: 'phone' } });
            fireEvent.click(getByTestId('birthday'));
            fireEvent.click(getByText('OK'));
            fireEvent.input(getByTestId('notes'), { target: { value: 'notes' } });
            fireEvent.click(getByTestId('submit-button'));

            expect(editCustomer as jest.Mock).toBeCalledTimes(1);

            expect((editCustomer as jest.Mock).mock.calls[0][0]).toEqual(__mockCustomers[0].id);
            expect(Array.from((editCustomer as jest.Mock).mock.calls[0][1].entries())).toEqual([
                ['name', 'name'],
                ['surname', 'surname'],
                ['additionalIdentifier', 'additionalIdentifier'],
                ['phone', 'phone'],
                ['notes', 'notes'],
            ]);
            expect(((editCustomer as jest.Mock).mock.calls[0][2] as Date).toDateString()).toEqual(
                birthday.toDateString(),
            );
        });
    });

    describe('User experience', () => {
        it('shows values of existent data', () => {
            const { getByTestId } = renderComponent();

            expect((getByTestId('name') as HTMLInputElement).value).toBe(__mockCustomers[0].name || '');
            expect((getByTestId('surname') as HTMLInputElement).value).toBe(__mockCustomers[0].surname || '');
            expect((getByTestId('additionalIdentifier') as HTMLInputElement).value).toBe(
                __mockCustomers[0].additionalIdentifier || '',
            );
            expect((getByTestId('phone') as HTMLInputElement).value).toBe(__mockCustomers[0].phone || '');
            expect((getByTestId('notes') as HTMLInputElement).value).toBe(__mockCustomers[0].notes || '');
        });

        it('redirects user on success', async () => {
            const { getByTestId } = renderComponent();

            fireEvent.input(getByTestId('name'), { target: { value: 'name' } });
            fireEvent.click(getByTestId('submit-button'));

            await waitFor(() => {
                expect(history.push).toBeCalledTimes(1);
                expect(history.push).toBeCalledWith('/customers');
            });
        });

        it('calls toast on success', async () => {
            const { getByTestId } = renderComponent();

            fireEvent.input(getByTestId('name'), { target: { value: 'name' } });
            fireEvent.click(getByTestId('submit-button'));

            await waitFor(() => {
                expect(spyTSuccess).toBeCalledTimes(1);
            });
        });

        it('calls toast on error', async () => {
            (editCustomer as jest.Mock).mockImplementation(() => Promise.reject('some error'));

            const { getByTestId } = renderComponent();

            fireEvent.input(getByTestId('name'), { target: { value: 'name' } });
            fireEvent.click(getByTestId('submit-button'));

            await waitFor(() => {
                expect(spyTError).toBeCalledTimes(1);
            });
        });

        it('disables submit button on loading', async () => {
            (editCustomer as jest.Mock).mockImplementation(() => Promise.reject('some error'));

            const { getByTestId } = renderComponent();

            fireEvent.input(getByTestId('name'), { target: { value: 'name' } });
            expect(getByTestId('submit-button').hasAttribute('disabled')).toBeFalsy();
            fireEvent.click(getByTestId('submit-button'));
            expect(getByTestId('submit-button').hasAttribute('disabled')).toBeTruthy();

            await waitFor(() => {
                expect(getByTestId('submit-button').hasAttribute('disabled')).toBeFalsy();
            });
        });
    });

    it('matches snapshot', () => {
        const snapshot = renderer
            .create(
                <MuiPickersUtilsProvider utils={DateFnsUtils} locale={itLocale}>
                    <StylesProvider generateClassName={createGenerateClassName({ disableGlobal: true })}>
                        {/* @ts-ignore */}
                        <EditCustomer match={match} />
                    </StylesProvider>
                </MuiPickersUtilsProvider>,
            )
            .toJSON();
        expect(snapshot).toMatchSnapshot();
    });
});
