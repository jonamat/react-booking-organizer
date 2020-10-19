/**
 * Unit test suite
 *
 * Target: editService
 * Tests:
 * - Data validation
 * - API call
 * - Rejections handling
 * - Functionality
 *
 * For the implementation see {@link '../../routes/EditService'}
 */

// Test configuration
import { NewService } from '../../types';

// Component to test
import editService from '../editService';

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

const mockSet = jest.fn((newService) => ({
    id: 'id',
    newService,
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

describe('editService fn', () => {
    it('calls database with valid arg', () => {
        editService('id', formDataArg);
        expect(mockSet).toBeCalledWith(newService);
    });

    it('prevents submit if there are missing required fields', () => {
        formDataArg.delete('name');
        expect(editService('id', formDataArg)).rejects.toThrowError();
        formDataArg.set('name', 'name');
    });

    it('returns a customer object', () => {
        expect(editService('id', formDataArg)).resolves.toStrictEqual({ ...newService, id: 'id' });
    });

    it('throws error if client cannot reach server', () => {
        mockSet.mockImplementationOnce(() => {
            throw new Error('something gone wrong');
        });
        expect(editService('id', formDataArg)).rejects.toThrowError();
    });

    // Currently not necessary - add it if you will implement additional non-required fields
    it.skip('deletes empty values before sending', () => {
        formDataArg.set('notes', '');
        const cleanedNewService = { ...newService };
        delete cleanedNewService.notes;

        editService('id', formDataArg);
        expect(mockSet).toBeCalledWith(cleanedNewService);
    });
});
