const allowedEmails = [
  "ashaentjun@gmail.com",
  "rauniyarajeet5487@gmail.com",
  // Add more allowed email addresses here
];

export const clerkConfig = {
  signIn: {
    allowedIdentities: ["oauth_google"],
  },
  afterSignInUrl: "/dashboard",
  afterSignUpUrl: "/dashboard",
};

export const isAllowedEmail = (email) =>
  allowedEmails.some(
    (allowedEmail) => allowedEmail.toLowerCase() === email?.toLowerCase()
  );
