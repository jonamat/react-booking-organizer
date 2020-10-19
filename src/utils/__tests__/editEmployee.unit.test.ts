/**
 * Unit test suite
 *
 * Target: editEmployee
 * Tests:
 * - Data validation
 * - API call
 * - Rejections handling
 * - Functionality
 *
 * For the implementation see {@link '../../routes/EditEmployee'}
 */

// Test configuration
import { NewEmployee } from '../../types';

// Component to test
import editEmployee from '../editEmployee';

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

const mockSet = jest.fn((newEmployee) => ({
    id: 'id',
    newEmployee,
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

describe('editEmployee fn', () => {
    it('calls database with valid arg', () => {
        editEmployee('id', formDataArg, newEmployee.weekWorkingShifts, newEmployee.holidays);
        expect(mockSet).toBeCalledWith(newEmployee);
    });

    it('prevents submit if there are missing required fields', () => {
        formDataArg.delete('name');
        expect(editEmployee('id', formDataArg)).rejects.toThrowError();
        formDataArg.set('name', 'name');
    });

    it('returns an employee object', () => {
        expect(
            editEmployee('id', formDataArg, newEmployee.weekWorkingShifts, newEmployee.holidays),
        ).resolves.toStrictEqual({
            ...newEmployee,
            id: 'id',
        });
    });

    it('throws error if client cannot reach server', () => {
        mockSet.mockImplementationOnce(() => {
            throw new Error('something gone wrong');
        });
        expect(editEmployee('id', formDataArg)).rejects.toThrowError();
    });

    // Currently not necessary - add it if you will implement additional non-required fields
    it.skip('deletes empty values before sending', () => {
        formDataArg.set('notes', '');
        const cleanedNewCustomer = { ...newEmployee };
        delete cleanedNewCustomer.notes;

        editEmployee('id', formDataArg);
        expect(mockSet).toBeCalledWith(cleanedNewCustomer);
    });
});
