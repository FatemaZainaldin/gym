import { Injectable } from '@nestjs/common';
import { join } from 'path';
import { existsSync, mkdirSync, writeFileSync } from 'fs';
import { v4 as uuid } from 'uuid';

@Injectable()
export class StorageService {

  private uploadDir = join(process.cwd(), 'uploads');

  constructor() {
    // Create uploads folder if it doesn't exist
    if (!existsSync(this.uploadDir)) {
      mkdirSync(this.uploadDir, { recursive: true });
    }
  }

  async upload(file: Express.Multer.File): Promise<string> {
    const ext = file.originalname.split('.').pop();
    const filename = `${uuid()}.${ext}`;
    const filepath = join(this.uploadDir, filename);

    writeFileSync(filepath, file.buffer);
    const baseUrl = process.env.APP_URL ?? 'http://localhost:3000';
    return `${baseUrl}/uploads/${filename}`;
  }
}