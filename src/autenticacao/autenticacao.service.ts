import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsuarioService } from 'src/usuario/usuario.service';

@Injectable()
export class AutenticacaoService {
  constructor(
    private readonly usuarioService: UsuarioService,
    private readonly jwtService: JwtService,
  ) { }

  async login(email: string, senha: string): Promise<{ token: string }> {
    const usuario = await this.usuarioService.procura(email);
    if (!usuario)
      throw new UnauthorizedException('usuário inválido');
    if (usuario.senha !== senha)
      throw new UnauthorizedException('usuário inválido');
    const payload = { sub: usuario.id, email: usuario.email };
    return { token: await this.jwtService.signAsync(payload) };
  }
}
