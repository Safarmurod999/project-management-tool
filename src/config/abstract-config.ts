import { Injectable } from "@nestjs/common";

@Injectable()
export class AbstractConfig {
	protected throwEnvError(variableName: keyof NodeJS.ProcessEnv): void {
		throw new Error(`Ошибка: Переменная окружения ${variableName} отсутствует или неверна.`);
	}
}
