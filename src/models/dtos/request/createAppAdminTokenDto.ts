import { IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class CreateAppAdminTokenDto {
  @IsNumber()
  @Min(0)
  timeToLive!: number;

  @IsOptional()
  @IsString()
  label?: string;
}
