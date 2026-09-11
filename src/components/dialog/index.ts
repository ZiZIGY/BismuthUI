export interface IDialogProps {
  /** Named for a screen reader when nothing inside names the window. */
  label?: string;
  /** A press outside the window closes it. Escape always does. */
  dismissible?: boolean;
}
