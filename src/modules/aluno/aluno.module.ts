import { Module } from "@nestjs/common";
import { AlunoController } from "./aluno.controller";
import { AlunoService } from "./aluno.service";
import { DatabaseModule } from "../../config/database/database.module";

@Module({
    imports: [DatabaseModule],
    controllers: [AlunoController],
    providers: [AlunoService],
})
export class AlunoModule {}
