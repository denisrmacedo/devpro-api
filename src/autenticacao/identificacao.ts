export interface Identificacao {
  id: string;
  chave: string;
  nacao: string;
  horario: string;
  usuario: {
    id: string;
    nome: string;
    imagem: string;
  },
  empresa: {
    id: string;
    nome: string;
    imagem: string;
  },
  inicio: Date;
  conclusao: Date;
}

export interface AutorizacaoCompleta {
  id: string;
  chave: string;
  nacao: string;
  horario: string;
  usuario: {
    id: string;
    nome: string;
    imagem: string;
  },
  empresa: {
    id: string;
    nome: string;
    imagem: string;
  },
  servidor: {
    id: string;
    nome: string;
    gravacao: string;
    leitura: string;
  },
  inicio: Date;
  conclusao: Date;
  token: string | null;
}