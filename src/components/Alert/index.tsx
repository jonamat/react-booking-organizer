import React, { FC } from 'react';
import { DialogContent, DialogContentText, DialogActions, Button } from '@material-ui/core';

interface AlertProps {
    onCancel: () => void;
    onConfirm: () => void;
    contentText: string;
    cancelText: string;
    confirmText: string;
}

const Alert: FC<AlertProps> = ({ onCancel, onConfirm, contentText, cancelText, confirmText }) => {
    return (
        <>
            <DialogContent>
                <DialogContentText>{contentText}</DialogContentText>
            </DialogContent>
            <DialogActions>
                <Button onClick={onCancel} color="primary" autoFocus>
                    {cancelText}
                </Button>
                <Button onClick={onConfirm} color="primary">
                    {confirmText}
                </Button>
            </DialogActions>
        </>
    );
};

export default Alert;
