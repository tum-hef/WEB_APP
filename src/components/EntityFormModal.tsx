import React from "react";
import {
  Box,
  Button,
  Divider,
  Grid,
  MenuItem,
  Modal,
  TextField,
  Typography,
} from "@mui/material";

type FormField = {
  name: string;
  label: string;
  type?: string;
  multiline?: boolean;
  minRows?: number;
  xs?: number;
  sm?: number;
};

type EntityFormModalProps = {
  open: boolean;
  onClose: () => void;
  title: string;
  sectionTitle: string;
  formik: any;
  fields: FormField[];
  submitting: boolean;
  submitLabel: string;
  primaryButtonSx?: any;
  cancelButtonSx?: any;
  topContent?: React.ReactNode;
};

function EntityFormModal({
  open,
  onClose,
  title,
  sectionTitle,
  formik,
  fields,
  submitting,
  submitLabel,
  primaryButtonSx,
  cancelButtonSx,
  topContent,
}: EntityFormModalProps) {
  return (
    <Modal open={open} onClose={onClose}>
      <Box
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: { xs: "94%", sm: 640 },
          maxHeight: "88vh",
          overflowY: "auto",
          bgcolor: "background.paper",
          borderRadius: 2,
          boxShadow: "0 16px 40px rgba(0,0,0,0.25)",
          p: { xs: 2, sm: 3 },
          display: "flex",
          flexDirection: "column",
          gap: 2.5,
        }}
      >
        <Box>
          <Typography variant="h5" fontWeight={700}>
            {title}
          </Typography>
        </Box>
        <Divider />

        {topContent}

        <Typography variant="subtitle2" color="text.secondary">
          {sectionTitle}
        </Typography>
        <Grid container spacing={2}>
          {fields.map((field) => (
            <Grid item xs={field.xs ?? 12} sm={field.sm ?? 12} key={field.name}>
              <TextField
                label={field.label}
                type={field.type ?? "text"}
                name={field.name}
                value={formik.values[field.name]}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={
                  formik.touched[field.name] && Boolean(formik.errors[field.name])
                }
                helperText={formik.touched[field.name] && formik.errors[field.name]}
                fullWidth
                multiline={field.multiline}
                minRows={field.minRows}
              />
            </Grid>
          ))}
        </Grid>

        <Divider />
        <Box display="flex" justifyContent="flex-end" gap={1.25}>
          <Button
            variant="contained"
            onClick={() => formik.submitForm()}
            disabled={submitting || !formik.isValid}
            sx={primaryButtonSx}
          >
            {submitting ? `${submitLabel}...` : submitLabel}
          </Button>
          <Button
            variant="outlined"
            onClick={onClose}
            disabled={submitting}
            sx={cancelButtonSx}
          >
            Cancel
          </Button>
        </Box>
      </Box>
    </Modal>
  );
}

export default EntityFormModal;
