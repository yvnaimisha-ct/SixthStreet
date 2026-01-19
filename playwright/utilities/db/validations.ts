// validationProfiles.ts

export type ValidationProfile = {
  title?: boolean;
  slug?: boolean;
  body?: boolean;
  contentType?: boolean;
  published?: boolean;
};

export const validationProfiles: Record<string, ValidationProfile> = {
  staticPolicyPage: {
    title: true,
    slug: true,
    body: true,
    contentType: true,
    published: true,
  },
};
