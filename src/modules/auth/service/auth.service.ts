import { HttpException, HttpStatus, Injectable, Logger } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { InjectRepository } from "@nestjs/typeorm";
import { AgentEntity } from "../../models/entity/agent.entity";
import { Repository } from "typeorm";

@Injectable()
export class AuthenticationService {
  constructor(
    private jwtService: JwtService,
    @InjectRepository(AgentEntity) private userRepo: Repository<AgentEntity>,
  ) {}
  private readonly logger = new Logger(AuthenticationService.name);

  async authenticateUser(payload: any): Promise<any> {
    const bcrypt = require("bcrypt");
    this.logger.log("Authenticating user :", payload.username);
    const user = await this.userRepo
      .createQueryBuilder("agent")
      .leftJoinAndSelect(
        "agent.agentLocation",
        "agentLocation",
        "agentLocation.status = :status",
        { status: "ACTIVE" },
      )
      .leftJoinAndSelect("agentLocation.location", "location")
      .leftJoinAndSelect("agentLocation.phase", "phase")
      .leftJoinAndSelect("agentLocation.day", "day")
      .where("agent.username = :username", { username: payload.username })
      .andWhere("agent.status = :status", { status: "ACTIVE" })
      .getOne();
    if (!user) {
      this.logger.error("User Not Found :", user);
      throw new HttpException("User Not Found", HttpStatus.UNAUTHORIZED);
    }

    const isPasswordCorrect = await bcrypt.compare(
      payload.password,
      user.password,
    );

    if (!isPasswordCorrect) {
      this.logger.error("Provided Password is Incorrect");
      throw new HttpException("Invalid Credentials", HttpStatus.UNAUTHORIZED);
    }
    const token = this.jwtService.sign({ sub: user.id, name: user.username });
    return { token, user };
  }
}
