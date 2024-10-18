import type { OcurrenceTypesRepository } from '@/repositories/ocurrence-types-repository'
import type { Ocurrence_types } from '@prisma/client'

interface RegisterUseCaseRequest {
  type: string
  subtypes: string[]
}

interface RegisterUseCaseResponse {
  ocurrence_type: Ocurrence_types
}

export class CreateOcurrenceTypeUseCase {
  constructor(
    private readonly ocurrenceTypeRepository: OcurrenceTypesRepository,
  ) {}

  async execute({
    type,
    subtypes,
  }: RegisterUseCaseRequest): Promise<RegisterUseCaseResponse> {
    const ocurrence_type = await this.ocurrenceTypeRepository.create({
      type,
      subtypes,
    })

    return {
      ocurrence_type,
    }
  }
}
