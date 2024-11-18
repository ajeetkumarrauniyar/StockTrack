import { Resend } from "resend";

// Initialize Resend with API key
const resend = new Resend(process.env.RESEND_API_KEY);

// Validate environment variables on startup
if (!process.env.RESEND_API_KEY) {
  throw new Error(
    "RESEND_API_KEY environment variable is missing. Please check your .env.local file."
  );
}

// Default configuration
const CONFIG = {
  defaultFrom: "Asha Ent Inventory <onboarding@resend.dev>",
  defaultRecipients: ["ashaentjun@gmail.com", "nrauniyar2001@gmail.com"],
};

/**
 * Validates email configuration
 */
function validateEmailConfig({ from, to, subject, content }) {
  const errors = [];

  if (!from && !CONFIG.defaultFrom) {
    errors.push("Sender email is required");
  }

  if (
    !to &&
    (!CONFIG.defaultRecipients || CONFIG.defaultRecipients.length === 0)
  ) {
    errors.push("Recipient email is required");
  }

  if (!subject) {
    errors.push("Email subject is required");
  }

  if (!content.html && !content.text) {
    errors.push("Email content (html or text) is required");
  }

  return errors;
}

/**
 * Sends an email using Resend
 * @param {Object} options Email options
 * @param {string} [options.from] Sender email (falls back to default)
 * @param {string|string[]} [options.to] Recipient email(s) (falls back to default)
 * @param {string} options.subject Email subject
 * @param {Object} options.content Email content
 * @param {string} [options.content.html] HTML content
 * @param {string} [options.content.text] Plain text content
 * @returns {Promise} Send result
 */
export async function sendEmail({
  from = CONFIG.defaultFrom,
  to = CONFIG.defaultRecipients,
  subject,
  content,
}) {
  try {
    // Validate configuration
    const validationErrors = validateEmailConfig({
      from,
      to,
      subject,
      content,
    });

    if (validationErrors.length > 0) {
      throw new Error(
        `Email configuration errors: ${validationErrors.join(", ")}`
      );
    }

    // Prepare email data
    const emailData = {
      from,
      to: Array.isArray(to) ? to : [to],
      subject,
      ...(content.html && { html: content.html }),
      ...(content.text && { text: content.text }),
    };

    // Send email
    const result = await resend.emails.send(emailData);

    console.log("Email sent successfully:", {
      id: result.id,
      to: emailData.to,
      subject: emailData.subject,
    });

    return {
      success: true,
      messageId: result.id,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    console.error("Failed to send email:", error);
    throw new Error(`Email sending failed: ${error.message}`);
  }
}

// Export the resend instance for direct use if needed
export { resend };
