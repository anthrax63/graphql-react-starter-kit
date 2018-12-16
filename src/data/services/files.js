import CrudService from './crud';
import mkdirp from 'mkdirp-promise';
import Path from 'path';
import fs from 'fs';
import sanitize from 'sanitize-filename';
import {storage} from '../../config';
import {NotFoundError} from '../../constants/errors';


export const escapeFileName = (fileName) => {
  return sanitize(fileName);
};

export default class MeasurementService extends CrudService {
  constructor() {
    super('File');
  }

  /**
   * Returns write stream
   * @param {string} id Id of the file
   * @param {string} name Name of the file
   * @return {Promise.<stream>}
   */
  createWriteStream({id, name}) {
    const path = Path.join(storage.path, id);
    return mkdirp(path)
      .then(() => {
        const fileName = escapeFileName(name);
        const filePath = Path.join(path, fileName);
        return fs.createWriteStream(filePath);
      });
  }

  /**
   * Returns read stream
   * @param {string} id Id of the file
   * @return {Promise.<stream>}
   */
  async createReadStream({id}) {
    const filePath = await this._getFilePathById(id);
    return fs.createReadStream(filePath);
  }

  /**
   * Saves file from path
   * @param {string} filePath
   * @return {Promise.<Object>}
   */
  async saveFromPath(filePath) {
    const name = Path.basename(filePath);
    const size = fs.statSync(filePath).size;
    const file = await this.create({name, size});
    const readStream = fs.createReadStream(filePath);
    const writeStream = await this.createWriteStream(file);
    return await new Promise((resolve, reject) => {
      writeStream.once('close', async() => {
        this.merge({id: file.id, ready: true, readySize: size})
          .then(resolve)
          .catch(reject);
      });
      readStream.once('error', reject);
      writeStream.once('error', reject);
      readStream.pipe(writeStream);
    });
  }

  /**
   * Deletes the file
   * @param id
   * @return {Promise.<void>}
   */
  async deleteFile(id) {
    const filePath = await this._getFilePathById(id);
    return fs.unlink(filePath);
  }

  async _getFilePathById(id) {
    let file = await this.get({id});
    if (!file) {
      throw new NotFoundError();
    }
    file = file.toObject();
    const path = Path.join(storage.path, `${id}`);
    const fileName = escapeFileName(file.name);
    return Path.join(path, fileName);
  }
}
