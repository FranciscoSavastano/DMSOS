import { PrismaWorkRepository } from "@/repositories/prisma/prisma-work-repository";
import { CreateActivityUseCase } from "../activity";

export function makeCreateActivityUseCase() {
    const workRepository = new PrismaWorkRepository();
    const createActivityUseCase = new CreateActivityUseCase(workRepository);
    
    return createActivityUseCase;
    }
