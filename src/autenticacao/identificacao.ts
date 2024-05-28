export interface Identificacao {
  sub: string;
  chave: string;
  usuario: {
    id: string;
    nome: string;
    email: string;
  },
  sessao: {
    id: string;
    inicio: Date;
  },
  fuso: string;
  token: string | null;
}