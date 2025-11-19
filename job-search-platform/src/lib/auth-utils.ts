import { getServerSession } from 'next-auth/next'
import { authOptions } from './auth'
import { prisma } from './prisma'
import bcrypt from 'bcryptjs'

export async function getSession() {
  return await getServerSession(authOptions)
}

export async function getCurrentUser() {
  const session = await getSession()
  
  if (!session?.user?.email) {
    return null
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: {
      id: true,
      email: true,
      name: true,
      createdAt: true,
    }
  })

  return user
}

export async function createUser(email: string, password: string, name?: string) {
  const hashedPassword = await bcrypt.hash(password, 12)
  
  const user = await prisma.user.create({
    data: {
      email,
      name,
      password: hashedPassword,
    }
  })

  return user
}

export async function verifyPassword(email: string, password: string) {
  const user = await prisma.user.findUnique({
    where: { email }
  })

  if (!user || !user.password) {
    return false
  }

  return await bcrypt.compare(password, user.password)
}

export function isSingleUserMode() {
  return process.env.SINGLE_USER_MODE === 'true'
}

export async function getOrCreateSingleUser() {
  if (!isSingleUserMode()) {
    return null
  }

  let user = await prisma.user.findFirst()
  
  if (!user) {
    user = await prisma.user.create({
      data: {
        email: 'user@localhost',
        name: 'Default User',
        password: await bcrypt.hash('password', 12),
      }
    })
  }

  return user
}