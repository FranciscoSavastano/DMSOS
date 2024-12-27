export class CustIdNotFoundError extends Error {
  constructor() {
    super('Id do cliente nao encontrado')
  }
}
