import { Module } from "@nestjs/common";
import { MatriculaController } from "./matricula.controller";
import { DatabaseModule } from "../../config/database/database.module";

@Module({
    imports: [DatabaseModule],
    controllers: [MatriculaController],
})
export class MatriculaModule {}
