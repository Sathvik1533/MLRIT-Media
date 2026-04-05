/**
 * Single source of truth for all media assets.
 * 50 assets: 45 images + 5 videos — all on Cloudinary (diigktj8x).
 */

import type { MediaAsset } from "@/types/media";

export const MEDIA_ASSETS: MediaAsset[] = [
  { id: "convocation-2024", title: "Convocation 2024", type: "image", category: "events", cloudinaryPublicId: "mlrit/convocation-2024", width: 1920, height: 1080, capturedAt: "2026-04-05", tags: ["events"] },
  { id: "freshers-day-2024", title: "Freshers Day 2024", type: "image", category: "events", cloudinaryPublicId: "mlrit/freshers-day-2024", width: 1920, height: 1080, capturedAt: "2026-04-05", tags: ["events"] },
  { id: "annual-day-2023", title: "Annual Day 2023", type: "image", category: "events", cloudinaryPublicId: "mlrit/annual-day-2023", width: 1920, height: 1080, capturedAt: "2026-04-05", tags: ["events"] },
  { id: "farewell-2024", title: "Farewell Ceremony 2024", type: "image", category: "events", cloudinaryPublicId: "mlrit/farewell-2024", width: 1920, height: 1080, capturedAt: "2026-04-05", tags: ["events"] },
  { id: "independence-day-2023", title: "Independence Day 2023", type: "image", category: "events", cloudinaryPublicId: "mlrit/independence-day-2023", width: 1920, height: 1080, capturedAt: "2026-04-05", tags: ["events"] },
  { id: "republic-day-2024", title: "Republic Day 2024", type: "image", category: "events", cloudinaryPublicId: "mlrit/republic-day-2024", width: 1920, height: 1080, capturedAt: "2026-04-05", tags: ["events"] },
  { id: "teachers-day-2023", title: "Teachers Day Celebration", type: "image", category: "events", cloudinaryPublicId: "mlrit/teachers-day-2023", width: 1920, height: 1080, capturedAt: "2026-04-05", tags: ["events"] },
  { id: "new-year-2024", title: "New Year Celebration 2024", type: "image", category: "events", cloudinaryPublicId: "mlrit/new-year-2024", width: 1920, height: 1080, capturedAt: "2026-04-05", tags: ["events"] },
  { id: "orientation-2023", title: "Orientation Day 2023", type: "image", category: "events", cloudinaryPublicId: "mlrit/orientation-2023", width: 1920, height: 1080, capturedAt: "2026-04-05", tags: ["events"] },
  { id: "prize-distribution", title: "Prize Distribution Ceremony", type: "image", category: "events", cloudinaryPublicId: "mlrit/prize-distribution", width: 1920, height: 1080, capturedAt: "2026-04-05", tags: ["events"] },
  { id: "main-gate", title: "MLRIT Main Gate", type: "image", category: "campus", cloudinaryPublicId: "mlrit/main-gate", width: 1920, height: 1280, capturedAt: "2026-04-05", tags: ["campus"] },
  { id: "main-block", title: "Main Academic Block", type: "image", category: "campus", cloudinaryPublicId: "mlrit/main-block", width: 1920, height: 1280, capturedAt: "2026-04-05", tags: ["campus"] },
  { id: "library", title: "Central Library", type: "image", category: "campus", cloudinaryPublicId: "mlrit/library", width: 1920, height: 1280, capturedAt: "2026-04-05", tags: ["campus"] },
  { id: "cafeteria", title: "Campus Cafeteria", type: "image", category: "campus", cloudinaryPublicId: "mlrit/cafeteria", width: 1920, height: 1280, capturedAt: "2026-04-05", tags: ["campus"] },
  { id: "auditorium", title: "MLRIT Auditorium", type: "image", category: "campus", cloudinaryPublicId: "mlrit/auditorium", width: 1920, height: 1280, capturedAt: "2026-04-05", tags: ["campus"] },
  { id: "computer-labs", title: "Computer Science Labs", type: "image", category: "campus", cloudinaryPublicId: "mlrit/computer-labs", width: 1920, height: 1280, capturedAt: "2026-04-05", tags: ["campus"] },
  { id: "sports-ground", title: "Sports Ground", type: "image", category: "campus", cloudinaryPublicId: "mlrit/sports-ground", width: 1920, height: 1280, capturedAt: "2026-04-05", tags: ["campus"] },
  { id: "hostel-block", title: "Hostel Block", type: "image", category: "campus", cloudinaryPublicId: "mlrit/hostel-block", width: 1920, height: 1280, capturedAt: "2026-04-05", tags: ["campus"] },
  { id: "cricket-match", title: "Inter-College Cricket 2024", type: "image", category: "sports", cloudinaryPublicId: "mlrit/cricket-match", width: 1920, height: 1080, capturedAt: "2026-04-05", tags: ["sports"] },
  { id: "basketball-tournament", title: "Basketball Tournament", type: "image", category: "sports", cloudinaryPublicId: "mlrit/basketball-tournament", width: 1920, height: 1080, capturedAt: "2026-04-05", tags: ["sports"] },
  { id: "football-match", title: "Football Championship", type: "image", category: "sports", cloudinaryPublicId: "mlrit/football-match", width: 1920, height: 1080, capturedAt: "2026-04-05", tags: ["sports"] },
  { id: "athletics-meet", title: "Annual Athletics Meet", type: "image", category: "sports", cloudinaryPublicId: "mlrit/athletics-meet", width: 1920, height: 1080, capturedAt: "2026-04-05", tags: ["sports"] },
  { id: "chess-competition", title: "Chess Competition", type: "image", category: "sports", cloudinaryPublicId: "mlrit/chess-competition", width: 1920, height: 1080, capturedAt: "2026-04-05", tags: ["sports"] },
  { id: "badminton-finals", title: "Badminton Finals", type: "image", category: "sports", cloudinaryPublicId: "mlrit/badminton-finals", width: 1920, height: 1080, capturedAt: "2026-04-05", tags: ["sports"] },
  { id: "kabaddi-match", title: "Kabaddi Tournament", type: "image", category: "sports", cloudinaryPublicId: "mlrit/kabaddi-match", width: 1920, height: 1080, capturedAt: "2026-04-05", tags: ["sports"] },
  { id: "classroom-session", title: "Classroom Session", type: "image", category: "academics", cloudinaryPublicId: "mlrit/classroom-session", width: 1920, height: 1080, capturedAt: "2026-04-05", tags: ["academics"] },
  { id: "workshop-iot", title: "IoT Workshop", type: "image", category: "academics", cloudinaryPublicId: "mlrit/workshop-iot", width: 1920, height: 1080, capturedAt: "2026-04-05", tags: ["academics"] },
  { id: "guest-lecture", title: "Guest Lecture Series", type: "image", category: "academics", cloudinaryPublicId: "mlrit/guest-lecture", width: 1920, height: 1080, capturedAt: "2026-04-05", tags: ["academics"] },
  { id: "exam-hall", title: "Examination Hall", type: "image", category: "academics", cloudinaryPublicId: "mlrit/exam-hall", width: 1920, height: 1080, capturedAt: "2026-04-05", tags: ["academics"] },
  { id: "project-demo", title: "Final Year Project Demo", type: "image", category: "academics", cloudinaryPublicId: "mlrit/project-demo", width: 1920, height: 1080, capturedAt: "2026-04-05", tags: ["academics"] },
  { id: "seminar-hall", title: "Seminar Hall", type: "image", category: "academics", cloudinaryPublicId: "mlrit/seminar-hall", width: 1920, height: 1080, capturedAt: "2026-04-05", tags: ["academics"] },
  { id: "research-lab", title: "Research Laboratory", type: "image", category: "academics", cloudinaryPublicId: "mlrit/research-lab", width: 1920, height: 1080, capturedAt: "2026-04-05", tags: ["academics"] },
  { id: "dance-performance", title: "Cultural Dance Performance", type: "image", category: "cultural", cloudinaryPublicId: "mlrit/dance-performance", width: 1920, height: 1080, capturedAt: "2026-04-05", tags: ["cultural"] },
  { id: "music-night", title: "Music Night 2024", type: "image", category: "cultural", cloudinaryPublicId: "mlrit/music-night", width: 1920, height: 1080, capturedAt: "2026-04-05", tags: ["cultural"] },
  { id: "drama-show", title: "Drama and Theatre Show", type: "image", category: "cultural", cloudinaryPublicId: "mlrit/drama-show", width: 1920, height: 1080, capturedAt: "2026-04-05", tags: ["cultural"] },
  { id: "art-exhibition", title: "Art Exhibition 2023", type: "image", category: "cultural", cloudinaryPublicId: "mlrit/art-exhibition", width: 1920, height: 1080, capturedAt: "2026-04-05", tags: ["cultural"] },
  { id: "fashion-show", title: "Fashion Show", type: "image", category: "cultural", cloudinaryPublicId: "mlrit/fashion-show", width: 1920, height: 1080, capturedAt: "2026-04-05", tags: ["cultural"] },
  { id: "rangoli-competition", title: "Rangoli Competition", type: "image", category: "cultural", cloudinaryPublicId: "mlrit/rangoli-competition", width: 1920, height: 1080, capturedAt: "2026-04-05", tags: ["cultural"] },
  { id: "photography-club", title: "Photography Club Exhibition", type: "image", category: "cultural", cloudinaryPublicId: "mlrit/photography-club", width: 1920, height: 1080, capturedAt: "2026-04-05", tags: ["cultural"] },
  { id: "techfest-2024", title: "TechFest 2024", type: "image", category: "technical", cloudinaryPublicId: "mlrit/techfest-2024", width: 1920, height: 1080, capturedAt: "2026-04-05", tags: ["technical"] },
  { id: "hackathon-2024", title: "24hr Hackathon 2024", type: "image", category: "technical", cloudinaryPublicId: "mlrit/hackathon-2024", width: 1920, height: 1080, capturedAt: "2026-04-05", tags: ["technical"] },
  { id: "robotics-expo", title: "Robotics Expo", type: "image", category: "technical", cloudinaryPublicId: "mlrit/robotics-expo", width: 1920, height: 1080, capturedAt: "2026-04-05", tags: ["technical"] },
  { id: "coding-contest", title: "Coding Contest", type: "image", category: "technical", cloudinaryPublicId: "mlrit/coding-contest", width: 1920, height: 1080, capturedAt: "2026-04-05", tags: ["technical"] },
  { id: "paper-presentation", title: "Paper Presentation 2024", type: "image", category: "technical", cloudinaryPublicId: "mlrit/paper-presentation", width: 1920, height: 1080, capturedAt: "2026-04-05", tags: ["technical"] },
  { id: "project-expo", title: "Project Expo 2024", type: "image", category: "technical", cloudinaryPublicId: "mlrit/project-expo", width: 1920, height: 1080, capturedAt: "2026-04-05", tags: ["technical"] },
  { id: "campus-tour", title: "Campus Tour", type: "video", category: "campus", cloudinaryPublicId: "mlrit/campus-tour", width: 480, height: 270, capturedAt: "2026-04-05", tags: ["campus", "video"] },
  { id: "techfest-highlights", title: "TechFest Highlights", type: "video", category: "technical", cloudinaryPublicId: "mlrit/techfest-highlights", width: 854, height: 480, capturedAt: "2026-04-05", tags: ["technical", "video"] },
  { id: "cultural-fest-video", title: "Cultural Fest 2024", type: "video", category: "cultural", cloudinaryPublicId: "mlrit/cultural-fest-video", width: 400, height: 300, capturedAt: "2026-04-05", tags: ["cultural", "video"] },
  { id: "sports-day-video", title: "Sports Day 2024", type: "video", category: "sports", cloudinaryPublicId: "mlrit/sports-day-video", width: 480, height: 270, capturedAt: "2026-04-05", tags: ["sports", "video"] },
  { id: "convocation-video", title: "Convocation Ceremony", type: "video", category: "events", cloudinaryPublicId: "mlrit/convocation-video", width: 854, height: 480, capturedAt: "2026-04-05", tags: ["events", "video"] },
];

export function getAssetsByCategory(category: MediaAsset["category"]): MediaAsset[] {
  return MEDIA_ASSETS.filter((a) => a.category === category);
}

export function getImages(): MediaAsset[] {
  return MEDIA_ASSETS.filter((a) => a.type === "image");
}

export function getVideos(): MediaAsset[] {
  return MEDIA_ASSETS.filter((a) => a.type === "video");
}
