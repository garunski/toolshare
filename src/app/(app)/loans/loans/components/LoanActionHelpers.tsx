export function getActionTitle(action?: string) {
  switch (action) {
    case "approve":
      return "Approve Loan Request";
    case "deny":
      return "Deny Loan Request";
    case "return":
      return "Return Tool";
    default:
      return "Loan Action";
  }
}

export function getActionDescription(action?: string) {
  switch (action) {
    case "approve":
      return "Are you sure you want to approve this loan request?";
    case "deny":
      return "Are you sure you want to deny this loan request?";
    case "return":
      return "Confirm that you are returning this tool.";
    default:
      return "";
  }
}

export function getActionButtonText(action?: string, isSubmitting?: boolean) {
  if (isSubmitting) return "Processing...";

  switch (action) {
    case "approve":
      return "Approve";
    case "deny":
      return "Deny";
    case "return":
      return "Return";
    default:
      return "Submit";
  }
}
