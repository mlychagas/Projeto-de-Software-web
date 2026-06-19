import { Module } from "@nestjs/common";
import { AgendaController } from "./agenda.controller";
import { AgendaService } from "./agenda.service";

@Module({
    imports: [],
    controllers: [AgendaController],
    providers: [AgendaService],
})
export class AgendaModule {}
