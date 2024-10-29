import type { OcurrenceTypesRepository } from '@/repositories/ocurrence-types-repository'
import type { Ocurrence_types } from '@prisma/client'

interface RegisterUseCaseRequest {
  type: string
  subtypes: string[]
  contract: string
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
    contract,
  }: RegisterUseCaseRequest): Promise<RegisterUseCaseResponse> {
    const ocurrence_type = await this.ocurrenceTypeRepository.create({
      type,
      subtypes,
      contract,
    })

    return {
      ocurrence_type,
    }
  }
}
