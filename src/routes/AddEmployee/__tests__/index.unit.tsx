/**
 * Unit test suite
 *
 * Target: AddEmployee component
 * Tests:
 * - Responses handling
 * - Redirection
 * - User interaction interruption on loading
 * - Middleware function call
 * - Visual feedbacks
 * - Snapshot matching
 * - Functionality
 *
 * For data validation, API call and errors handling see {@link '../../../utils/addEmployee'}
 */

// Test resources
import React from 'react';
import renderer from 'react-test-renderer';
import { StylesProvider, createGenerateClassName } from '@material-ui/core';
import { render, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';

// Test configuration
import { addEmployee } from '../../../utils';

// Mocked modules
import { toast } from 'react-toastify';

// Component to test
import AddEmployee from '..';

/* -------------------------------------------------------------------------- */
/*                                    Mocks                                   */
/* -------------------------------------------------------------------------- */

jest.mock('../../../utils', () => ({
    addEmployee: jest.fn(() => Promise.resolve({ id: 'fakeID', name: 'Carl' })),
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
    return render(<AddEmployee history={history} {...props} />);
};

/* -------------------------------------------------------------------------- */
/*                                    Tests                                   */
/* -------------------------------------------------------------------------- */

describe('AddEmployee component', () => {
    describe('Upload system', () => {
        it('calls the db middleware function with correct user inputs', () => {
            const { getByTestId } = renderComponent();

            fireEvent.input(getByTestId('name'), { target: { value: 'name' } });
            fireEvent.click(getByTestId('submit-button'));

            expect(addEmployee as jest.Mock).toBeCalledTimes(1);

            expect(Array.from((addEmployee as jest.Mock).mock.calls[0][0].entries())).toEqual([['name', 'name']]);
            expect((addEmployee as jest.Mock).mock.calls[0][1]).toBeNull();
            expect((addEmployee as jest.Mock).mock.calls[0][2]).toBeNull();
        });
    });

    describe('User experience', () => {
        it('redirects user on success', async () => {
            const { getByTestId } = renderComponent();

            fireEvent.input(getByTestId('name'), { target: { value: 'name' } });
            fireEvent.click(getByTestId('submit-button'));

            await waitFor(() => {
                expect(history.push).toBeCalledTimes(1);
                expect(history.push).toBeCalledWith('/employees');
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
            (addEmployee as jest.Mock).mockImplementation(() => Promise.reject('some error'));

            const { getByTestId } = renderComponent();

            fireEvent.input(getByTestId('name'), { target: { value: 'name' } });
            fireEvent.click(getByTestId('submit-button'));

            await waitFor(() => {
                expect(spyTError).toBeCalledTimes(1);
            });
        });

        it('disables submit button on loading', async () => {
            (addEmployee as jest.Mock).mockImplementation(() => Promise.reject('some error'));

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
                <StylesProvider generateClassName={createGenerateClassName({ disableGlobal: true })}>
                    {/* @ts-ignore */}
                    <AddEmployee />
                </StylesProvider>,
            )
            .toJSON();
        expect(snapshot).toMatchSnapshot();
    });
});
