export class CustomerAlreadyExistsError extends Error {
  constructor() {
    super('Cliente já existe')
  }
}
