import { IsNotEmpty } from "class-validator";

export class CreateAppDto {
  @IsNotEmpty()
  name!: string;
}
