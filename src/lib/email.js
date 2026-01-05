import nodemailer from "nodemailer";

/**
 * Email service using Gmail SMTP
 * For sending reminder emails and notifications
 */

// Gmail SMTP transporter
const gmailTransporter =
  process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD
    ? nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: process.env.GMAIL_USER,
          pass: process.env.GMAIL_APP_PASSWORD,
        },
      })
    : null;

/**
 * Send an email to a user
 */
export async function sendReminderEmail(to, subject, htmlContent) {
  if (!gmailTransporter) {
    console.warn("Gmail not configured, skipping email send");
    return { success: false, message: "Email service not configured" };
  }

  try {
    const info = await gmailTransporter.sendMail({
      from: `The Study Sync <${process.env.GMAIL_USER}>`,
      to,
      subject,
      html: htmlContent,
    });
    console.log("Email sent via Gmail:", info.messageId);
    return { success: true, data: info };
  } catch (error) {
    console.error("Gmail send error:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Send a test email
 */
export async function sendTestEmail(to) {
  const subject = "Test Email from The Study Sync";
  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h1 style="color: #3b82f6;">The Study Sync Test Email</h1>
      <p>This is a test email from your The Study Sync application.</p>
      <p>If you're receiving this, your email notifications are working correctly!</p>
      <hr style="border: 1px solid #e5e7eb; margin: 20px 0;">
      <p style="color: #6b7280; font-size: 12px;">
        This is an automated message from The Study Sync. Please do not reply to this email.
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
        This is an automated reminder from The Study Sync. You can manage your notification preferences in your account settings.
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
  const planUrl = `${
    process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
  }/plans/${studyPlanId}`;

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
        If you don't have a The Study Sync account yet, you'll be prompted to sign up to access this shared study plan.
      </p>
    </div>
  `;

  return sendReminderEmail(to, subject, htmlContent);
}

/**
 * Send custom reminder email
 */
export async function sendCustomReminder(to, instanceData, reminderType) {
  const { customTitle, studyPlanTitle, deadline } = instanceData;
  const title = customTitle || studyPlanTitle;

  // Format reminder text based on type and value
  // reminderType format example: "1 day before", "2 hours before"
  const subject = `Reminder: ${title} due in ${reminderType}`;

  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h1 style="color: #3b82f6;">⏰ Study Plan Reminder</h1>
      <p>This is a reminder for your study plan <strong>${title}</strong>.</p>
      <div style="background-color: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0;">
        <p style="margin: 0; font-size: 18px; font-weight: bold; color: #1f2937;">
          Due in ${reminderType}
        </p>
        <p style="margin: 10px 0 0 0; color: #4b5563;">
          <strong>Deadline:</strong> ${new Date(deadline).toLocaleString()}
        </p>
      </div>
      <p>Click below to jump back into your studies:</p>
      <a href="${
        process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
      }/instances/${instanceData._id}" 
         style="display: inline-block; background-color: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin-top: 10px; font-weight: 600;">
        Go to Study Plan
      </a>
      <hr style="border: 1px solid #e5e7eb; margin: 20px 0;">
      <p style="color: #6b7280; font-size: 12px;">
        You received this email because you set a custom reminder for this study plan.
      </p>
    </div>
  `;

  return sendReminderEmail(to, subject, htmlContent);
}
