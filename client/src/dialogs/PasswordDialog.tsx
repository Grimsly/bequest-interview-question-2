import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";

/**
 * Dialog for entering a password
 */
export function PasswordDialog({
  isOpen,
  setIsOpen,
  confirmText = "Confirm",
  onConfirmPress,
}: {
  /** Whether the dialog is open */
  isOpen: boolean;
  /** Function to open or close the dialog */
  setIsOpen: (isOpen: boolean) => void;
  /** Text to show for the confirm button */
  confirmText?: string;
  /** Callback on confirm press */
  onConfirmPress: (password: string) => void;
}) {
  return (
    <Dialog
      open={isOpen}
      onClose={() => setIsOpen(false)}
      PaperProps={{
        component: "form",
        onSubmit: (event: React.FormEvent<HTMLFormElement>) => {
          event.preventDefault();
          const formData = new FormData(event.currentTarget);
          const formJson = Object.fromEntries((formData as any).entries());
          const password = formJson.password;
          onConfirmPress(password);
          setIsOpen(false);
        },
      }}
    >
      <DialogTitle>Type in your password</DialogTitle>
      <DialogContent>
        <DialogContentText>
          The password will be used to either encrypt or decrypt your data.
        </DialogContentText>
        <TextField
          autoFocus
          required
          margin="dense"
          id="password"
          name="password"
          label="Password"
          type="password"
          fullWidth
          variant="standard"
        />
      </DialogContent>
      <DialogActions>
        <Button
          onClick={() => {
            setIsOpen(false);
          }}
        >
          Cancel
        </Button>
        <Button type="submit">{confirmText}</Button>
      </DialogActions>
    </Dialog>
  );
}
