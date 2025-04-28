export class CustomerCnpjAlreadyExistsError extends Error {
    constructor() {
      super('Cadastro com CNPJ já existe')
    }
  }