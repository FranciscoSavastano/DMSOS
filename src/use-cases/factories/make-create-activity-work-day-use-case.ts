import { PrismaWorkRepository } from "@/repositories/prisma/prisma-work-repository";
import { CreateActivityUseCase } from "../activity";
import { CreateActivityWorkDayUseCase } from "../activity-workDay";

export function makeCreateActivityWorkDayUseCase() {
    const workRepository = new PrismaWorkRepository();
    const createActivityWorkDayUseCase = new CreateActivityWorkDayUseCase(workRepository);
    return createActivityWorkDayUseCase;
}
