export class CreatePlantDto {
  name: string;
  species?: string;
  location?: string;
  imageUrl?: string;
  notes?: string;
}

export class UpdatePlantDto {
  name?: string;
  species?: string;
  location?: string;
  imageUrl?: string;
  notes?: string;
}
