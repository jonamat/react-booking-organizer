/**
 * Unit test suite
 *
 * Target: AddCustomer component
 * Tests:
 * - Responses handling
 * - Redirection
 * - User interaction interruption on loading
 * - Middleware function call
 * - Visual feedbacks
 * - Snapshot matching
 * - Functionality
 *
 * For data validation, API call and errors handling see {@link '../../../utils/addCustomer'}
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
import { addCustomer } from '../../../utils';

// Mocked modules
import { toast } from 'react-toastify';

// Component to test
import AddCustomer from '..';

/* -------------------------------------------------------------------------- */
/*                                    Mocks                                   */
/* -------------------------------------------------------------------------- */

jest.mock('../../../utils', () => ({
    addCustomer: jest.fn(() => Promise.resolve({ id: 'fakeID', name: 'Carl' })),
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
            <AddCustomer history={history} {...props} />
        </MuiPickersUtilsProvider>,
    );
};

/* -------------------------------------------------------------------------- */
/*                                    Tests                                   */
/* -------------------------------------------------------------------------- */

describe('AddCustomer component', () => {
    describe('Upload system', () => {
        it('calls the db middleware function with the correct user inputs', () => {
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

            expect(addCustomer as jest.Mock).toBeCalledTimes(1);
            expect(Array.from((addCustomer as jest.Mock).mock.calls[0][0].entries())).toEqual([
                ['name', 'name'],
                ['surname', 'surname'],
                ['additionalIdentifier', 'additionalIdentifier'],
                ['phone', 'phone'],
                ['notes', 'notes'],
            ]);
            expect(((addCustomer as jest.Mock).mock.calls[0][1] as Date).toDateString()).toEqual(
                birthday.toDateString(),
            );
        });
    });

    describe('User experience', () => {
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
            (addCustomer as jest.Mock).mockImplementation(() => Promise.reject('some error'));

            const { getByTestId } = renderComponent();

            fireEvent.input(getByTestId('name'), { target: { value: 'name' } });
            fireEvent.click(getByTestId('submit-button'));

            await waitFor(() => {
                expect(spyTError).toBeCalledTimes(1);
            });
        });

        it('disables submit button on loading', async () => {
            (addCustomer as jest.Mock).mockImplementation(() => Promise.reject('some error'));

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
                        <AddCustomer />
                    </StylesProvider>
                </MuiPickersUtilsProvider>,
            )
            .toJSON();
        expect(snapshot).toMatchSnapshot();
    });
});
