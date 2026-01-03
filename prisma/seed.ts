import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import * as dotenv from "dotenv";

dotenv.config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

// Helper to create dates relative to now
const daysAgo = (days: number) => {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date;
};

const monthsAgo = (months: number) => {
  const date = new Date();
  date.setMonth(date.getMonth() - months);
  return date;
};

// Generate a simple cuid-like ID
const generateId = () => {
  return "cl" + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
};

async function main() {
  console.log("Seeding Fair Share database...\n");

  // Clear existing data
  console.log("Clearing existing data...");
  await prisma.settlement.deleteMany();
  await prisma.expenseShare.deleteMany();
  await prisma.expense.deleteMany();
  await prisma.groupMember.deleteMany();
  await prisma.group.deleteMany();
  await prisma.user.deleteMany();

  // ============================================
  // USERS - 10 realistic users at different stages
  // ============================================
  console.log("Creating users...");

  const users = await Promise.all([
    // Core active users (will be in multiple groups)
    prisma.user.create({
      data: {
        id: "user_alex_chen",
        email: "alex.chen@gmail.com",
        name: "Alex Chen",
        avatarUrl: null,
        createdAt: monthsAgo(6),
      },
    }),
    prisma.user.create({
      data: {
        id: "user_sarah_johnson",
        email: "sarah.j@outlook.com",
        name: "Sarah Johnson",
        avatarUrl: null,
        createdAt: monthsAgo(6),
      },
    }),
    prisma.user.create({
      data: {
        id: "user_mike_williams",
        email: "mike.w@yahoo.com",
        name: "Mike Williams",
        avatarUrl: null,
        createdAt: monthsAgo(5),
      },
    }),
    prisma.user.create({
      data: {
        id: "user_emma_davis",
        email: "emma.davis@gmail.com",
        name: "Emma Davis",
        avatarUrl: null,
        createdAt: monthsAgo(4),
      },
    }),
    // Roommates specific
    prisma.user.create({
      data: {
        id: "user_jordan_lee",
        email: "jordan.lee@gmail.com",
        name: "Jordan Lee",
        avatarUrl: null,
        createdAt: monthsAgo(8),
      },
    }),
    prisma.user.create({
      data: {
        id: "user_taylor_smith",
        email: "taylor.s@icloud.com",
        name: "Taylor Smith",
        avatarUrl: null,
        createdAt: monthsAgo(8),
      },
    }),
    // Dinner club additional members
    prisma.user.create({
      data: {
        id: "user_chris_brown",
        email: "chris.b@gmail.com",
        name: "Chris Brown",
        avatarUrl: null,
        createdAt: monthsAgo(3),
      },
    }),
    prisma.user.create({
      data: {
        id: "user_olivia_garcia",
        email: "olivia.g@hotmail.com",
        name: "Olivia Garcia",
        avatarUrl: null,
        createdAt: monthsAgo(2),
      },
    }),
    // New user (just joined, minimal activity)
    prisma.user.create({
      data: {
        id: "user_ryan_martinez",
        email: "ryan.m@gmail.com",
        name: "Ryan Martinez",
        avatarUrl: null,
        createdAt: daysAgo(3),
      },
    }),
    // Dormant user (was active, now inactive)
    prisma.user.create({
      data: {
        id: "user_amanda_wilson",
        email: "amanda.w@gmail.com",
        name: "Amanda Wilson",
        avatarUrl: null,
        createdAt: monthsAgo(10),
      },
    }),
  ]);

  const [alex, sarah, mike, emma, jordan, taylor, chris, olivia, ryan, amanda] = users;

  console.log(`Created ${users.length} users`);

  // ============================================
  // GROUP 1: Miami Trip (4 friends, 5 days)
  // ============================================
  console.log("\nCreating Miami Trip group...");

  const miamiTrip = await prisma.group.create({
    data: {
      id: generateId(),
      name: "Miami Trip 2024",
      description: "Spring break trip to Miami! March 15-20",
      inviteCode: "miami-spring-2024",
      createdAt: daysAgo(30),
    },
  });

  // Add members
  await prisma.groupMember.createMany({
    data: [
      { userId: alex.id, groupId: miamiTrip.id, role: "ADMIN", joinedAt: daysAgo(30) },
      { userId: sarah.id, groupId: miamiTrip.id, role: "MEMBER", joinedAt: daysAgo(29) },
      { userId: mike.id, groupId: miamiTrip.id, role: "MEMBER", joinedAt: daysAgo(29) },
      { userId: emma.id, groupId: miamiTrip.id, role: "MEMBER", joinedAt: daysAgo(28) },
    ],
  });

  // Miami Trip Expenses - realistic 5-day trip
  const miamiExpenses = [
    // Day 1 - Travel & Check-in
    { desc: "Uber to airport", amount: 45.00, paidBy: alex, category: "transport", date: daysAgo(20) },
    { desc: "Airport parking", amount: 120.00, paidBy: sarah, category: "transport", date: daysAgo(20) },
    { desc: "Airbnb (5 nights)", amount: 1250.00, paidBy: alex, category: "accommodation", date: daysAgo(20) },
    { desc: "Grocery run - snacks & drinks", amount: 87.50, paidBy: mike, category: "groceries", date: daysAgo(20) },

    // Day 2 - Beach day
    { desc: "Beach umbrella rental", amount: 40.00, paidBy: emma, category: "entertainment", date: daysAgo(19) },
    { desc: "Lunch at Nikki Beach", amount: 186.00, paidBy: sarah, category: "food", date: daysAgo(19) },
    { desc: "Uber back to Airbnb", amount: 28.00, paidBy: mike, category: "transport", date: daysAgo(19) },
    { desc: "Dinner at Joe's Stone Crab", amount: 320.00, paidBy: alex, category: "food", date: daysAgo(19) },

    // Day 3 - Exploration
    { desc: "Rental car (2 days)", amount: 180.00, paidBy: sarah, category: "transport", date: daysAgo(18) },
    { desc: "Gas", amount: 55.00, paidBy: mike, category: "transport", date: daysAgo(18) },
    { desc: "Vizcaya Museum tickets", amount: 92.00, paidBy: emma, category: "entertainment", date: daysAgo(18) },
    { desc: "Coffee & pastries", amount: 42.00, paidBy: alex, category: "food", date: daysAgo(18) },
    { desc: "Little Havana dinner", amount: 145.00, paidBy: sarah, category: "food", date: daysAgo(18) },

    // Day 4 - Nightlife
    { desc: "Brunch at The Surf Club", amount: 215.00, paidBy: mike, category: "food", date: daysAgo(17) },
    { desc: "Pool day supplies", amount: 65.00, paidBy: emma, category: "shopping", date: daysAgo(17) },
    { desc: "Club entry - LIV", amount: 200.00, paidBy: alex, category: "entertainment", date: daysAgo(17) },
    { desc: "Drinks at club", amount: 280.00, paidBy: sarah, category: "entertainment", date: daysAgo(17) },
    { desc: "Late night pizza", amount: 48.00, paidBy: mike, category: "food", date: daysAgo(17) },

    // Day 5 - Last day
    { desc: "Breakfast at hotel cafe", amount: 78.00, paidBy: emma, category: "food", date: daysAgo(16) },
    { desc: "Souvenir shopping", amount: 125.00, paidBy: alex, category: "shopping", date: daysAgo(16) },
    { desc: "Uber to airport", amount: 52.00, paidBy: sarah, category: "transport", date: daysAgo(16) },
  ];

  for (const exp of miamiExpenses) {
    const expense = await prisma.expense.create({
      data: {
        description: exp.desc,
        amount: exp.amount,
        paidById: exp.paidBy.id,
        groupId: miamiTrip.id,
        category: exp.category,
        splitType: "EQUAL",
        date: exp.date,
        createdAt: exp.date,
      },
    });

    // Equal split among all 4 members
    const perPerson = exp.amount / 4;
    await prisma.expenseShare.createMany({
      data: [
        { expenseId: expense.id, userId: alex.id, amount: perPerson },
        { expenseId: expense.id, userId: sarah.id, amount: perPerson },
        { expenseId: expense.id, userId: mike.id, amount: perPerson },
        { expenseId: expense.id, userId: emma.id, amount: perPerson },
      ],
    });
  }

  // Add one settlement for Miami trip (Mike paid Sarah some of what he owed)
  await prisma.settlement.create({
    data: {
      groupId: miamiTrip.id,
      fromUserId: mike.id,
      toUserId: alex.id,
      amount: 200.00,
      settledAt: daysAgo(10),
    },
  });

  console.log(`Created Miami Trip with ${miamiExpenses.length} expenses`);

  // ============================================
  // GROUP 2: Roommates (3 people, monthly expenses)
  // ============================================
  console.log("\nCreating Roommates group...");

  const roommates = await prisma.group.create({
    data: {
      id: generateId(),
      name: "Apartment 4B",
      description: "Monthly shared expenses for our apartment",
      inviteCode: "apt-4b-roomies",
      createdAt: monthsAgo(8),
    },
  });

  await prisma.groupMember.createMany({
    data: [
      { userId: jordan.id, groupId: roommates.id, role: "ADMIN", joinedAt: monthsAgo(8) },
      { userId: taylor.id, groupId: roommates.id, role: "MEMBER", joinedAt: monthsAgo(8) },
      { userId: amanda.id, groupId: roommates.id, role: "MEMBER", joinedAt: monthsAgo(8) },
    ],
  });

  // 3 months of roommate expenses
  const roommateMonths = [
    { monthOffset: 3, rent: 2400, electric: 145, internet: 89, groceries: [65, 82, 45, 91] },
    { monthOffset: 2, rent: 2400, electric: 168, internet: 89, groceries: [78, 55, 63, 88] },
    { monthOffset: 1, rent: 2400, electric: 132, internet: 89, groceries: [92, 47, 71, 85] },
  ];

  const roommateUsers = [jordan, taylor, amanda];
  let groceryPayer = 0;

  for (const month of roommateMonths) {
    const baseDate = monthsAgo(month.monthOffset);

    // Rent (Jordan always pays, gets reimbursed)
    const rentExp = await prisma.expense.create({
      data: {
        description: "Rent",
        amount: month.rent,
        paidById: jordan.id,
        groupId: roommates.id,
        category: "utilities",
        splitType: "EQUAL",
        date: baseDate,
        createdAt: baseDate,
      },
    });
    await prisma.expenseShare.createMany({
      data: roommateUsers.map(u => ({
        expenseId: rentExp.id,
        userId: u.id,
        amount: month.rent / 3,
      })),
    });

    // Electric (Taylor pays)
    const elecExp = await prisma.expense.create({
      data: {
        description: "Electric bill",
        amount: month.electric,
        paidById: taylor.id,
        groupId: roommates.id,
        category: "utilities",
        splitType: "EQUAL",
        date: new Date(baseDate.getTime() + 5 * 24 * 60 * 60 * 1000),
        createdAt: new Date(baseDate.getTime() + 5 * 24 * 60 * 60 * 1000),
      },
    });
    await prisma.expenseShare.createMany({
      data: roommateUsers.map(u => ({
        expenseId: elecExp.id,
        userId: u.id,
        amount: month.electric / 3,
      })),
    });

    // Internet (Amanda pays)
    const netExp = await prisma.expense.create({
      data: {
        description: "Internet",
        amount: month.internet,
        paidById: amanda.id,
        groupId: roommates.id,
        category: "utilities",
        splitType: "EQUAL",
        date: new Date(baseDate.getTime() + 3 * 24 * 60 * 60 * 1000),
        createdAt: new Date(baseDate.getTime() + 3 * 24 * 60 * 60 * 1000),
      },
    });
    await prisma.expenseShare.createMany({
      data: roommateUsers.map(u => ({
        expenseId: netExp.id,
        userId: u.id,
        amount: month.internet / 3,
      })),
    });

    // Groceries (rotate payer)
    for (let i = 0; i < month.groceries.length; i++) {
      const groceryDate = new Date(baseDate.getTime() + (7 + i * 7) * 24 * 60 * 60 * 1000);
      const payer = roommateUsers[groceryPayer % 3];
      groceryPayer++;

      const grocExp = await prisma.expense.create({
        data: {
          description: "Shared groceries",
          amount: month.groceries[i],
          paidById: payer.id,
          groupId: roommates.id,
          category: "groceries",
          splitType: "EQUAL",
          date: groceryDate,
          createdAt: groceryDate,
        },
      });
      await prisma.expenseShare.createMany({
        data: roommateUsers.map(u => ({
          expenseId: grocExp.id,
          userId: u.id,
          amount: month.groceries[i] / 3,
        })),
      });
    }
  }

  // Some settlements in roommates group
  await prisma.settlement.createMany({
    data: [
      { groupId: roommates.id, fromUserId: taylor.id, toUserId: jordan.id, amount: 800.00, settledAt: monthsAgo(2) },
      { groupId: roommates.id, fromUserId: amanda.id, toUserId: jordan.id, amount: 750.00, settledAt: monthsAgo(2) },
      { groupId: roommates.id, fromUserId: amanda.id, toUserId: jordan.id, amount: 800.00, settledAt: monthsAgo(1) },
    ],
  });

  console.log("Created Roommates group with 3 months of expenses");

  // ============================================
  // GROUP 3: Dinner Club (6 friends, custom splits)
  // ============================================
  console.log("\nCreating Dinner Club group...");

  const dinnerClub = await prisma.group.create({
    data: {
      id: generateId(),
      name: "Friday Dinner Club",
      description: "Monthly dinner outings with the crew",
      inviteCode: "dinner-club-2024",
      createdAt: monthsAgo(4),
    },
  });

  const dinnerMembers = [alex, sarah, mike, chris, olivia, ryan];

  await prisma.groupMember.createMany({
    data: [
      { userId: alex.id, groupId: dinnerClub.id, role: "ADMIN", joinedAt: monthsAgo(4) },
      { userId: sarah.id, groupId: dinnerClub.id, role: "MEMBER", joinedAt: monthsAgo(4) },
      { userId: mike.id, groupId: dinnerClub.id, role: "MEMBER", joinedAt: monthsAgo(4) },
      { userId: chris.id, groupId: dinnerClub.id, role: "MEMBER", joinedAt: monthsAgo(3) },
      { userId: olivia.id, groupId: dinnerClub.id, role: "MEMBER", joinedAt: monthsAgo(2) },
      { userId: ryan.id, groupId: dinnerClub.id, role: "MEMBER", joinedAt: daysAgo(3) },
    ],
  });

  // Dinner 1: Italian restaurant - custom splits based on what people ordered
  const dinner1 = await prisma.expense.create({
    data: {
      description: "Carbone - Italian dinner",
      amount: 485.00,
      paidById: alex.id,
      groupId: dinnerClub.id,
      category: "food",
      splitType: "CUSTOM",
      date: monthsAgo(3),
      createdAt: monthsAgo(3),
    },
  });
  // Custom splits: Alex had steak ($85), Sarah had pasta ($45), Mike had fish ($75), Chris had veal ($95)
  // Plus tax/tip distributed proportionally
  await prisma.expenseShare.createMany({
    data: [
      { expenseId: dinner1.id, userId: alex.id, amount: 115.00 },
      { expenseId: dinner1.id, userId: sarah.id, amount: 95.00 },
      { expenseId: dinner1.id, userId: mike.id, amount: 125.00 },
      { expenseId: dinner1.id, userId: chris.id, amount: 150.00 },
    ],
  });

  // Dinner 2: Sushi - some people didn't drink
  const dinner2 = await prisma.expense.create({
    data: {
      description: "Nobu - Sushi night",
      amount: 620.00,
      paidById: sarah.id,
      groupId: dinnerClub.id,
      category: "food",
      splitType: "CUSTOM",
      date: monthsAgo(2),
      createdAt: monthsAgo(2),
    },
  });
  // Mike and Olivia had sake, others didn't
  await prisma.expenseShare.createMany({
    data: [
      { expenseId: dinner2.id, userId: alex.id, amount: 95.00 },
      { expenseId: dinner2.id, userId: sarah.id, amount: 95.00 },
      { expenseId: dinner2.id, userId: mike.id, amount: 145.00 },
      { expenseId: dinner2.id, userId: chris.id, amount: 95.00 },
      { expenseId: dinner2.id, userId: olivia.id, amount: 190.00 },
    ],
  });

  // Dinner 3: Steakhouse - equal split (everyone had similar meals)
  const dinner3 = await prisma.expense.create({
    data: {
      description: "Peter Luger - Steakhouse",
      amount: 780.00,
      paidById: mike.id,
      groupId: dinnerClub.id,
      category: "food",
      splitType: "EQUAL",
      date: monthsAgo(1),
      createdAt: monthsAgo(1),
    },
  });
  await prisma.expenseShare.createMany({
    data: [
      { expenseId: dinner3.id, userId: alex.id, amount: 130.00 },
      { expenseId: dinner3.id, userId: sarah.id, amount: 130.00 },
      { expenseId: dinner3.id, userId: mike.id, amount: 130.00 },
      { expenseId: dinner3.id, userId: chris.id, amount: 130.00 },
      { expenseId: dinner3.id, userId: olivia.id, amount: 130.00 },
      { expenseId: dinner3.id, userId: ryan.id, amount: 130.00 },
    ],
  });

  // Dinner 4: Recent - Mexican, custom splits
  const dinner4 = await prisma.expense.create({
    data: {
      description: "Cosme - Mexican",
      amount: 425.00,
      paidById: chris.id,
      groupId: dinnerClub.id,
      category: "food",
      splitType: "CUSTOM",
      date: daysAgo(7),
      createdAt: daysAgo(7),
    },
  });
  // Ryan is vegetarian (smaller bill), Chris had tasting menu
  await prisma.expenseShare.createMany({
    data: [
      { expenseId: dinner4.id, userId: alex.id, amount: 75.00 },
      { expenseId: dinner4.id, userId: sarah.id, amount: 75.00 },
      { expenseId: dinner4.id, userId: mike.id, amount: 75.00 },
      { expenseId: dinner4.id, userId: chris.id, amount: 120.00 },
      { expenseId: dinner4.id, userId: olivia.id, amount: 45.00 },
      { expenseId: dinner4.id, userId: ryan.id, amount: 35.00 },
    ],
  });

  // Some settlements in dinner club
  await prisma.settlement.create({
    data: {
      groupId: dinnerClub.id,
      fromUserId: chris.id,
      toUserId: alex.id,
      amount: 115.00,
      settledAt: monthsAgo(2),
    },
  });

  console.log("Created Dinner Club with 4 dinners (2 custom splits, 2 equal)");

  // ============================================
  // SUMMARY
  // ============================================
  console.log("\n========================================");
  console.log("SEED COMPLETE!");
  console.log("========================================\n");

  const stats = {
    users: await prisma.user.count(),
    groups: await prisma.group.count(),
    members: await prisma.groupMember.count(),
    expenses: await prisma.expense.count(),
    shares: await prisma.expenseShare.count(),
    settlements: await prisma.settlement.count(),
  };

  console.log("Database stats:");
  console.log(`  Users: ${stats.users}`);
  console.log(`  Groups: ${stats.groups}`);
  console.log(`  Group memberships: ${stats.members}`);
  console.log(`  Expenses: ${stats.expenses}`);
  console.log(`  Expense shares: ${stats.shares}`);
  console.log(`  Settlements: ${stats.settlements}`);
  console.log("");
  console.log("Groups created:");
  console.log("  1. Miami Trip 2024 - 4 members, vacation expenses");
  console.log("  2. Apartment 4B - 3 roommates, monthly bills");
  console.log("  3. Friday Dinner Club - 6 members, restaurant splits");
  console.log("");
  console.log("Test login credentials:");
  console.log("  Email: alex.chen@gmail.com (most active, in all groups)");
  console.log("  Email: jordan.lee@gmail.com (roommate admin)");
  console.log("  Email: ryan.m@gmail.com (new user, just joined)");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
