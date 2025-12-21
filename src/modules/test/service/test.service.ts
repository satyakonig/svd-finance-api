import { Injectable, Logger, OnModuleInit } from "@nestjs/common";

@Injectable()
export class TestService implements OnModuleInit {
  private intervalId: NodeJS.Timeout | null = null;
  private readonly logger = new Logger(TestService.name);

  // This runs automatically when the app starts
  async onModuleInit() {
    this.logger.log("App started → initializing TestService...");
    await this.test(); // call your repeating logic
  }

  async test() {
    this.logger.log("Test service started");

    // Run once immediately
    await this.runTask();

    // Start interval only once
    if (!this.intervalId) {
      this.intervalId = setInterval(() => this.runTask(), 5 * 60 * 1000);
      this.logger.log("Started repeating Test service every 5 minutes");
    }
  }

  private async runTask() {
    this.logger.log(
      `Running scheduled task at ${new Date().toLocaleTimeString()}`
    );
    // Your actual business logic goes here
  }
}
