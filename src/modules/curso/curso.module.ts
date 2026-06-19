import { Module } from "@nestjs/common";
import { CursoController } from "./curso.controller";
import { CursoService } from "./curso.service";

@Module({
    imports: [],
    controllers: [CursoController],
    providers: [CursoService],
})
export class CursoModule {}
