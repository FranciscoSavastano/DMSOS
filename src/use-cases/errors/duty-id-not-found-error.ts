export class DutyIdNotFoundError extends Error {
  constructor() {
    super('Id do plantão não encontrado')
  }
}
