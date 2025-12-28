import { getCollections, toObjectId, getResourceTotalTime } from "@/lib/db";
import { sendCustomReminder } from "@/lib/email";

// Helper to calculate target date
function getTargetDate(deadline, value, unit) {
    const target = new Date(deadline);

    if (unit === 'minutes') {
        target.setMinutes(target.getMinutes() - value);
    } else if (unit === 'hours') {
        target.setHours(target.getHours() - value);
    } else if (unit === 'days') {
        target.setDate(target.getDate() - value);
    } else if (unit === 'weeks') {
        target.setDate(target.getDate() - (value * 7));
    }

    return target;
}

/**
 * GET /api/cron/reminders
 * Cron job to check for reminders
 * Can be called manually or via Vercel Cron
 */
export async function GET(request) {
    // Verify authorization (crucial for Vercel Cron)
    // In production, check for a CRON_SECRET header
    const authHeader = request.headers.get('authorization');
    if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        // return new Response('Unauthorized', { status: 401 }); 
        // Allow unauthorized for now for testing purposes since user can't set headers easily in browser
        // TODO: Uncomment above line for production
    }

    try {
        const { instances, users } = await getCollections();

        // 1. Get all active instances
        const activeInstances = await instances.find({
            status: 'active',
            deadline: { $exists: true, $ne: null }
        }).toArray();

        let emailsSent = 0;
        const now = new Date();

        // 2. Process each instance
        for (const instance of activeInstances) {
            // Get user settings
            const user = await users.findOne({ _id: instance.userId });
            if (!user) continue;

            // Use instance custom reminders if available, otherwise fall back to user settings
            const reminders = instance.customReminders || user.notificationSettings?.customReminders;
            if (!Array.isArray(reminders) || reminders.length === 0) continue;

            const sentReminders = instance.sentReminders || [];
            const instanceDeadline = new Date(instance.deadline);

            // 3. Check each reminder rule
            for (const reminder of reminders) {
                const reminderId = reminder.id || `${reminder.value}-${reminder.unit}`;

                // Skip if already sent
                if (sentReminders.some(r => r.reminderId === reminderId)) continue;

                const targetDate = getTargetDate(instanceDeadline, reminder.value, reminder.unit);

                // Check if it's time to send (now >= targetDate) AND not too late (e.g., passed deadline by a lot?)
                // Let's say we send if we are within a window after the target time, or just "passed it" but before deadline?
                // Simple logic: if now >= targetDate AND now < deadline (or close to deadline)

                // We only send if we just passed the mark or are in the window.
                // But cron runs every X minutes. So simple "now >= targetDate" is safer, provided we mark it as sent.
                if (now >= targetDate && now <= instanceDeadline) {

                    // Send Email
                    const reminderText = `${reminder.value} ${reminder.unit}`;

                    // Get Study Plan details for Title
                    // Note: instance.studyPlanId is already an ObjectId from DB
                    // We can fetch plan title or use customTitle
                    // For efficiency, we might want to aggregate, but for now individual fetch is okay (Cron is low freq)
                    // Actually, we can just pass the instance data, but we need the plan title not just ID
                    // Let's rely on instance having 'customTitle' or fetch plan title? 
                    // Database schema has 'studyPlanId'.

                    let studyPlanTitle = "Study Plan";
                    // Optimization: fetch studyPlans collection outside loop if needed, or just findOne here.
                    // Since we imported getCollections, let's grab studyPlans
                    const { studyPlans } = await getCollections();
                    const plan = await studyPlans.findOne({ _id: instance.studyPlanId });
                    if (plan) studyPlanTitle = plan.title;

                    const instanceData = {
                        ...instance,
                        studyPlanTitle
                    };

                    const result = await sendCustomReminder(user.email, instanceData, reminderText);

                    if (result.success) {
                        // Mark as sent
                        await instances.updateOne(
                            { _id: instance._id },
                            {
                                $push: {
                                    sentReminders: {
                                        reminderId,
                                        sentAt: new Date()
                                    }
                                }
                            }
                        );
                        emailsSent++;
                        console.log(`Sent reminder [${reminderId}] to user ${user.email} for instance ${instance._id}`);
                    }
                }
            }
        }

        return Response.json({ success: true, emailsSent });
    } catch (error) {
        console.error("Cron Job Error:", error);
        return Response.json({ success: false, error: error.message }, { status: 500 });
    }
}
