import React, { FC } from 'react';
import { bindActionCreators } from 'redux';
import { connect, ConnectedProps } from 'react-redux';
import { Dialog, DialogTitle } from '@material-ui/core';

import { closeDialog } from '../../redux';
import { RootState } from '../../types';

const mapStateToProps = (state: RootState) => ({
    dialog: state.status.dialog,
});
const mapDispatchToProps = (dispatch) => bindActionCreators({ closeDialog }, dispatch);
const connector = connect(mapStateToProps, mapDispatchToProps);
type ReduxProps = ConnectedProps<typeof connector>;

const ConnectedDialog: FC<ReduxProps> = ({ dialog, closeDialog }) => (
    <Dialog open={dialog.open} onClose={closeDialog}>
        <DialogTitle>{dialog.title}</DialogTitle>
        {dialog.content}
    </Dialog>
);

export default connector(ConnectedDialog);
