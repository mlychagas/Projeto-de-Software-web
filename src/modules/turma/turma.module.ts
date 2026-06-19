import { Module } from "@nestjs/common";
import { TurmaController } from "./turma.controller";
import { TurmaService } from "./turma.service";

@Module({
    imports: [],
    controllers: [TurmaController],
    providers: [TurmaService],
})
export class TurmaModule {}
