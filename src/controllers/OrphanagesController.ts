import { Request, Response } from 'express';
import { getRepository } from 'typeorm';

import Orphanage from '../models/Orphanage';
import OrphanagesView from '../views/orphanages_view';

export default class OrphanagesController {
  async index(request: Request, response: Response): Promise<Response> {
    const orphanagesRepository = getRepository(Orphanage);
    const orphanages = await orphanagesRepository.find({
      relations: ['images'],
    });

    return response.json(
      orphanages.map(orphanage => OrphanagesView.render(orphanage)),
    );
  }

  async show(request: Request, response: Response): Promise<Response> {
    const { id } = request.params;

    const orphanagesRepository = getRepository(Orphanage);
    const orphanage = await orphanagesRepository.findOne(id, {
      relations: ['images'],
    });

    if (!orphanage) {
      return response.status(404).json({
        message: 'Orphanage not found',
      });
    }

    return response.json(OrphanagesView.render(orphanage));
  }

  async store(request: Request, response: Response): Promise<Response> {
    const {
      name,
      latitude,
      longitude,
      about,
      instructions,
      opening_hours,
      open_on_weekends,
    } = request.body;
    const images = request.files as Express.Multer.File[];

    const orphanagesRepository = getRepository(Orphanage);
    const orphanage = orphanagesRepository.create({
      name,
      latitude,
      longitude,
      about,
      instructions,
      opening_hours,
      open_on_weekends,
      images: images.map(image => ({
        path: image.filename,
      })),
    });

    await orphanagesRepository.save(orphanage);

    return response.status(201).json(orphanage);
  }
}
