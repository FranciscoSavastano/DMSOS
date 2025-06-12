import { WorkRepository } from "@/repositories/works-repository";
import { Atividade, AtividadeNoDiaObra } from "@prisma/client";

interface RegisterUseCaseRequest {
    activity_id: number;
    work_day_id: number;
    concluidos: any;
    horas_gastas: number;
    interferencias?: string;
    imagens?: any;
    checklist_porcentagem?: string;
}

interface RegisterUseCaseResponse {
    activityWorkDay: AtividadeNoDiaObra;
}

export class CreateActivityWorkDayUseCase {
    constructor(private readonly workRepository: WorkRepository) {}
    
    async execute({
        activity_id,
        work_day_id,
        concluidos,
        horas_gastas,
        interferencias,
        imagens,
        checklist_porcentagem,
    }: RegisterUseCaseRequest): Promise<RegisterUseCaseResponse> {
        const activityWorkDay = await this.workRepository.createActivityWithWork({
            activity_id,
            work_day_id,
            interferencias,
            concluidos,
            imagens,
            horas_gastas,
            checklist_porcentagem,
        });

        return { activityWorkDay };
    }
}