/**
 * Unit test suite
 *
 * Target: editReservation
 * Tests:
 * - Data validation
 * - API call
 * - Rejections handling
 * - Functionality
 *
 * For the implementation see {@link '../../routes/EditReservation'}
 */

// Test configuration
import { Customer, NewReservation } from './../../types';

// Component to test
import editReservation from '../editReservation';

const formDataArg = new FormData();
['serviceId', 'employeeId', 'notes'].forEach((key) => formDataArg.set(key, key));
const newReservation: NewReservation = {
    serviceId: 'serviceId',
    employeeId: 'employeeId',
    notes: 'notes',
    customerId: 'customerId',
    date: new Date('1 Jan 2020 10:00 GMT+0100'),
};
const customer: Customer = {
    id: 'customerId',
    name: 'name',
};
const reduxStore = {
    employees: [
        {
            id: 'employeeId',
            name: 'name',
        },
    ],
    services: [],
    reservations: [],
};

/* -------------------------------------------------------------------------- */
/*                                    Mocks                                   */
/* -------------------------------------------------------------------------- */

jest.mock('..', () => ({
    isEmployeeBusy: () => false,
    isEmployeeOnDuty: () => true,
}));
const mockSet = jest.fn((newReservaion) => ({
    id: 'id',
    newReservaion,
}));
jest.mock('firebase/app', () => ({
    firestore: () => ({
        collection: () => ({
            doc: () => ({
                set: mockSet,
            }),
        }),
    }),
}));

/* -------------------------------------------------------------------------- */
/*                              Bridge operations                             */
/* -------------------------------------------------------------------------- */

beforeEach(() => {
    jest.clearAllMocks();
});

/* -------------------------------------------------------------------------- */
/*                                    Tests                                   */
/* -------------------------------------------------------------------------- */

describe('editReservation fn', () => {
    it('calls database with valid arg', () => {
        editReservation('id', formDataArg, customer, new Date('1 Jan 2020 10:00 GMT+0100'), reduxStore);
        expect(mockSet).toBeCalledWith(newReservation);
    });

    it('prevents submit if there are missing required fields', () => {
        formDataArg.delete('serviceId');
        expect(
            editReservation('id', formDataArg, customer, new Date('1 Jan 2020 10:00 GMT+0100'), reduxStore),
        ).rejects.toThrowError();
        formDataArg.set('serviceId', 'serviceId');
    });

    it('returns a reservation object', () => {
        expect(
            editReservation('id', formDataArg, customer, new Date('1 Jan 2020 10:00 GMT+0100'), reduxStore),
        ).resolves.toStrictEqual({
            ...newReservation,
            id: 'id',
        });
    });

    it('throws error if client cannot reach server', () => {
        mockSet.mockImplementationOnce(() => {
            throw new Error('something gone wrong');
        });
        expect(
            editReservation('id', formDataArg, customer, new Date('1 Jan 2020 10:00 GMT+0100'), reduxStore),
        ).rejects.toThrowError();
    });

    it('deletes empty values before sending', () => {
        formDataArg.set('notes', '');
        const cleanedNewCustomer = { ...newReservation };
        delete cleanedNewCustomer.notes;

        editReservation('id', formDataArg, customer, new Date('1 Jan 2020 10:00 GMT+0100'), reduxStore);
        expect(mockSet).toBeCalledWith(cleanedNewCustomer);
    });
});
