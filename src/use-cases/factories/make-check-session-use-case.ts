import { PrismaSessionRepository } from '@/repositories/prisma/prisma-session-repository'
import { CheckSessionUseCase } from './check-session'

export function makeDeleteDutyUseCase() {
  const sessionRepository = new PrismaSessionRepository()
  const checkSessionUseCase = new CheckSessionUseCase(sessionRepository)

  return checkSessionUseCase
}
