import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Hash password for test user
  const passwordHash = await bcrypt.hash('password123', 10);

  // Create a test user with password
  const user = await prisma.user.create({
    data: {
      email: 'test@example.com',
      name: 'Test User',
      passwordHash,
      authProvider: 'custom',
    },
  });
  console.log('✓ Created user:', user);
  console.log('  Email: test@example.com');
  console.log('  Password: password123');

  // Create a behavioral interview
  const behavioralInterview = await prisma.interview.create({
    data: {
      userId: user.id,
      type: 'behavioral',
      role: 'Frontend Developer',
      level: 'Level 3',
      status: 'pending',
      questions: {
        create: [
          {
            text: 'Tell me about a time you had to deal with a difficult team member.',
            category: 'Teamwork',
            difficulty: 'Medium',
            orderIndex: 0,
          },
          {
            text: 'Describe a situation where you had to learn a new technology quickly.',
            category: 'Learning',
            difficulty: 'Medium',
            orderIndex: 1,
          },
          {
            text: 'How do you handle tight deadlines and pressure?',
            category: 'Stress Management',
            difficulty: 'Easy',
            orderIndex: 2,
          },
        ],
      },
    },
    include: { questions: true },
  });
  console.log('✓ Created behavioral interview with ID:', behavioralInterview.id);

  // Create a coding interview
  const codingInterview = await prisma.interview.create({
    data: {
      userId: user.id,
      type: 'coding',
      role: 'Backend Developer',
      level: 'Level 2',
      status: 'pending',
      questions: {
        create: [
          {
            text: 'Write a function to reverse a string in your preferred language.',
            category: 'Strings',
            difficulty: 'Easy',
            orderIndex: 0,
          },
          {
            text: 'Implement a binary search algorithm.',
            category: 'Algorithms',
            difficulty: 'Medium',
            orderIndex: 1,
          },
        ],
      },
    },
    include: { questions: true },
  });
  console.log('✓ Created coding interview with ID:', codingInterview.id);

  console.log('\n✅ Seed completed!');
  console.log(`\nTest user email: test@example.com`);
  console.log(`Behavioral interview ID: ${behavioralInterview.id}`);
  console.log(`Coding interview ID: ${codingInterview.id}`);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
