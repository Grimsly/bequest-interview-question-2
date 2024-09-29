import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";

/**
 * Dialog for reverting data back to a previous version
 */
export function RevertDialog({
  isOpen,
  setIsOpen,
  descriptionText,
  onConfirmPress,
}: {
  /** Whether the dialog is open */
  isOpen: boolean;
  /** Function to open or close the dialog */
  setIsOpen: (isOpen: boolean) => void;
  /** Text describing the nature of why there is a request for the data to be reverted */
  descriptionText: string;
  /** Callback on confirm press */
  onConfirmPress: () => void;
}) {
  return (
    <Dialog
      open={isOpen}
      onClose={() => setIsOpen(false)}
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
    >
      <DialogTitle id="alert-dialog-title">{descriptionText}</DialogTitle>
      <DialogContent>
        <DialogContentText id="alert-dialog-description">
          Would you like to revert your data back to a previous version?
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button
          onClick={() => {
            setIsOpen(false);
          }}
        >
          Cancel
        </Button>
        <Button
          onClick={() => {
            setIsOpen(false);
            onConfirmPress();
          }}
          autoFocus
        >
          Revert
        </Button>
      </DialogActions>
    </Dialog>
  );
}
