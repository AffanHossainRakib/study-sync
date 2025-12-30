export default function robots() {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", "/dashboard/", "/my-plans/", "/instances/"],
      },
    ],
    sitemap: "https://thestudysync.vercel.app/sitemap.xml",
  };
}
