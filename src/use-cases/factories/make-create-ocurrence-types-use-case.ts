import { CreateOcurrenceTypeUseCase } from './create-ocurrency-types'
import { PrismaOcurrenceTypeRepository } from '@/repositories/prisma/prisma-ocurrence-type-repository'

export function makeCreateOcurrenceTypeUseCase() {
  const ocurrenceTypeRepository = new PrismaOcurrenceTypeRepository()
  const createOcurrenceTypeUseCase = new CreateOcurrenceTypeUseCase(ocurrenceTypeRepository)

  return createOcurrenceTypeUseCase
}
