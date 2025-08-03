import { FormConfig } from "../FormBuilder";
import { maxLengthValidator } from "../validators";

export const friendRequestFormConfig: FormConfig = {
  fields: [
    {
      name: "message",
      type: "textarea",
      label: "Message",
      placeholder: "Add a personal message (optional)",
      rows: 3,
      validate: (value) => {
        if (value && value.length > 200) {
          return "Message must be less than 200 characters";
        }
        return undefined;
      },
    },
  ],
  submitText: "Send Friend Request",
  loadingText: "Sending...",
  endpoint: "/api/social/friend-requests",
  method: "POST",
  containerClassName: "rounded-lg border border-zinc-950/10 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-zinc-900",
}; 