/**
 * Unit test suite
 *
 * Target: addCustomer
 * Tests:
 * - Data validation
 * - API call
 * - Rejections handling
 * - Functionality
 *
 * For the implementation see {@link '../../routes/AddCustomer'}
 */

// Test configuration
import { NewCustomer } from '../../types';

// Component to test
import addCustomer from '../addCustomer';

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

const mockAdd = jest.fn((newCustomer) => ({
    id: 'fakeId',
    newCustomer,
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

describe('addCustomer fn', () => {
    it('calls database with valid arg', () => {
        addCustomer(formData, birthday);
        expect(mockAdd).toBeCalledWith(newCustomer);
    });

    it('prevents submit if there are missing required fields', () => {
        formData.delete('name');
        expect(addCustomer(formData, birthday)).rejects.toThrowError();
        formData.set('name', 'name');
    });

    it('returns a customer object', () => {
        expect(addCustomer(formData, birthday)).resolves.toStrictEqual({ ...newCustomer, id: 'fakeId' });
    });

    it('throws error if client cannot reach server', () => {
        mockAdd.mockImplementationOnce(() => {
            throw new Error('something gone wrong');
        });
        expect(addCustomer(formData, birthday)).rejects.toThrowError();
    });

    it('deletes empty values before sending', () => {
        formData.set('notes', '');
        const cleanedNewCustomer = { ...newCustomer };
        delete cleanedNewCustomer.notes;

        addCustomer(formData, birthday);
        expect(mockAdd).toBeCalledWith(cleanedNewCustomer);
    });
});
