import { Module } from "@nestjs/common";
import { DisponibilidadeProfessorController } from "./disponibilidade-professor.controller";
import { DisponibilidadeProfessorService } from "./disponibilidade-professor.service";

@Module({
    imports: [],
    controllers: [DisponibilidadeProfessorController],
    providers: [DisponibilidadeProfessorService],
})
export class DisponibilidadeProfessorModule {}
