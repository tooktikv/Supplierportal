export const routes = {
  onboarding: "/onboarding",
  registration: "/onboarding/registration",
  task: (id: string) => `/onboarding/tasks/${id}`,
  samples: "/sample-requests",
  newSample: "/sample-requests/new",
  sample: (id: string) => `/sample-requests/${id}`,
  submitSample: (id: string) => `/sample-requests/${id}/submit`,
  respond: (id: string) => `/sample-requests/${id}/respond`,
  profile: "/profile",
  srm: "/srm",
  notifications: "/notifications",
  help: "/help",
} as const;
