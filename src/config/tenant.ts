export const tenant = {
  institutionName: "MLRIT",
  shortName: "MLRIT",
  fullName: "Marri Laxman Reddy Institute of Technology and Management",
  tagline: "Zero-lag media delivery for every campus moment",
  contactEmail: "media@mlrit.ac.in",
  websiteUrl: "https://mlrit.ac.in",
  logoPath: "/logo.png",
  cloudinaryPrefix: "mlrit",
  brandAccent: "#0066ff",
  categories: ["events", "campus", "sports", "academics", "cultural", "technical"],
  social: {
    instagram: "https://instagram.com/mlrit_official",
    youtube: "https://youtube.com/@mlrit",
    linkedin: "https://linkedin.com/school/mlrit",
  },
} as const;

export type TenantConfig = typeof tenant;
