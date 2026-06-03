import { PartialType } from "@nestjs/mapped-types";
import { CreateTrainerDTO } from "./create-trainer.dto";


export class UpdateTrainerDTO  extends PartialType(CreateTrainerDTO){}