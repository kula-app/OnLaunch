import { IsNotEmpty } from "class-validator";

export class CreateAppDto {
  @IsString()
  @MaxLength(150)
  name!: string;
}
