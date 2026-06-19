import { Module } from "@nestjs/common";
import { MinistraController } from "./ministra.controller";
import { MinistraService } from "./ministra.service";

@Module({
    imports: [],
    controllers: [MinistraController],
    providers: [MinistraService],
})
export class MinistraModule {}
