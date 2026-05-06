/**
 * Script : promouvoir un utilisateur au rôle ADMIN
 *
 * Usage :
 *   yarn tsx scripts/make-admin.ts email@example.com
 *   npx tsx scripts/make-admin.ts email@example.com
 *
 * Depuis la racine du projet :
 *   make admin email=email@example.com
 */
import { PrismaClient } from '@prisma/client'

async function main() {
  const email = process.argv[2]

  if (!email) {
    console.error('❌  Usage : yarn tsx scripts/make-admin.ts <email>')
    process.exit(1)
  }

  const prisma = new PrismaClient()

  try {
    const user = await prisma.user.findUnique({ where: { email } })

    if (!user) {
      console.error(`❌  Aucun utilisateur trouvé avec l'email : ${email}`)
      process.exit(1)
    }

    if (user.role === 'ADMIN') {
      console.log(`⚠️   ${email} est déjà ADMIN.`)
      process.exit(0)
    }

    await prisma.user.update({
      where: { email },
      data: { role: 'ADMIN' },
    })

    console.log(`✅  ${email} est maintenant ADMIN.`)
    console.log(`   ⚠️  Le changement prend effet au prochain refresh token (max 15 min).`)
  } finally {
    await prisma.$disconnect()
  }
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
