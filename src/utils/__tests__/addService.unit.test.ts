/**
 * Unit test suite
 *
 * Target: addService
 * Tests:
 * - Data validation
 * - API call
 * - Rejections handling
 * - Functionality
 *
 * For the implementation see {@link '../../routes/AddService'}
 */

// Test configuration
import { NewService } from '../../types';

// Component to test
import addService from '../addService';

const formDataArg = new FormData();
['name'].forEach((key) => formDataArg.set(key, key));
formDataArg.set('averageDuration', '30');
const newService: NewService = {
    name: 'name',
    averageDuration: 30,
};

/* -------------------------------------------------------------------------- */
/*                                    Mocks                                   */
/* -------------------------------------------------------------------------- */

const mockAdd = jest.fn((newService) => ({
    id: 'fakeId',
    newService,
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

describe('addService fn', () => {
    it('calls database with valid arg', () => {
        addService(formDataArg);
        expect(mockAdd).toBeCalledWith(newService);
    });

    it('prevents submit if there are missing required fields', () => {
        formDataArg.delete('name');
        expect(addService(formDataArg)).rejects.toThrowError();
        formDataArg.set('name', 'name');
    });

    it('returns a customer object', () => {
        expect(addService(formDataArg)).resolves.toStrictEqual({ ...newService, id: 'fakeId' });
    });

    it('throws error if client cannot reach server', () => {
        mockAdd.mockImplementationOnce(() => {
            throw new Error('something gone wrong');
        });
        expect(addService(formDataArg)).rejects.toThrowError();
    });

    // Currently not necessary - add it if you will implement additional non-required fields
    it.skip('deletes empty values before sending', () => {
        formDataArg.set('notes', '');
        const cleanedNewService = { ...newService };
        delete cleanedNewService.notes;

        addService(formDataArg);
        expect(mockAdd).toBeCalledWith(cleanedNewService);
    });
});
