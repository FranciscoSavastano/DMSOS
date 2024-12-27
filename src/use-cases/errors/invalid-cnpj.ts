export class InvalidCnpj extends Error {
  constructor() {
    super('CNPJ invalido')
  }
}
