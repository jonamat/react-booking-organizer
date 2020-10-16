/**
 * Unit test suite
 *
 * Target: addEmployee
 * Tests:
 * - Data validation
 * - API call
 * - Rejections handling
 * - Functionality
 *
 * For the implementation see {@link '../../routes/AddEmployee'}
 */

// Test configuration
import { NewEmployee } from '../../types';

// Component to test
import addEmployee from '../addEmployee';

const formDataArg = new FormData();
['name'].forEach((key) => formDataArg.set(key, key));
const newEmployee: NewEmployee = {
    name: 'name',
    weekWorkingShifts: {
        monday: [
            {
                startTime: { hour: 8, minute: 0 },
                endTime: { hour: 18, minute: 0 },
            },
        ],
    },
    holidays: [
        {
            startDay: new Date('1 Jan 2020 10:00 GMT+0100'),
            endDay: new Date('1 Jan 2030 10:00 GMT+0100'),
        },
    ],
};

/* -------------------------------------------------------------------------- */
/*                                    Mocks                                   */
/* -------------------------------------------------------------------------- */

const mockAdd = jest.fn((newEmployee) => ({
    id: 'fakeId',
    newEmployee,
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

describe('addEmployee fn', () => {
    it('calls database with valid arg', () => {
        addEmployee(formDataArg, newEmployee.weekWorkingShifts, newEmployee.holidays);
        expect(mockAdd).toBeCalledWith(newEmployee);
    });

    it('prevents submit if there are missing required fields', () => {
        formDataArg.delete('name');
        expect(addEmployee(formDataArg)).rejects.toThrowError();
        formDataArg.set('name', 'name');
    });

    it('returns an employee object', () => {
        expect(addEmployee(formDataArg, newEmployee.weekWorkingShifts, newEmployee.holidays)).resolves.toStrictEqual({
            ...newEmployee,
            id: 'fakeId',
        });
    });

    it('throws error if client cannot reach server', () => {
        mockAdd.mockImplementationOnce(() => {
            throw new Error('something gone wrong');
        });
        expect(addEmployee(formDataArg)).rejects.toThrowError();
    });

    // Currently not necessary - add it if you will implement additional non-required fields
    it.skip('deletes empty values before sending', () => {
        formDataArg.set('notes', '');
        const cleanedNewCustomer = { ...newEmployee };
        delete cleanedNewCustomer.notes;

        addEmployee(formDataArg);
        expect(mockAdd).toBeCalledWith(cleanedNewCustomer);
    });
});
