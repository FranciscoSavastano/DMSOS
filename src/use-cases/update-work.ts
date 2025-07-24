import { verify } from 'jsonwebtoken'
      import env from '@/config/env'
      import type { Obra } from '@prisma/client'
      import { InvalidJwtTokenError } from './errors/invalid-jwt-token-error'
      import { WorkIdNotFoundError } from './errors/work-id-not-found-error'
      import { WorkRepository } from '@/repositories/works-repository'

      interface UpdateUseCaseRequest {
        bearerAuth: string
        id: number
        cliente_id?: string
        gerente_id?: string
        nome?: string
        inicio?: Date
        termino?: Date
        numproposta?: string
        horas_previstas?: number
        hh_previstas?: number
        disciplinas?: string[]
        equipe?: string[]
        tipoDias?: string
      }

      interface UpdateUseCaseResponse {
        work: Obra
      }

      export class UpdateWorkUseCase {
        constructor(private readonly workRepository: WorkRepository) {}

        async execute({
          bearerAuth,
          id,
          cliente_id,
          gerente_id,
          nome,
          inicio,
          termino,
          numproposta,
          horas_previstas,
          hh_previstas,
          disciplinas,
          equipe,
          tipoDias,
        }: UpdateUseCaseRequest): Promise<UpdateUseCaseResponse> {
          const token = bearerAuth.split(' ')[1]

          try {
            verify(token, env.JWT_SECRET) as { sub: string }
          } catch (error) {
            throw new InvalidJwtTokenError()
          }

          const updateData: Partial<Obra> = {}

          if (cliente_id !== undefined) updateData.cliente_id = cliente_id
          if (gerente_id !== undefined) updateData.gerente_id = gerente_id
          if (nome !== undefined) updateData.nome = nome
          if (inicio !== undefined) updateData.inicio = inicio
          if (termino !== undefined) updateData.termino = termino
          if (numproposta !== undefined) updateData.numproposta = numproposta
          if (horas_previstas !== undefined) updateData.horas_previstas = horas_previstas
          if (hh_previstas !== undefined) updateData.hh_previstas = hh_previstas
          if (disciplinas !== undefined) updateData.disciplinas = disciplinas
          if (equipe !== undefined) updateData.equipe = equipe
          if (tipoDias !== undefined) updateData.tipoDias = tipoDias

          const work = await this.workRepository.update({
            id,
            data: updateData,
          })

          if (work === null) {
            throw new WorkIdNotFoundError()
          }

          return { work }
        }
      }