import { PrismaClient, Role, ProductStatus } from '@prisma/client'
import * as argon2 from 'argon2'

const prisma = new PrismaClient()

async function main() {
  const hashed = await argon2.hash('admin123')

  const admin = await prisma.user.upsert({
    where: { email: 'admin@batikchain.id' },
    update: {},
    create: {
      email: 'admin@batikchain.id',
      name: 'Admin BatikChain',
      password: hashed,
      role: 'ADMIN',
    },
  })

  const umkm1 = await prisma.user.upsert({
    where: { email: 'umkm@batikchain.id' },
    update: {},
    create: {
      email: 'umkm@batikchain.id',
      name: 'Dimas Firmansyah',
      password: hashed,
      role: 'UMKM',
      umkmName: 'UKM Tenun Riau',
      phone: '08123456789',
      city: 'Pekanbaru',
      province: 'Riau',
    },
  })

  const product1 = await prisma.product.upsert({
    where: { tokenId: 'BC-2023-001' },
    update: {},
    create: {
      tokenId: 'BC-2023-001',
      productName: 'Batik Riau Melayu',
      producerName: 'UKM Tenun Riau',
      originLocation: 'Pekanbaru, Riau',
      productionDate: new Date('2023-08-15'),
      imageUrl: 'https://images.unsplash.com/photo-1616128417859-3a984dd35f3b?w=400',
      metadataHash: 'a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b',
      certificationDate: new Date('2023-08-20'),
      status: 'VERIFIED',
      producerId: umkm1.id,
    },
  })

  const product2 = await prisma.product.upsert({
    where: { tokenId: 'BC-2023-002' },
    update: {},
    create: {
      tokenId: 'BC-2023-002',
      productName: 'Batik Tabir',
      producerName: 'Sanggar Batik Dwi',
      originLocation: 'Siak, Riau',
      productionDate: new Date('2023-09-01'),
      imageUrl: 'https://images.unsplash.com/photo-1602413000310-8c5a9ce29afd?w=400',
      metadataHash: 'b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c',
      certificationDate: new Date('2023-09-05'),
      status: 'VERIFIED',
      producerId: umkm1.id,
    },
  })

  console.log('Seed data created successfully')
  console.log({ admin, umkm1, product1, product2 })
}

main()
  .catch(e => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
