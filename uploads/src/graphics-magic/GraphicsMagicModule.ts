import {Module} from "@nestjs/common";
import {GraphicsMagicService} from "./GraphicsMagicService";

@Module({
	providers: [GraphicsMagicService],
	exports: [GraphicsMagicService]
})
export class GraphicsMagicModule {

}
