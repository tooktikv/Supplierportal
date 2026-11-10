export const routes = {
  onboarding: "/onboarding",
  registration: "/onboarding/registration",
  task: (id: string) => `/onboarding/tasks/${id}`,
  samples: "/sample-requests",
  sample: (id: string) => `/sample-requests/${id}`,
  submitSample: (id: string) => `/sample-requests/${id}/submit`,
  profile: "/profile",
  srm: "/srm",
  qualification: "/qualification",
  qualificationDetail: (id: string) => `/qualification/${id}`,
  help: "/help",
} as const;
