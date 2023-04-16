import React, { useState, useEffect } from "react";
import Snackbar from "@mui/material/Snackbar";
import IconButton from "@mui/material/IconButton";
import { MdClose } from "react-icons/md";
import { Alert, AlertColor } from "@mui/material";

interface Props {
  message: string;
  severity: AlertColor;
  isOpenState: [boolean, React.Dispatch<React.SetStateAction<boolean>>];
  duration?: number;
}

const CustomSnackbar: React.FC<Props> = ({ message, severity, isOpenState, duration = 5000 }) => {
  const [isOpen, setIsOpen] = isOpenState;
  
  const handleClose = () => {
    setIsOpen(false);
  };

  return (
    <Snackbar
      open={isOpen}
      autoHideDuration={duration}
      onClose={handleClose}
      anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
    >
      <Alert
        severity={severity}
        action={
          <IconButton
            aria-label="close"
            color="inherit"
            size="small"
            onClick={handleClose}
          >
            <MdClose fontSize="inherit" />
          </IconButton>
        }
      >
        {message}
      </Alert>
    </Snackbar>
  );
};

export default CustomSnackbar;
