import { Controller, Get } from "@nestjs/common";
import { Public } from "./auth/public.decorator";

@Public()
@Controller()
export class AppController {
  @Get()
  getHello() {
    return "Hello World from Proline server";
  }

  @Get("health")
  getHealth() {
    return {
      ok: true,
      service: "proline-server",
      timestamp: new Date().toISOString(),
    };
  }
}
