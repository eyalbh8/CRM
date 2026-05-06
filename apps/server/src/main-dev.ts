import "./load-env";
import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: "*",
    methods: ["GET", "HEAD", "POST", "PUT", "PATCH", "DELETE"],
  });

  const port = process.env.PORT || 3001;
  await app.listen(port);

  console.log(`Proline server is running on http://localhost:${port}`);
}

void bootstrap();
