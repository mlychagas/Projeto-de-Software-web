import { Module } from "@nestjs/common";
import { SalaController } from "./sala.controller";
import { SalaService } from "./sala.service";

@Module({
    imports: [],
    controllers: [SalaController],
    providers: [SalaService],
})
export class SalaModule {}
