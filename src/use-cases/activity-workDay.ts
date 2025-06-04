import { WorkRepository } from "@/repositories/works-repository";
import { Atividade, AtividadeNoDiaObra } from "@prisma/client";

interface RegisterUseCaseRequest {
    activity_id: number;
    work_day_id: number;
    concluidos: any;
    horas_gastas: number;
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
    }: RegisterUseCaseRequest): Promise<RegisterUseCaseResponse> {
        const activityWorkDay = await this.workRepository.createActivityWithWork({
            activity_id,
            work_day_id,
            concluidos,
            horas_gastas,
        });

        return { activityWorkDay };
    }
}