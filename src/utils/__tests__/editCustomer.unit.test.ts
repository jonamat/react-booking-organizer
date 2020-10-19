/**
 * Unit test suite
 *
 * Target: editCustomer
 * Tests:
 * - Data validation
 * - API call
 * - Rejections handling
 * - Functionality
 *
 * For the implementation see {@link '../../routes/EditCustomer'}
 */

// Test configuration
import { NewCustomer } from '../../types';

// Component to test
import editCustomer from '../editCustomer';

const formData = new FormData();
['name', 'surname', 'additionalIdentifier', 'phone', 'notes'].forEach((key) => formData.set(key, key));
const birthday = new Date(1997, 0, 28);
const newCustomer: NewCustomer = {
    name: 'name',
    surname: 'surname',
    additionalIdentifier: 'additionalIdentifier',
    phone: 'phone',
    notes: 'notes',
    birthday,
};

/* -------------------------------------------------------------------------- */
/*                                    Mocks                                   */
/* -------------------------------------------------------------------------- */

const mockSet = jest.fn((newCustomer) => ({
    id: 'id',
    newCustomer,
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

describe('editCustomer fn', () => {
    it('calls database with valid arg', () => {
        editCustomer('id', formData, birthday);
        expect(mockSet).toBeCalledWith(newCustomer);
    });

    it('prevents submit if there are missing required fields', () => {
        formData.delete('name');
        expect(editCustomer('id', formData, birthday)).rejects.toThrowError();
        formData.set('name', 'name');
    });

    it('returns a customer object', () => {
        expect(editCustomer('id', formData, birthday)).resolves.toStrictEqual({ ...newCustomer, id: 'id' });
    });

    it('throws error if client cannot reach server', () => {
        mockSet.mockImplementationOnce(() => {
            throw new Error('something gone wrong');
        });
        expect(editCustomer('id', formData, birthday)).rejects.toThrowError();
    });

    it('deletes empty values before sending', () => {
        formData.set('notes', '');
        const cleanedNewCustomer = { ...newCustomer };
        delete cleanedNewCustomer.notes;

        editCustomer('id', formData, birthday);
        expect(mockSet).toBeCalledWith(cleanedNewCustomer);
    });
});
