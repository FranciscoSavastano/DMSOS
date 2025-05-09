import { DiaObra } from "@prisma/client"
import { InvalidJwtTokenError } from "./errors/invalid-jwt-token-error"

interface RegisterUseCaseRequest {
    obra_id: string
    data: string
    inicio: string
    termino?: string
    horas_gastas?: number
    supervisor_id: string
    observacao?: string
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

interface WorkDayRepository {
    constructor(private readonly workRepository: WorkRepository) {}
      
    async execute({
        obra_id,
        data,
        inicio,
        termino,
        horas_gastas,
        supervisor_id,
        observacao,
        equipe,
        bearerAuth,
    }: RegisterUseCaseRequest): Promise<RegisterUseCaseResponse> {
        const token = bearerAuth.split(' ')[1]
        try {
          verify(token, env.JWT_SECRET) as { sub: string }
        } catch (error) {
          throw new InvalidJwtTokenError()
        }
       
        const work = await this.workRepository.createWorkDay({
          cliente_id,
          gerente_id,
          nome,
          inicio,
          termino,
          numproposta,
          horas_previstas,
          hh_previstas,
          equipe,
          tipoDias,
          disciplinas,
        });
        
        
        return { work }
      }
      
}