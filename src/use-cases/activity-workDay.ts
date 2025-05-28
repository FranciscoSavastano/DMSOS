import { WorkRepository } from "@/repositories/works-repository";
import { Atividade, AtividadeNoDiaObra } from "@prisma/client";

interface RegisterUseCaseRequest {
    activity_id: number;
    work_day_id: number;
}

interface RegisterUseCaseResponse {
    activityWorkDay: AtividadeNoDiaObra;
}

export class CreateActivityWorkDayUseCase {
    constructor(private readonly workRepository: WorkRepository) {}

    async execute({
        activity_id,
        work_day_id,
    }: RegisterUseCaseRequest): Promise<RegisterUseCaseResponse> {
        const activityWorkDay = await this.workRepository.createActivityWithWork({
            activity_id,
            work_day_id,
        });

        return { activityWorkDay };
    }
}