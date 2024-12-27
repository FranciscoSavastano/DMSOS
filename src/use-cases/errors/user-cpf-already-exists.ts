export class UserCpfAlreadyExistsError extends Error {
  constructor() {
    super('Usuario com CPF já existe')
  }
}
