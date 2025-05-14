import { DiaObra } from "@prisma/client"
import { WorkRepository } from "@/repositories/works-repository"
import { verify } from "jsonwebtoken"

interface ReadWorkDayUseCaseRequest {
  bearerAuth: string
  id: number
}

interface ReadWorkDayUseCaseResponse {
  workDay: DiaObra
}

export class ReadWorkDayUseCase {
  constructor(private readonly workRepository: WorkRepository) {}

  async execute({
    bearerAuth,
    id,
  }: ReadWorkDayUseCaseRequest): Promise<ReadWorkDayUseCaseResponse> {
    const token = bearerAuth.split(' ')[1]
    verify(token, process.env.JWT_SECRET as string)

    const workDay = await this.workRepository.readWorkDay(id)

    return { workDay }
  }
}
