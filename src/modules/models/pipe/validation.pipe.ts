import { BadRequestException, PipeTransform } from '@nestjs/common';
import Joi from 'joi';

export class ValidationPipe<T> implements PipeTransform<T> {
  private schema: Joi.ObjectSchema<T>;
  constructor(schema) {
    this.schema = schema;
  }

  public transform(payload: T): any {
    const result = this.schema.validate(payload);
    if (result.error) {
      const errorMessages = result.error.details.map((d) => d.message).join();
      throw new BadRequestException(errorMessages);
    }
    return payload;
  }
}
