import { Controller, Get } from "@nestjs/common";

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
