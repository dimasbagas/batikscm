const { PrismaClient } = require('./backend/node_modules/@prisma/client');
const prisma = new PrismaClient();
const argon2 = require('./backend/node_modules/argon2');

async function ensureAdmin() {
  const email = 'admin@batikchain.id';
  let admin = await prisma.user.findUnique({ where: { email } });
  if (!admin) {
    const hashed = await argon2.hash('admin123');
    admin = await prisma.user.create({
      data: {
        email,
        name: 'Admin BatikChain',
        password: hashed,
        role: 'ADMIN',
      }
    });
    console.log('Admin account created!');
  } else {
    console.log('Admin account already exists.');
  }
}

ensureAdmin().catch(console.error).finally(() => prisma.$disconnect());
