import { Injectable } from '@nestjs/common';
import { Storage } from '@google-cloud/storage';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class StorageService {
  private storage: Storage;
  private bucket: string;

  constructor(private configService: ConfigService) {
    this.storage = new Storage({
      projectId: this.configService.get('GOOGLE_CLOUD_PROJECT_ID'),
      credentials: {
        client_email: this.configService.get('GOOGLE_CLOUD_CLIENT_EMAIL'),
        private_key: this.configService.get('GOOGLE_CLOUD_PRIVATE_KEY').replace(/\\n/g, '\n'),
      },
    });
    this.bucket = this.configService.get('GOOGLE_CLOUD_BUCKET');
  }

  async uploadFile(file: Express.Multer.File): Promise<string> {
    const bucket = this.storage.bucket(this.bucket);
    const blob = bucket.file(`profiles/${Date.now()}-${file.originalname}`);
    
    const stream = blob.createWriteStream({
      metadata: {
        contentType: file.mimetype,
      },
      resumable: false,
    });

    return new Promise((resolve, reject) => {
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