/**
 * Unit test suite
 *
 * Target: EditService component
 * Tests:
 * - Responses handling
 * - Redirection
 * - User interaction interruption on loading
 * - Middleware function call
 * - Visual feedbacks
 * - Snapshot matching
 * - Functionality
 *
 * For data validation, API call and errors handling see {@link '../../../utils/editService'}
 */

// Test resources
import React from 'react';
import renderer from 'react-test-renderer';
import { StylesProvider, createGenerateClassName } from '@material-ui/core';
import { render, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';

// Test configuration
import { editService } from '../../../utils';
import { __mockServices } from '../../../__mocks__/react-redux';

// Mocked modules
import { toast } from 'react-toastify';

// Component to test
import EditService from '..';

const match = {
    params: {
        serviceId: __mockServices[0].id,
    },
};

/* -------------------------------------------------------------------------- */
/*                                    Mocks                                   */
/* -------------------------------------------------------------------------- */

jest.mock('../../../utils', () => ({
    ...(jest.requireActual('../../../utils') as Record<string, any>),
    editService: jest.fn(() => Promise.resolve({ id: 'fakeID', name: 'Carl' })),
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
    return render(<EditService history={history} match={match} {...props} />);
};

/* -------------------------------------------------------------------------- */
/*                                    Tests                                   */
/* -------------------------------------------------------------------------- */

describe('EditService component', () => {
    describe('Upload system', () => {
        it('calls the db middleware function with correct user inputs', () => {
            const { getByTestId } = renderComponent();

            fireEvent.input(getByTestId('name'), { target: { value: 'name' } });
            fireEvent.input(getByTestId('averageDuration'), { target: { value: 30 } });
            fireEvent.click(getByTestId('submit-button'));

            expect(spyTError).not.toBeCalled();
            expect(editService as jest.Mock).toBeCalledTimes(1);
            expect((editService as jest.Mock).mock.calls[0][0]).toEqual(__mockServices[0].id);
            expect(Array.from((editService as jest.Mock).mock.calls[0][1].entries())).toEqual([
                ['name', 'name'],
                ['averageDuration', '30'],
            ]);
        });
    });

    describe('User experience', () => {
        it('redirects user on success', async () => {
            const { getByTestId } = renderComponent();

            fireEvent.input(getByTestId('name'), { target: { value: 'name' } });
            fireEvent.input(getByTestId('averageDuration'), { target: { value: 15 } });
            fireEvent.click(getByTestId('submit-button'));

            await waitFor(() => {
                expect(history.push).toBeCalledTimes(1);
                expect(history.push).toBeCalledWith('/services');
            });
        });

        it('calls toast on success', async () => {
            const { getByTestId } = renderComponent();

            fireEvent.input(getByTestId('name'), { target: { value: 'name' } });
            fireEvent.input(getByTestId('averageDuration'), { target: { value: 15 } });
            fireEvent.click(getByTestId('submit-button'));

            await waitFor(() => {
                expect(spyTSuccess).toBeCalledTimes(1);
            });
        });

        it('calls toast on error', async () => {
            (editService as jest.Mock).mockImplementation(() => Promise.reject('some error'));

            const { getByTestId } = renderComponent();

            fireEvent.input(getByTestId('name'), { target: { value: 'name' } });
            fireEvent.input(getByTestId('averageDuration'), { target: { value: 15 } });
            fireEvent.click(getByTestId('submit-button'));

            await waitFor(() => {
                expect(spyTError).toBeCalledTimes(1);
            });
        });

        it('disables submit button on loading', async () => {
            (editService as jest.Mock).mockImplementation(() => Promise.reject('some error'));

            const { getByTestId } = renderComponent();

            fireEvent.input(getByTestId('name'), { target: { value: 'name' } });
            fireEvent.input(getByTestId('averageDuration'), { target: { value: 15 } });

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
                    <EditService match={match} />
                </StylesProvider>,
            )
            .toJSON();
        expect(snapshot).toMatchSnapshot();
    });
});
