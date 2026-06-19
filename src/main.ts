import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'node:path';
import { AppModule } from './app.module';
import { BadRequestException, Logger, ValidationPipe } from '@nestjs/common';
import expressEjsLayouts from 'express-ejs-layouts';
import { registerHelpers } from './helpers';
import { buildValidationErrorPayload } from 'nest-validation-view';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      exceptionFactory: (errors) =>
        new BadRequestException(buildValidationErrorPayload(errors)),
    }),
  );

  app.useStaticAssets(join(__dirname, '..', 'public'));
  app.setBaseViewsDir(join(__dirname, '..', 'views'));
  app.setViewEngine('ejs');

  app.use(expressEjsLayouts);
  app.set('layout', 'layouts/main');

  registerHelpers(app.getHttpAdapter().getInstance());

  const port = process.env.PORT ?? 3000;

  await app.listen(port, () =>
    Logger.log(
      `Application running in http://localhost:${port}`,
      'NestExpressApplication',
    ),
  );
}
bootstrap();
