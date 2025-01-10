import { Injectable } from '@nestjs/common';
import { Storage } from '@google-cloud/storage';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class StorageService {
  private storage1: Storage;
  private storage: Storage;
  private bucket: string;

  constructor(private configService: ConfigService) {
    this.storage = new Storage({
      projectId: this.configService.get('GOOGLE_CLOUD_PROJECT_ID'),
      credentials: {
        client_email: this.configService.get('GOOGLE_CLOUD_CLIENT_EMAIL'),
        private_key: this.configService.get('GOOGLE_CLOUD_PRIVATE_KEY')?.replace(/\\n/g, '\n'),
      },
    });
    this.storage1 = new Storage({
        keyFilename: './healthcare-apps-446704-4844b2491c96.json',
        projectId: "healthcare-apps-446704"
    });
    this.bucket = this.configService.get('GOOGLE_CLOUD_BUCKET');
  }

  async uploadFile(file: Express.Multer.File): Promise<string> {
    const bucket = this.storage.bucket(this.bucket);
    const blob = bucket.file(`user-profiles/${Date.now()}-${file.originalname}`);
    
    const stream = blob.createWriteStream({
      metadata: {
        contentType: file.mimetype,
      },
      resumable: false,
    });

    return await new Promise((resolve, reject) => {
      stream.on('error', (err) => {
        reject(err);
      });

      stream.on('finish', async () => {
        await blob.makePublic();
        resolve(blob.publicUrl());
      });

      stream.end(file.buffer);
    });
  }
}