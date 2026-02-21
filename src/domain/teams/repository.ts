import { Inject } from "@nestjs/common";
import { Model, Types } from "mongoose";
import { Database } from "src/infrastructure/database/database";
import { DatabaseSymbols } from "src/infrastructure/dependency-injection/databases/symbol";
import { Team } from "./entity";
import { TeamException } from "./exception";
import { TeamStruct } from "./factory";
import { TeamDocument } from "src/infrastructure/database/mongodb/models";
import { TeamMapper } from "src/infrastructure/database/mongodb/mappers";

export type TeamCreateParams = Omit<
  TeamStruct,
  "id" | "createdAt" | "updatedAt" | "members"
> & { members: string[] };

export type TeamUpdateParams = Partial<
  Omit<TeamStruct, "createdAt" | "members">
> & { members?: string[] };

export interface TeamGetQuery {
  page?: number;
  limit?: number;
  name?: string;
}

export interface TeamGetResponse {
  data: Team[];
  page: number;
  limit: number;
  totalCount: number;
}

export interface TeamRepository {
  create(team: TeamCreateParams): Promise<Team>;
  find(params: TeamGetQuery): Promise<TeamGetResponse>;
  findById(id: string): Promise<Team>;
  update(team: TeamUpdateParams & { id: string }): Promise<Team>;
  delete(id: string): Promise<string>;
}

export class TeamRepositoryImpl implements TeamRepository {
  constructor(
    @Inject(DatabaseSymbols.MongoDb)
    private readonly database: Database,
  ) {}

  async create(team: TeamCreateParams): Promise<Team> {
    const teamData = await (
      await this.teamModel.create({
        ...team,
        members: team.members.map((id) => new Types.ObjectId(id)),
      })
    ).populate({
      path: "members",
      populate: { path: "role", populate: { path: "permissions" } },
    });

    return TeamMapper.toDomain(teamData);
  }

  async find(params: TeamGetQuery): Promise<TeamGetResponse> {
    const { page = 1, limit = 10, name } = params;

    const filter: Record<string, any> = {};

    if (name) {
      filter.name = { $regex: name, $options: "i" };
    }

    const totalCount = await this.teamModel.countDocuments(filter);

    const teamDataList = await this.teamModel
      .find(filter)
      .skip((page - 1) * limit)
      .limit(limit)
      .populate({
        path: "members",
        populate: { path: "role", populate: { path: "permissions" } },
      })
      .exec();

    return {
      data: teamDataList.map((t) => TeamMapper.toDomain(t)),
      page,
      limit,
      totalCount,
    };
  }

  async findById(id: string): Promise<Team> {
    const teamData = await this.teamModel
      .findById(id)
      .populate({
        path: "members",
        populate: { path: "role", populate: { path: "permissions" } },
      })
      .exec();

    if (!teamData) {
      throw TeamException.TeamNotFound(id);
    }

    return TeamMapper.toDomain(teamData);
  }

  async update(team: TeamUpdateParams & { id: string }): Promise<Team> {
    const teamData = await this.teamModel.findById(team.id);

    if (!teamData) {
      throw TeamException.TeamNotFound(team.id);
    }

    teamData.name = team.name ?? teamData.name;
    teamData.description = team.description ?? teamData.description;
    teamData.ownerId = new Types.ObjectId(team.ownerId) ?? teamData.ownerId;
    teamData.status = team.status ?? teamData.status;
    teamData.updatedAt = new Date();

    if (team.members) {
      teamData.members = team.members.map(
        (id) => new Types.ObjectId(id),
      );
    }

    await teamData.save();

    await teamData.populate({
      path: "members",
      populate: { path: "role", populate: { path: "permissions" } },
    });

    return TeamMapper.toDomain(teamData);
  }

  async delete(id: string): Promise<string> {
    await this.teamModel.findByIdAndDelete(id).exec();
    return id;
  }

  private get teamModel(): Model<TeamDocument> {
    return this.database.teamModel();
  }
}
