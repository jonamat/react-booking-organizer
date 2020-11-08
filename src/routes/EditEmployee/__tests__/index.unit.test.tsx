/**
 * Unit test suite
 *
 * Target: EditEmployee component
 * Tests:
 * - Responses handling
 * - Redirection
 * - User interaction interruption on loading
 * - Middleware function call
 * - Visual feedbacks
 * - Snapshot matching
 * - Functionality
 *
 * For data validation, API call and errors handling see {@link '../../../utils/editEmployee'}
 */

// Test resources
import React from 'react';
import renderer from 'react-test-renderer';
import { StylesProvider, createGenerateClassName } from '@material-ui/core';
import { render, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';

// Test configuration
import { editEmployee } from '../../../utils';
import { __mockEmployees } from '../../../__mocks__/react-redux';

// Mocked modules
import { toast } from 'react-toastify';

// Component to test
import EditEmployee from '..';

const match = {
    params: {
        employeeId: __mockEmployees[0].id,
    },
};

/* -------------------------------------------------------------------------- */
/*                                    Mocks                                   */
/* -------------------------------------------------------------------------- */

jest.mock('../../../utils', () => ({
    editEmployee: jest.fn(() => Promise.resolve({ id: 'fakeID', name: 'Carl' })),
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
    return render(<EditEmployee history={history} match={match} {...props} />);
};

/* -------------------------------------------------------------------------- */
/*                                    Tests                                   */
/* -------------------------------------------------------------------------- */

describe('EditEmployee component', () => {
    describe('Upload system', () => {
        it('calls the db middleware function with correct user inputs', () => {
            const { getByTestId } = renderComponent();

            fireEvent.input(getByTestId('name'), { target: { value: 'name' } });
            fireEvent.click(getByTestId('submit-button'));

            expect(editEmployee as jest.Mock).toBeCalledTimes(1);

            expect((editEmployee as jest.Mock).mock.calls[0][0]).toEqual(__mockEmployees[0].id);
            expect(Array.from((editEmployee as jest.Mock).mock.calls[0][1].entries())).toEqual([['name', 'name']]);
            expect((editEmployee as jest.Mock).mock.calls[0][2]).toBeNull();
            expect((editEmployee as jest.Mock).mock.calls[0][3]).toBeNull();
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
            (editEmployee as jest.Mock).mockImplementation(() => Promise.reject('some error'));

            const { getByTestId } = renderComponent();

            fireEvent.input(getByTestId('name'), { target: { value: 'name' } });
            fireEvent.click(getByTestId('submit-button'));

            await waitFor(() => {
                expect(spyTError).toBeCalledTimes(1);
            });
        });

        it('disables submit button on loading', async () => {
            (editEmployee as jest.Mock).mockImplementation(() => Promise.reject('some error'));

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
                    <EditEmployee match={match} />
                </StylesProvider>,
            )
            .toJSON();
        expect(snapshot).toMatchSnapshot();
    });
});
