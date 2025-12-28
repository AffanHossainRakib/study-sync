import { Resend } from "resend";

/**
 * Email service using Resend API
 * For sending reminder emails and notifications
 */

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

/**
 * Send a reminder email to a user
 */
export async function sendReminderEmail(to, subject, htmlContent) {
  if (!resend) {
    console.warn("Resend API key not configured, skipping email send");
    return { success: false, message: "Email service not configured" };
  }

  try {
    const { data, error } = await resend.emails.send({
      from: process.env.EMAIL_FROM || "StudySync <noreply@studysync.app>",
      to: [to],
      subject,
      html: htmlContent,
    });

    if (error) {
      console.error("Email send error:", error);
      return { success: false, error };
    }

    return { success: true, data };
  } catch (error) {
    console.error("Failed to send email:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Send a test email
 */
export async function sendTestEmail(to) {
  const subject = "Test Email from StudySync";
  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h1 style="color: #3b82f6;">StudySync Test Email</h1>
      <p>This is a test email from your StudySync application.</p>
      <p>If you're receiving this, your email notifications are working correctly!</p>
      <hr style="border: 1px solid #e5e7eb; margin: 20px 0;">
      <p style="color: #6b7280; font-size: 12px;">
        This is an automated message from StudySync. Please do not reply to this email.
      </p>
    </div>
  `;

  return sendReminderEmail(to, subject, htmlContent);
}

/**
 * Send deadline reminder email
 */
export async function sendDeadlineReminder(to, instanceData) {
  const { customTitle, studyPlanTitle, deadline } = instanceData;
  const title = customTitle || studyPlanTitle;

  const subject = `Reminder: ${title} deadline approaching`;
  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h1 style="color: #3b82f6;">📚 Study Plan Reminder</h1>
      <p>Your study plan <strong>${title}</strong> has a deadline approaching.</p>
      <p><strong>Deadline:</strong> ${new Date(
        deadline
      ).toLocaleDateString()}</p>
      <p>Don't forget to complete your study materials on time!</p>
      <a href="${
        process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
      }/instances/${instanceData.id}" 
         style="display: inline-block; background-color: #3b82f6; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; margin-top: 10px;">
        View Study Plan
      </a>
      <hr style="border: 1px solid #e5e7eb; margin: 20px 0;">
      <p style="color: #6b7280; font-size: 12px;">
        This is an automated reminder from StudySync. You can manage your notification preferences in your account settings.
      </p>
    </div>
  `;

  return sendReminderEmail(to, subject, htmlContent);
}

/**
 * Send daily study reminder
 */
export async function sendDailyReminder(to, userName, activeInstancesCount) {
  const subject = "Your Daily Study Reminder";
  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h1 style="color: #3b82f6;">Good morning, ${userName}! 📖</h1>
      <p>You have <strong>${activeInstancesCount}</strong> active study plan${
        activeInstancesCount !== 1 ? "s" : ""
      } waiting for you.</p>
      <p>Take a moment today to make progress on your learning journey!</p>
      <a href="${
        process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
      }/instances" 
         style="display: inline-block; background-color: #3b82f6; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; margin-top: 10px;">
        View Your Study Plans
      </a>
      <hr style="border: 1px solid #e5e7eb; margin: 20px 0;">
      <p style="color: #6b7280; font-size: 12px;">
        This is your scheduled daily reminder. You can change your notification preferences in settings.
      </p>
    </div>
  `;

  return sendReminderEmail(to, subject, htmlContent);
}

/**
 * Send study plan share invitation
 */
export async function sendShareInvitation(
  to,
  sharedByName,
  studyPlanTitle,
  studyPlanId,
  role
) {
  const subject = `${sharedByName} shared a study plan with you`;
  const roleText = role === "viewer" ? "view" : "view and edit";
  const planUrl = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/plans/${studyPlanId}`;

  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h1 style="color: #3b82f6;">📚 Study Plan Shared With You</h1>
      <p><strong>${sharedByName}</strong> has shared a study plan with you.</p>
      <div style="background-color: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0;">
        <h2 style="margin: 0 0 10px 0; color: #1f2937;">${studyPlanTitle}</h2>
        <p style="margin: 0; color: #6b7280;">You have been given <strong>${role}</strong> access to ${roleText} this study plan.</p>
      </div>
      <a href="${planUrl}" 
         style="display: inline-block; background-color: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin-top: 10px; font-weight: 600;">
        View Study Plan
      </a>
      <hr style="border: 1px solid #e5e7eb; margin: 20px 0;">
      <p style="color: #6b7280; font-size: 12px;">
        If you don't have a StudySync account yet, you'll be prompted to sign up to access this shared study plan.
      </p>
    </div>
  `;

  return sendReminderEmail(to, subject, htmlContent);
}
