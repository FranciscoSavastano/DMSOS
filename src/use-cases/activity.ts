import type { WorkRepository } from "@/repositories/works-repository";
import type { Atividade} from "@prisma/client";
import { verify } from "jsonwebtoken";
import env from "@/config/env";
import { InvalidJwtTokenError } from "./errors/invalid-jwt-token-error";
import { WorkIdNotFoundError } from "./errors/work-id-not-found-error";
//Referenciar esses dados para interface
//           work_id: z.string(),
//            nome: z.string(),
//            inicio: z.string(),
//            termino: z.string().optional(),
//            horas_previstas: z.number(),
//            equipe: z.array(
//                z.object({
//                    cargo: z.string(),
//                    quantidade: z.number(),
//                    tempoGasto: z.number(),
//                })
//            ),
//        materiais: z.string().array(),
 
interface RegisterUseCaseRequest {
    work_id: number;
    nome: string;
    inicio?: Date | null;
    termino?: Date | null;
    horas_previstas: number;
    tipoDias: string;
    equipe: {
        cargo: string;
        quantidade: number;
        tempoGasto: number;
    }[];
    materiais: string[];
    checklist: string[];
    descricao?: string;
    bearerAuth: string;
}

interface RegisterUseCaseResponse {
    activity: Atividade;
}

export class CreateActivityUseCase {
    constructor(private readonly workRepository: WorkRepository) {}

    async execute({
        work_id,
        nome,
        inicio,
        termino,
        horas_previstas,
        tipoDias,
        equipe,
        materiais,
        checklist,
        descricao,
        bearerAuth,
    }: RegisterUseCaseRequest): Promise<RegisterUseCaseResponse> {
        const token = bearerAuth.split(" ")[1];
        try {
            verify(token, env.JWT_SECRET) as { sub: string };
        } catch (error) {
            throw new InvalidJwtTokenError();
        }

        const work = await this.workRepository.findById(work_id);
        if (!work) {
            throw new WorkIdNotFoundError();
        }
        if (materiais.length === 0 || materiais === undefined) {
            materiais = ["Sem materiais"];
        }
        if (checklist.length === 0 || checklist === undefined) {
            checklist = [];
        }
        const activity = await this.workRepository.createActivity({
            work_id,
            nome,
            inicio,
            termino,
            horas_previstas,
            tipoDias,
            equipe,
            materiais,
            checklist,
            descricao,

        });
        return { activity };
    }
}
