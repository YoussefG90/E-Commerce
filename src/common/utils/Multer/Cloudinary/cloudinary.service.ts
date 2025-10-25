import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { UploadApiResponse, v2 as Cloudinary } from 'cloudinary';

@Injectable()
export class CloudinaryService {
  async uploadFile(
    file: Express.Multer.File,
    path: string = 'general',
  ): Promise<UploadApiResponse> {
    try {
      return await Cloudinary.uploader.upload(file.path, {
        folder: `${process.env.APP_NAME}/${path}`,
      });
    } catch (error) {
      throw new InternalServerErrorException('Failed to upload file');
    }
  }

  async uploadMultiple(
    files: Express.Multer.File[],
    path: string = 'general',
  ): Promise<{ secure_url: string; public_id: string }[]> {
    const uploads: { secure_url: string; public_id: string }[] = [];
    for (const file of files) {
      const { secure_url, public_id } = await this.uploadFile(file, path);
      uploads.push({ secure_url, public_id });
    }
    return uploads;
  }

  async deleteFile(public_id: string): Promise<{ result: string }> {
    try {
      return await Cloudinary.uploader.destroy(public_id);
    } catch (error) {
      throw new InternalServerErrorException('Failed to delete file');
    }
  }

  async deleteMany(
    public_ids: string[],
    resource_type: 'image' | 'video' | 'raw' = 'image',
  ) {
    try {
      return await Cloudinary.api.delete_resources(public_ids, {
        resource_type,
      });
    } catch (error) {
      throw new InternalServerErrorException('Failed to delete files');
    }
  }

  async deleteByPrefix(prefix: string) {
    try {
      return await Cloudinary.api.delete_resources_by_prefix(
        `${process.env.APP_NAME}/${prefix}`,
      );
    } catch (error) {
      throw new InternalServerErrorException('Failed to delete by prefix');
    }
  }
}