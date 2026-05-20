import React from "react";
import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Typography,
} from "@mui/material";

type ConfirmDeleteDialogProps = {
  open: boolean;
  title?: string;
  entityName?: string;
  description?: string;
  warningText?: string;
  loading?: boolean;
  onCancel: () => void;
  onConfirm: () => void;
  confirmLabel?: string;
  cancelLabel?: string;
  cancelButtonSx?: any;
};

function ConfirmDeleteDialog({
  open,
  title = "Delete",
  entityName = "",
  description = "",
  warningText = "This action is permanent and cannot be undone.",
  loading = false,
  onCancel,
  onConfirm,
  confirmLabel = "Delete",
  cancelLabel = "Cancel",
  cancelButtonSx,
}: ConfirmDeleteDialogProps) {
  return (
    <Dialog
      open={open}
      onClose={onCancel}
      fullWidth
      maxWidth="xs"
      PaperProps={{
        sx: {
          borderRadius: 2,
          boxShadow: "0 16px 40px rgba(0,0,0,0.25)",
        },
      }}
    >
      <DialogTitle
        sx={{
          fontWeight: 700,
          pb: 1,
          borderBottom: "1px solid",
          borderColor: "divider",
        }}
      >
        <Typography variant="h5" sx={{ fontWeight: 700 }}>
          {title}
        </Typography>
      </DialogTitle>
      <DialogContent sx={{ pt: 2.25 }}>
        <DialogContentText sx={{ color: "text.primary", mb: 0.75 }}>
          Are you sure you want to delete <strong>"{entityName}"</strong>?
        </DialogContentText>
        {description ? (
          <DialogContentText sx={{ color: "text.secondary", mb: 1.5 }}>
            {description}
          </DialogContentText>
        ) : null}
        <Alert
          severity="warning"
          sx={{
            borderRadius: 1.5,
            backgroundColor: "rgba(237, 108, 2, 0.12)",
            color: "warning.dark",
            "& .MuiAlert-message": { fontWeight: 500 },
          }}
        >
          {warningText}
        </Alert>
      </DialogContent>
      <DialogActions
        sx={{
          px: 3,
          pb: 2.25,
          pt: 1.5,
          gap: 1,
          borderTop: "1px solid",
          borderColor: "divider",
        }}
      >
        <Button onClick={onCancel} disabled={loading} variant="outlined" sx={cancelButtonSx}>
          {cancelLabel}
        </Button>
        <Button onClick={onConfirm} disabled={loading} color="error" variant="contained">
          {loading ? "Deleting..." : confirmLabel}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default ConfirmDeleteDialog;
