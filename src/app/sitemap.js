import { getDb } from "@/lib/mongodb";

export default async function sitemap() {
  const baseUrl = "https://thestudysync.vercel.app";

  // Static routes
  const staticRoutes = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${baseUrl}/login`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/register`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/plans`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/create-plan`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/my-plans`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/dashboard`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.7,
    },
  ];

  try {
    // Fetch dynamic public study plans
    const db = await getDb();
    const studyPlans = await db
      .collection("studyplans")
      .find({ isPublic: true })
      .sort({ createdAt: -1 })
      .limit(1000)
      .toArray();

    const dynamicRoutes = studyPlans.map((plan) => ({
      url: `${baseUrl}/plans/${plan._id.toString()}`,
      lastModified: plan.updatedAt || plan.createdAt || new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    }));

    return [...staticRoutes, ...dynamicRoutes];
  } catch (error) {
    console.error("Error generating sitemap:", error);
    // Return static routes if database connection fails
    return staticRoutes;
  }
}
