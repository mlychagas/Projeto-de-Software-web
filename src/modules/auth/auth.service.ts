import { Injectable, UnauthorizedException, Inject } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { DataSource, Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Pessoa } from '../pessoa/pessoa.entity';

@Injectable()
export class AuthService {
  private pessoaRepo: Repository<Pessoa>;

  constructor(
    @Inject('DATA_SOURCE') private dataSource: DataSource,
    private readonly jwtService: JwtService,
  ) {
    this.pessoaRepo = this.dataSource.getRepository(Pessoa);
  }

  async validateUser(email: string, pass: string): Promise<any> {
    const user = await this.pessoaRepo.findOne({ where: { email } });
    
    if (!user || !user.senha) {
      throw new UnauthorizedException('Credenciais inválidas');
    }

    const isMatch = await bcrypt.compare(pass, user.senha);
    if (!isMatch) {
      throw new UnauthorizedException('Credenciais inválidas');
    }

    const { senha, ...result } = user;
    return result;
  }

  async login(user: any) {
    const payload = { 
      email: user.email, 
      sub: user.id,
      nome: user.nome,
      isUsuario: user.isUsuario
    };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  async createAdmin() {
    let admin = await this.pessoaRepo.findOne({ where: { email: 'admin@gmail.com' } });
    const hashedSenha = await bcrypt.hash('admin@123', 10);
    
    if (!admin) {
      admin = this.pessoaRepo.create({
        nome: 'Administrador do Sistema',
        email: 'admin@gmail.com',
        senha: hashedSenha,
        isUsuario: true,
        cpf: '00000000000'
      });
    } else {
      admin.senha = hashedSenha;
      admin.isUsuario = true;
    }
    
    await this.pessoaRepo.save(admin);
    return { message: 'Admin criado/atualizado com sucesso', email: 'admin@gmail.com' };
  }
}
