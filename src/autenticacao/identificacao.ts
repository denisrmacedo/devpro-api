export interface Identificacao {
  sub: string;
  chave: string;
  usuario: {
    id: string;
    nome: string;
  }
}