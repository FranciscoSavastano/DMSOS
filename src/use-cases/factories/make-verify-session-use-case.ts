import { VerifySessionUseCase } from '../verifySession'

export function makeVerifySessionUseCase() {
  const verifySessionUseCase = new VerifySessionUseCase()

  return verifySessionUseCase
}
