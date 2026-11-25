import { prisma } from "../lib/db.js";

interface InputDto {
  userId: string;
  weightInGrams: number;
  heightInCentimeters: number;
  age: number;
  bodyFatPercentage: number;
}

interface OutputDto {
  userId: string;
  userName: string;
  weightInGrams: number;
  heightInCentimeters: number;
  age: number;
  bodyFatPercentage: number;
}

export class UpsertUserTrainData {
  async execute(dto: InputDto): Promise<OutputDto> {
    const user = await prisma.user.update({
      where: {
        id: dto.userId,
      },
      data: {
        weightInGrams: dto.weightInGrams,
        heightInCentimeters: dto.heightInCentimeters,
        age: dto.age,
        bodyFatPercentage: dto.bodyFatPercentage,
      },
      select: {
        id: true,
        name: true,
      },
    });

    return {
      userId: user.id,
      userName: user.name,
      weightInGrams: dto.weightInGrams,
      heightInCentimeters: dto.heightInCentimeters,
      age: dto.age,
      bodyFatPercentage: dto.bodyFatPercentage,
    };
  }
}
