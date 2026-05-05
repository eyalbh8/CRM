import { config } from "dotenv";
import { NestFactory } from "@nestjs/core";
import { join } from "node:path";
import { AppModule } from "./app.module";

config({ path: join(__dirname, "..", ".env") });

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
