/**
 * Unit test suite
 *
 * Target: ReservationPanel component
 * Tests:
 * - Data position correctness
 * - Redirection
 * - Snapshot matching
 * - Functionality
 */

// Test resources
import React, { ComponentProps } from 'react';
import { render, fireEvent, act } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import renderer from 'react-test-renderer';
import { createMemoryHistory } from 'history';
import { StylesProvider, createGenerateClassName } from '@material-ui/core';

// Test configuration
import { __mockReservations, __mockCustomers, __mockServices } from '../../../__mocks__/react-redux';

// Mocked modules
import { getReservationStatus } from '../../../utils';

// Component to test
import ReservationPanel, { composeName } from '../';
import { TIME_DATE_FORMAT } from '../../../config';

/* -------------------------------------------------------------------------- */
/*                                    Mocks                                   */
/* -------------------------------------------------------------------------- */

jest.mock('react-router', () => ({
    withRouter: (component) => component,
}));

jest.mock('../../../utils', () => ({
    getReservationStatus: jest.fn(() => 'DONE'),
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
const renderComponent = (props?: Partial<ComponentProps<typeof ReservationPanel>>) => {
    return render(
        <ReservationPanel
            // @ts-ignore
            history={history}
            reservation={__mockReservations[0]}
            showDetails={false}
            {...props}
        />,
    );
};

/* -------------------------------------------------------------------------- */
/*                                    Tests                                   */
/* -------------------------------------------------------------------------- */

describe('ReservationPanel', () => {
    describe('Status progress', () => {
        it('calculated by calling getReservationStatus', () => {
            renderComponent();
            expect(getReservationStatus as jest.Mock).toBeCalledTimes(1);
        });

        it('refreshes every minute', () => {
            jest.useFakeTimers();
            renderComponent();

            // First call on mount
            expect(getReservationStatus as jest.Mock).toBeCalledTimes(1);

            act(() => {
                jest.advanceTimersByTime(1000 * 60);
            });
            expect(getReservationStatus as jest.Mock).toBeCalledTimes(2);
            act(() => {
                jest.advanceTimersByTime(1000 * 60);
            });
            expect(getReservationStatus as jest.Mock).toBeCalledTimes(3);
        });
    });

    describe('Data accuracy', () => {
        it('shows correct data in correct position', () => {
            const { queryByTestId } = renderComponent({ showDetails: true });

            expect(queryByTestId('date')).toHaveTextContent(
                __mockReservations[0].date.toLocaleDateString('it-IT', TIME_DATE_FORMAT),
            );
            expect(queryByTestId('name')).toHaveTextContent(composeName(__mockCustomers[0]));
            expect(queryByTestId('missing-info')).toBeFalsy();
            expect(queryByTestId('ongoing-now')).toBeFalsy();
            expect(queryByTestId('service')).toHaveTextContent(__mockServices[0].name);
            expect(queryByTestId('notes')).toHaveTextContent(__mockReservations[0].notes as string);
        });
    });

    describe('User experience', () => {
        it('redirects users to reservation details on panel click', () => {
            const { getByTestId } = renderComponent();

            fireEvent.click(getByTestId('name'));

            expect(history.push).toBeCalledTimes(1);
            expect(history.push).toBeCalledWith('/reservation-details/' + __mockReservations[0].id);
        });
    });

    it('matches snapshot', () => {
        const history = createMemoryHistory();
        const snapshot = renderer
            .create(
                <StylesProvider generateClassName={createGenerateClassName({ disableGlobal: true })}>
                    {/* @ts-ignore */}
                    <ReservationPanel history={history} reservation={__mockReservations[0]} showDetails={true} />
                </StylesProvider>,
            )
            .toJSON();
        expect(snapshot).toMatchSnapshot();
    });
});
