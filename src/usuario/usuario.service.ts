import { Injectable } from '@nestjs/common';

export type Usuario = any;

@Injectable()
export class UsuarioService {
  private readonly usuarios = [
    {
      id: '0771b59b-055b-424a-b3f9-fb9028add484',
      email: 'wiltomar@ewtech.io',
      senha: '1231',
    },
    {
      id: '7cc34dbf-73a3-48ec-9706-e77ba57ea772',
      email: 'yerich@ewtech.io',
      senha: '1231',
    }
  ]

  async procura(email: string): Promise<Usuario | undefined> {
    return this.usuarios.find(usuario => usuario.email.toLowerCase() === email.toLowerCase());
  }
}
