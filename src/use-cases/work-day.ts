import { DiaObra } from "@prisma/client"
import { InvalidJwtTokenError } from "./errors/invalid-jwt-token-error"
import { verify } from "jsonwebtoken"
import env from "@/config/env"
import { WorkRepository } from "@/repositories/works-repository"

interface RegisterUseCaseRequest {
    obra_id: string
    data: string
    inicio: string
    termino?: string
    horas_gastas?: number
    supervisor_id: string
    observacao?: string
  tipo_dia?: string
    equipe: {
        cargo: string
        quantidade: number
        tempoDiario: number
    }[]
    bearerAuth: string
}

interface RegisterUseCaseResponse {
    workDay: DiaObra
}

export class CreateWorkDayUseCase {
    constructor(private readonly workRepository: WorkRepository) {}
      
    async execute({
        obra_id,
        data,
        inicio,
        termino,
        horas_gastas,
        supervisor_id,
        observacao,
      tipo_dia,
        equipe,
        bearerAuth,
    }: RegisterUseCaseRequest): Promise<RegisterUseCaseResponse> {
        const token = bearerAuth.split(' ')[1]
        try {
          verify(token, env.JWT_SECRET) as { sub: string }
        } catch (error) {
          throw new InvalidJwtTokenError()
        }
       
        const workDay = await this.workRepository.createWorkDay({
            obra_id,
            data,
            inicio,
            termino,
            horas_gastas,
            supervisor_id,
          tipo_dia,
            observacao,
            equipe
        });
        
        
        return { workDay }
      }
      
}