export class UserEmailNotFoundError extends Error {
  constructor() {
    super('Email do usuario nao encontrado')
  }
}
