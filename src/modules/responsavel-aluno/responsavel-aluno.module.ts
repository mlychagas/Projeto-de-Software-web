import { Module } from "@nestjs/common";
import { ResponsavelAlunoController } from "./responsavel-aluno.controller";
import { ResponsavelAlunoService } from "./responsavel-aluno.service";

@Module({
    imports: [],
    controllers: [ResponsavelAlunoController],
    providers: [ResponsavelAlunoService],
})
export class ResponsavelAlunoModule {}
