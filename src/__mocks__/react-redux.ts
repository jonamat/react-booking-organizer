import { Customer, Employee, Reservation, Service } from '../types';

export const __mockCustomers: Array<Customer> = [
    {
        id: 'customer-FAKE-ID1',
        name: 'Customer name',
        surname: 'Surname',
    },
    {
        id: 'customer-FAKE-ID2',
        name: 'Other name',
        surname: 'Other surname',
    },
];

export const __mockEmployees: Array<Employee> = [
    {
        id: 'employee-FAKE-ID1',
        name: 'Employee name 1',
    },
    {
        id: 'employee-FAKE-ID2',
        name: 'Employee name 2',
    },
];

export const __mockServices: Array<Service> = [
    {
        id: 'service-FAKE-ID1',
        name: 'fake service 1',
        averageDuration: 30,
    },
    {
        id: 'service-FAKE-ID2',
        name: 'fake service 2',
        averageDuration: 45,
    },
];

export const __mockReservations: Array<Reservation> = [
    {
        id: 'reservation-FAKE-ID1',
        date: new Date('1 Jan 2000 10:00 GMT+0100'),
        serviceId: __mockServices[0].id,
        customerId: __mockCustomers[0].id,
        employeeId: __mockEmployees[0].id,
        notes: 'something',
    },
    {
        id: 'reservation-FAKE-ID2',
        date: new Date('1 Jan 2040 10:00 GMT+0100'),
        serviceId: __mockServices[1].id,
        customerId: __mockCustomers[0].id,
        employeeId: __mockEmployees[1].id,
        notes: 'something2',
    },
];

export let useStore = () => ({
    getState: () => ({
        database: {
            customers: __mockCustomers,
            employees: __mockEmployees,
            services: __mockServices,
            reservations: __mockReservations,
        },
    }),
});

export const __setUseStore = (value) => (useStore = value);
export const useDispatch = () => undefined;
export const connect = () => (component) => component;
