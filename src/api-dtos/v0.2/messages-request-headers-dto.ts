import { Transform } from "class-transformer";
import {
  IsBoolean,
  IsDefined,
  IsOptional,
  IsString,
  MaxLength,
} from "class-validator";

export class MessagesRequestHeadersDto {
  @IsString()
  @IsDefined()
  "x-api-key"!: string;

  @IsString()
  @IsOptional()
  @MaxLength(200)
  "x-onlaunch-bundle-id"?: string;

  @IsString()
  @IsOptional()
  @MaxLength(200)
  "x-onlaunch-bundle-version"?: string;

  @IsString()
  @IsOptional()
  @MaxLength(200)
  "x-onlaunch-locale"?: string;

  @IsString()
  @IsOptional()
  @MaxLength(200)
  "x-onlaunch-locale-language-code"?: string;

  @IsString()
  @IsOptional()
  @MaxLength(200)
  "x-onlaunch-locale-region-code"?: string;

  @IsString()
  @IsOptional()
  @MaxLength(150)
  "x-onlaunch-package-name"?: string;

  @IsString()
  @IsOptional()
  @MaxLength(200)
  "x-onlaunch-platform-name"?: string;

  @IsString()
  @IsOptional()
  @MaxLength(200)
  "x-onlaunch-platform-version"?: string;

  @IsString()
  @IsOptional()
  @MaxLength(200)
  "x-onlaunch-release-version"?: string;

  @IsString()
  @IsOptional()
  @MaxLength(200)
  "x-onlaunch-version-code"?: string;

  @IsString()
  @IsOptional()
  @MaxLength(200)
  "x-onlaunch-version-name"?: string;

  @IsBoolean()
  @IsOptional()
  @Transform(({ value }) => {
    if (value === "true") return true;
    else if (value === "false") return false;
    return value;
  })
  "x-onlaunch-update-available"?: boolean;
}
