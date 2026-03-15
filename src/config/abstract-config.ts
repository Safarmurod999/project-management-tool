import { Injectable } from "@nestjs/common";
import { GlobalException } from "src/common";

@Injectable()
export class AbstractConfig {
	protected throwEnvError(variableName: keyof NodeJS.ProcessEnv): void {
		throw GlobalException.InternalServerError(`Environment variable ${variableName} is missing or invalid.`);
	}
}
