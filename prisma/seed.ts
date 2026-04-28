import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  const today = new Date().toISOString();

  const media = [
    // Events (10)
    { id: 'mlrit/convocation-2024', title: 'Convocation 2024', category: 'events', type: 'image' },
    { id: 'mlrit/freshers-day-2024', title: 'Freshers Day 2024', category: 'events', type: 'image' },
    { id: 'mlrit/annual-day-2023', title: 'Annual Day 2023', category: 'events', type: 'image' },
    { id: 'mlrit/farewell-2024', title: 'Farewell Ceremony 2024', category: 'events', type: 'image' },
    { id: 'mlrit/independence-day-2023', title: 'Independence Day 2023', category: 'events', type: 'image' },
    { id: 'mlrit/republic-day-2024', title: 'Republic Day 2024', category: 'events', type: 'image' },
    { id: 'mlrit/teachers-day-2023', title: 'Teachers Day Celebration', category: 'events', type: 'image' },
    { id: 'mlrit/new-year-2024', title: 'New Year Celebration 2024', category: 'events', type: 'image' },
    { id: 'mlrit/orientation-2023', title: 'Orientation Day 2023', category: 'events', type: 'image' },
    { id: 'mlrit/prize-distribution', title: 'Prize Distribution Ceremony', category: 'events', type: 'image' },
    
    // Campus (8)
    { id: 'mlrit/main-gate', title: 'MLRIT Main Gate', category: 'campus', type: 'image' },
    { id: 'mlrit/main-block', title: 'Main Academic Block', category: 'campus', type: 'image' },
    { id: 'mlrit/library', title: 'Central Library', category: 'campus', type: 'image' },
    { id: 'mlrit/cafeteria', title: 'Campus Cafeteria', category: 'campus', type: 'image' },
    { id: 'mlrit/auditorium', title: 'MLRIT Auditorium', category: 'campus', type: 'image' },
    { id: 'mlrit/computer-labs', title: 'Computer Science Labs', category: 'campus', type: 'image' },
    { id: 'mlrit/sports-ground', title: 'Sports Ground', category: 'campus', type: 'image' },
    { id: 'mlrit/hostel-block', title: 'Hostel Block', category: 'campus', type: 'image' },
    
    // Sports (7)
    { id: 'mlrit/cricket-match', title: 'Inter-College Cricket 2024', category: 'sports', type: 'image' },
    { id: 'mlrit/basketball-tournament', title: 'Basketball Tournament', category: 'sports', type: 'image' },
    { id: 'mlrit/football-match', title: 'Football Championship', category: 'sports', type: 'image' },
    { id: 'mlrit/athletics-meet', title: 'Annual Athletics Meet', category: 'sports', type: 'image' },
    { id: 'mlrit/chess-competition', title: 'Chess Competition', category: 'sports', type: 'image' },
    { id: 'mlrit/badminton-finals', title: 'Badminton Finals', category: 'sports', type: 'image' },
    { id: 'mlrit/kabaddi-match', title: 'Kabaddi Tournament', category: 'sports', type: 'image' },
    
    // Academics (7)
    { id: 'mlrit/classroom-session', title: 'Classroom Session', category: 'academics', type: 'image' },
    { id: 'mlrit/workshop-iot', title: 'IoT Workshop', category: 'academics', type: 'image' },
    { id: 'mlrit/guest-lecture', title: 'Guest Lecture Series', category: 'academics', type: 'image' },
    { id: 'mlrit/exam-hall', title: 'Examination Hall', category: 'academics', type: 'image' },
    { id: 'mlrit/project-demo', title: 'Final Year Project Demo', category: 'academics', type: 'image' },
    { id: 'mlrit/seminar-hall', title: 'Seminar Hall', category: 'academics', type: 'image' },
    { id: 'mlrit/research-lab', title: 'Research Laboratory', category: 'academics', type: 'image' },
    
    // Cultural (7)
    { id: 'mlrit/dance-performance', title: 'Cultural Dance Performance', category: 'cultural', type: 'image' },
    { id: 'mlrit/music-night', title: 'Music Night 2024', category: 'cultural', type: 'image' },
    { id: 'mlrit/drama-show', title: 'Drama and Theatre Show', category: 'cultural', type: 'image' },
    { id: 'mlrit/art-exhibition', title: 'Art Exhibition 2023', category: 'cultural', type: 'image' },
    { id: 'mlrit/fashion-show', title: 'Fashion Show', category: 'cultural', type: 'image' },
    { id: 'mlrit/rangoli-competition', title: 'Rangoli Competition', category: 'cultural', type: 'image' },
    { id: 'mlrit/photography-club', title: 'Photography Club Exhibition', category: 'cultural', type: 'image' },
    
    // Technical (6)
    { id: 'mlrit/techfest-2024', title: 'TechFest 2024', category: 'technical', type: 'image' },
    { id: 'mlrit/hackathon-2024', title: '24hr Hackathon 2024', category: 'technical', type: 'image' },
    { id: 'mlrit/robotics-expo', title: 'Robotics Expo', category: 'technical', type: 'image' },
    { id: 'mlrit/coding-contest', title: 'Coding Contest', category: 'technical', type: 'image' },
    { id: 'mlrit/paper-presentation', title: 'Paper Presentation 2024', category: 'technical', type: 'image' },
    { id: 'mlrit/project-expo', title: 'Project Expo 2024', category: 'technical', type: 'image' },
    
    // Videos (5)
    { id: 'mlrit/campus-tour', title: 'Campus Tour', category: 'campus', type: 'video' },
    { id: 'mlrit/techfest-highlights', title: 'TechFest Highlights', category: 'technical', type: 'video' },
    { id: 'mlrit/cultural-fest-video', title: 'Cultural Fest 2024', category: 'cultural', type: 'video' },
    { id: 'mlrit/sports-day-video', title: 'Sports Day 2024', category: 'sports', type: 'video' },
    { id: 'mlrit/convocation-video', title: 'Convocation Ceremony', category: 'events', type: 'video' },
  ];

  for (const item of media) {
    await prisma.media.upsert({
      where: { cloudinaryPublicId: item.id },
      update: {},
      create: {
        title: item.title,
        type: item.type,
        category: item.category,
        cloudinaryPublicId: item.id,
        thumbnailUrl: `https://res.cloudinary.com/diigktj8x/image/upload/w_600,f_auto,q_auto/${item.id}`,
      },
    });
  }

  console.log(`✅ Seeded ${media.length} media items`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
