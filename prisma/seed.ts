import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const ASSETS = [
  { cloudinaryPublicId: "mlrit/convocation-2024", title: "Convocation 2024", category: "events", type: "image", tags: ["events"] },
  { cloudinaryPublicId: "mlrit/freshers-day-2024", title: "Freshers Day 2024", category: "events", type: "image", tags: ["events"] },
  { cloudinaryPublicId: "mlrit/annual-day-2023", title: "Annual Day 2023", category: "events", type: "image", tags: ["events"] },
  { cloudinaryPublicId: "mlrit/farewell-2024", title: "Farewell Ceremony 2024", category: "events", type: "image", tags: ["events"] },
  { cloudinaryPublicId: "mlrit/independence-day-2023", title: "Independence Day 2023", category: "events", type: "image", tags: ["events"] },
  { cloudinaryPublicId: "mlrit/republic-day-2024", title: "Republic Day 2024", category: "events", type: "image", tags: ["events"] },
  { cloudinaryPublicId: "mlrit/teachers-day-2023", title: "Teachers Day Celebration", category: "events", type: "image", tags: ["events"] },
  { cloudinaryPublicId: "mlrit/new-year-2024", title: "New Year Celebration 2024", category: "events", type: "image", tags: ["events"] },
  { cloudinaryPublicId: "mlrit/orientation-2023", title: "Orientation Day 2023", category: "events", type: "image", tags: ["events"] },
  { cloudinaryPublicId: "mlrit/prize-distribution", title: "Prize Distribution Ceremony", category: "events", type: "image", tags: ["events"] },
  { cloudinaryPublicId: "mlrit/main-gate", title: "MLRIT Main Gate", category: "campus", type: "image", tags: ["campus"] },
  { cloudinaryPublicId: "mlrit/main-block", title: "Main Academic Block", category: "campus", type: "image", tags: ["campus"] },
  { cloudinaryPublicId: "mlrit/library", title: "Central Library", category: "campus", type: "image", tags: ["campus"] },
  { cloudinaryPublicId: "mlrit/cafeteria", title: "Campus Cafeteria", category: "campus", type: "image", tags: ["campus"] },
  { cloudinaryPublicId: "mlrit/auditorium", title: "MLRIT Auditorium", category: "campus", type: "image", tags: ["campus"] },
  { cloudinaryPublicId: "mlrit/computer-labs", title: "Computer Science Labs", category: "campus", type: "image", tags: ["campus"] },
  { cloudinaryPublicId: "mlrit/sports-ground", title: "Sports Ground", category: "campus", type: "image", tags: ["campus"] },
  { cloudinaryPublicId: "mlrit/hostel-block", title: "Hostel Block", category: "campus", type: "image", tags: ["campus"] },
  { cloudinaryPublicId: "mlrit/cricket-match", title: "Inter-College Cricket 2024", category: "sports", type: "image", tags: ["sports"] },
  { cloudinaryPublicId: "mlrit/basketball-tournament", title: "Basketball Tournament", category: "sports", type: "image", tags: ["sports"] },
  { cloudinaryPublicId: "mlrit/football-match", title: "Football Championship", category: "sports", type: "image", tags: ["sports"] },
  { cloudinaryPublicId: "mlrit/athletics-meet", title: "Annual Athletics Meet", category: "sports", type: "image", tags: ["sports"] },
  { cloudinaryPublicId: "mlrit/chess-competition", title: "Chess Competition", category: "sports", type: "image", tags: ["sports"] },
  { cloudinaryPublicId: "mlrit/badminton-finals", title: "Badminton Finals", category: "sports", type: "image", tags: ["sports"] },
  { cloudinaryPublicId: "mlrit/kabaddi-match", title: "Kabaddi Tournament", category: "sports", type: "image", tags: ["sports"] },
  { cloudinaryPublicId: "mlrit/classroom-session", title: "Classroom Session", category: "academics", type: "image", tags: ["academics"] },
  { cloudinaryPublicId: "mlrit/workshop-iot", title: "IoT Workshop", category: "academics", type: "image", tags: ["academics"] },
  { cloudinaryPublicId: "mlrit/guest-lecture", title: "Guest Lecture Series", category: "academics", type: "image", tags: ["academics"] },
  { cloudinaryPublicId: "mlrit/exam-hall", title: "Examination Hall", category: "academics", type: "image", tags: ["academics"] },
  { cloudinaryPublicId: "mlrit/project-demo", title: "Final Year Project Demo", category: "academics", type: "image", tags: ["academics"] },
  { cloudinaryPublicId: "mlrit/seminar-hall", title: "Seminar Hall", category: "academics", type: "image", tags: ["academics"] },
  { cloudinaryPublicId: "mlrit/research-lab", title: "Research Laboratory", category: "academics", type: "image", tags: ["academics"] },
  { cloudinaryPublicId: "mlrit/dance-performance", title: "Cultural Dance Performance", category: "cultural", type: "image", tags: ["cultural"] },
  { cloudinaryPublicId: "mlrit/music-night", title: "Music Night 2024", category: "cultural", type: "image", tags: ["cultural"] },
  { cloudinaryPublicId: "mlrit/drama-show", title: "Drama and Theatre Show", category: "cultural", type: "image", tags: ["cultural"] },
  { cloudinaryPublicId: "mlrit/art-exhibition", title: "Art Exhibition 2023", category: "cultural", type: "image", tags: ["cultural"] },
  { cloudinaryPublicId: "mlrit/fashion-show", title: "Fashion Show", category: "cultural", type: "image", tags: ["cultural"] },
  { cloudinaryPublicId: "mlrit/rangoli-competition", title: "Rangoli Competition", category: "cultural", type: "image", tags: ["cultural"] },
  { cloudinaryPublicId: "mlrit/photography-club", title: "Photography Club Exhibition", category: "cultural", type: "image", tags: ["cultural"] },
  { cloudinaryPublicId: "mlrit/techfest-2024", title: "TechFest 2024", category: "technical", type: "image", tags: ["technical"] },
  { cloudinaryPublicId: "mlrit/hackathon-2024", title: "24hr Hackathon 2024", category: "technical", type: "image", tags: ["technical"] },
  { cloudinaryPublicId: "mlrit/robotics-expo", title: "Robotics Expo", category: "technical", type: "image", tags: ["technical"] },
  { cloudinaryPublicId: "mlrit/coding-contest", title: "Coding Contest", category: "technical", type: "image", tags: ["technical"] },
  { cloudinaryPublicId: "mlrit/paper-presentation", title: "Paper Presentation 2024", category: "technical", type: "image", tags: ["technical"] },
  { cloudinaryPublicId: "mlrit/project-expo", title: "Project Expo 2024", category: "technical", type: "image", tags: ["technical"] },
  { cloudinaryPublicId: "mlrit/campus-tour", title: "Campus Tour", category: "campus", type: "video", tags: ["campus", "video"] },
  { cloudinaryPublicId: "mlrit/techfest-highlights", title: "TechFest Highlights", category: "technical", type: "video", tags: ["technical", "video"] },
  { cloudinaryPublicId: "mlrit/cultural-fest-video", title: "Cultural Fest 2024", category: "cultural", type: "video", tags: ["cultural", "video"] },
  { cloudinaryPublicId: "mlrit/sports-day-video", title: "Sports Day 2024", category: "sports", type: "video", tags: ["sports", "video"] },
  { cloudinaryPublicId: "mlrit/convocation-video", title: "Convocation Ceremony", category: "events", type: "video", tags: ["events", "video"] },
];

async function main() {
  console.log("Seeding database with", ASSETS.length, "media assets...");
  for (const asset of ASSETS) {
    await prisma.media.upsert({
      where: { cloudinaryPublicId: asset.cloudinaryPublicId },
      update: {},
      create: {
        cloudinaryPublicId: asset.cloudinaryPublicId,
        title: asset.title,
        category: asset.category,
        type: asset.type,
        tags: JSON.stringify(asset.tags),
      },
    });
  }
  const count = await prisma.media.count();
  console.log("Done. Total records in DB:", count);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
