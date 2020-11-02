import React, { FC } from 'react';
import { RouteComponentProps } from 'react-router';
import { connect, ConnectedProps } from 'react-redux';
import MaterialTable from 'material-table';

import { MATERIAL_TABLE_LOCALIZATION } from '../../config';
import { Customer, RootState } from '../../types';
import useStyles from './style';

interface CustomersProps extends ReduxProps, RouteComponentProps {}

const mapStateToProps = (state: RootState) => ({
    customers: state.database.customers,
});
const connector = connect(mapStateToProps);
type ReduxProps = ConnectedProps<typeof connector>;

const Customers: FC<CustomersProps> = ({ history, customers }) => {
    const classes = useStyles();

    if (!customers) throw new Error('Internal error - Resources loading logic broken');

    const handleEditData = (_e: any, data: Customer) => history.push('/edit-customer/' + data.id);
    const handleAddElement = () => history.push('/add-customer');
    const handleNewReservation = (_e: any, data: Customer) => history.push('/add-reservation?customerId=' + data.id);
    const handleCustomerDetails = (_e: any, data: Customer) => history.push('/customer-details/' + data.id);

    return (
        <div className={classes.container} data-testid="customers">
            <MaterialTable
                columns={[
                    { title: 'Nome', field: 'name' },
                    { title: 'Cognome', field: 'surname' },
                    { title: 'Identificatore', field: 'additionalIdentifier' },
                    { title: 'Telefono', field: 'phone' },
                    {
                        title: 'Data di nascita',
                        field: 'birthday',
                        render: (rowData) => rowData.birthday?.toLocaleDateString('it-IT'),
                    },
                ]}
                data={customers}
                title="Clienti"
                actions={[
                    {
                        icon: 'assignment',
                        tooltip: 'Vedi scheda cliente',
                        onClick: handleCustomerDetails,
                    },
                    {
                        icon: 'add_circle_outline',
                        tooltip: 'Assegna nuovo appuntamento',
                        onClick: handleNewReservation,
                    },
                    {
                        icon: 'edit',
                        tooltip: 'Modifica',
                        onClick: handleEditData,
                    },
                    {
                        icon: 'add',
                        tooltip: 'Aggiungi cliente',
                        isFreeAction: true,
                        onClick: handleAddElement,
                    },
                ]}
                options={{
                    actionsColumnIndex: -1,
                    search: true,
                    pageSize: 10,
                    pageSizeOptions: [10, 20, 50],
                }}
                localization={MATERIAL_TABLE_LOCALIZATION}
            />
        </div>
    );
};

export default connector(
    React.memo(Customers, (prevProps, nextProps) => prevProps.location.search === nextProps.location.search),
);
