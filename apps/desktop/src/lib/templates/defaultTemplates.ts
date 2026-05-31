export const DEFAULT_TEMPLATES = [
  {
    id: "recipient-purpose-date",
    label: "Recipient purpose date",
    text: "FOR [RECIPIENT] ONLY\n[PURPOSE]\nCreated [DATE]\nDo not reuse"
  },
  {
    id: "verification-date",
    label: "Verification date",
    text: "FOR [RECIPIENT] VERIFICATION ONLY\nCreated [DATE]\nDo not reuse"
  },
  {
    id: "recipient-date",
    label: "Recipient date",
    text: "FOR [RECIPIENT] ONLY\nCreated [DATE]"
  },
  {
    id: "custom",
    label: "Custom text",
    text: ""
  }
] as const;
