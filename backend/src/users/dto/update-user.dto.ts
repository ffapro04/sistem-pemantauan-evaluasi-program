/* eslint-disable prettier/prettier */
import { PartialType } from '@nestjs/mapped-types';
import { CreateVendorDto } from './create-user.dto';

export class UpdateVendorDto extends PartialType(CreateVendorDto) {}
