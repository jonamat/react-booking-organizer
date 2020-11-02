import React, { FC } from 'react';
import { bindActionCreators } from 'redux';
import { RouteComponentProps } from 'react-router';
import { connect, ConnectedProps } from 'react-redux';
import MaterialTable from 'material-table';
import { toast } from 'react-toastify';
import { CircularProgress } from '@material-ui/core';

import { Service, RootState } from '../../types';
import { closeDialog, openDialog } from '../../redux';
import { MATERIAL_TABLE_LOCALIZATION } from '../../config';
import { deleteService } from '../../utils';
import Alert from '../../components/Alert';
import useStyles from './style';
import Center from '../../components/Center';

const mapStateToProps = (state: RootState) => ({
    services: state.database.services,
});
const mapDispatchToProps = (dispatch) => bindActionCreators({ closeDialog, openDialog }, dispatch);
const connector = connect(mapStateToProps, mapDispatchToProps);
type ReduxProps = ConnectedProps<typeof connector>;

const Services: FC<RouteComponentProps & ReduxProps> = ({ history, services, closeDialog, openDialog }) => {
    const classes = useStyles();

    if (!services) throw new Error('Internal error - Resources loading logic broken');

    const handleEditData = (_e: any, data: Service) => history.push('/edit-service/' + data.id);
    const handleAddElement = () => history.push('/add-service');

    const handleDelete = (service: Service) => {
        openDialog({
            title: 'Eliminazione in corso',
            content: (
                <Center style={{ height: 100 }}>
                    <CircularProgress />
                </Center>
            ),
        });
        deleteService(service)
            .then(() => {
                history.push('/services');
                toast.success('Servizio eliminato: ' + service.name);
            })
            .catch((error: Error) => toast.error(error.message))
            .finally(closeDialog);
    };

    const handleConfirmationDialog = (_e: any, data: Service) => {
        openDialog({
            title: 'Elimina servizio',
            content: (
                <Alert
                    cancelText="Annulla"
                    onCancel={closeDialog}
                    confirmText="Elimina"
                    onConfirm={() => handleDelete(data)}
                    contentText=" Eliminando questo servizio perderai il riferimento ad esso a tutti gli appuntamenti a cui è stato
        assegnato (ma non eliminerai gli appuntamenti). Non sarà possibile recuperare tali informazioni."
                />
            ),
        });
    };

    return (
        <div className={classes.container} data-testid="services">
            <MaterialTable
                columns={[
                    { title: 'Nome servizio', field: 'name' },
                    { title: 'Durata media (minuti)', field: 'averageDuration' },
                ]}
                data={services}
                title="Servizi"
                actions={[
                    {
                        icon: 'edit',
                        tooltip: 'Modifica',
                        onClick: handleEditData,
                    },
                    {
                        icon: 'delete',
                        tooltip: 'Elimina',
                        onClick: handleConfirmationDialog,
                    },
                    {
                        icon: 'add',
                        tooltip: 'Aggiungi servizio',
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
    React.memo(
        Services,
        (prevProps, nextProps) =>
            prevProps.location.search === nextProps.location.search && prevProps.services === nextProps.services,
    ),
);
