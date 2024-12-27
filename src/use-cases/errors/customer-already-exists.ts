export class CustomerAlreadyExistsError extends Error {
  constructor() {
    super('Cliente com este email já existe')
  }
}
