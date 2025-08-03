import { FormConfig } from "../FormBuilder";

export const loanRequestFormConfig: FormConfig = {
  fields: [
    {
      name: "startDate",
      type: "date",
      label: "Start Date",
      placeholder: "Select start date",
      required: true,
      validate: (value) => {
        if (!value) return "Start date is required";
        const date = new Date(value);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        if (date < today) {
          return "Start date cannot be in the past";
        }
        return undefined;
      },
    },
    {
      name: "endDate",
      type: "date",
      label: "End Date",
      placeholder: "Select end date",
      required: true,
      validate: (value, allValues) => {
        if (!value) return "End date is required";
        const endDate = new Date(value);
        const startDate = new Date(allValues?.startDate || "");
        if (endDate <= startDate) {
          return "End date must be after start date";
        }
        return undefined;
      },
    },
    {
      name: "message",
      type: "textarea",
      label: "Message",
      placeholder: "Add a message to the tool owner",
      rows: 3,
      validate: (value) => {
        if (value && value.length > 300) {
          return "Message must be less than 300 characters";
        }
        return undefined;
      },
    },
  ],
  submitText: "Request Tool",
  loadingText: "Sending request...",
  endpoint: "/api/loans",
  method: "POST",
  containerClassName:
    "rounded-lg border border-zinc-950/10 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-zinc-900",
};
