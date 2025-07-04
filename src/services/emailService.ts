const SENDER_EMAIL = 'fardinbaf@gmail.com';

export interface Email {
  to: string;
  subject: string;
  body: string;
}

export const sendEmail = async (email: Email): Promise<void> => {
  console.log(`
    ==================================================
    📧 SIMULATING EMAIL SEND 📧
    --------------------------------------------------
    From: ScamGuard <${SENDER_EMAIL}>
    To: ${email.to}
    Subject: ${email.subject}
    --------------------------------------------------
    Body:
    ${email.body}
    ==================================================
  `);
  // In a real app, this would be an API call to a backend service.
  // We can return a resolved promise to mimic async behavior.
  return Promise.resolve();
};
