/**
 * Unit test suite
 *
 * Target: addReservation
 * Tests:
 * - Data validation
 * - API call
 * - Rejections handling
 * - Functionality
 *
 * For the implementation see {@link '../../routes/AddReservation'}
 */

// Test configuration
import { NewReservation, Customer } from '../../types';

// Component to test
import addReservation from '../addReservation';

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
const mockAdd = jest.fn((newReservation) => ({
    id: 'fakeId',
    newReservation,
}));
jest.mock('firebase/app', () => ({
    firestore: () => ({
        collection: () => ({
            add: mockAdd,
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

describe('addReservation fn', () => {
    it('calls database with valid arg', () => {
        addReservation(formDataArg, customer, new Date('1 Jan 2020 10:00 GMT+0100'), reduxStore);
        expect(mockAdd).toBeCalledWith(newReservation);
    });

    it('prevents submit if there are missing required fields', () => {
        formDataArg.delete('serviceId');
        expect(
            addReservation(formDataArg, customer, new Date('1 Jan 2020 10:00 GMT+0100'), reduxStore),
        ).rejects.toThrowError();
        formDataArg.set('serviceId', 'serviceId');
    });

    it('returns a reservation object', () => {
        expect(
            addReservation(formDataArg, customer, new Date('1 Jan 2020 10:00 GMT+0100'), reduxStore),
        ).resolves.toStrictEqual({
            ...newReservation,
            id: 'fakeId',
        });
    });

    it('throws error if client cannot reach server', () => {
        mockAdd.mockImplementationOnce(() => {
            throw new Error('something gone wrong');
        });
        expect(
            addReservation(formDataArg, customer, new Date('1 Jan 2020 10:00 GMT+0100'), reduxStore),
        ).rejects.toThrowError();
    });

    it('deletes empty values before sending', () => {
        formDataArg.set('notes', '');
        const cleanedNewCustomer = { ...newReservation };
        delete cleanedNewCustomer.notes;

        addReservation(formDataArg, customer, new Date('1 Jan 2020 10:00 GMT+0100'), reduxStore);
        expect(mockAdd).toBeCalledWith(cleanedNewCustomer);
    });
});
