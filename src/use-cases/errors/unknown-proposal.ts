export class UnknownProposalNumberError extends Error {
    constructor() {
      super('Formato inválido para o número da proposta.\nUse o modelo: "PR ## - ##[A-Z]".');
    }
    getMessage(): string {
        return this.message;
    }
}