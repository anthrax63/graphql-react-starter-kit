import Busboy from 'busboy';
import check from 'check-types';
import FilesService, {escapeFileName} from '../services/files';
import {storage} from '../../config';


export default function fileUploadMiddleware(req, res) {
  check.assert.assigned(req.params.id, 'Invalid id');
  const id = req.params.id;
  const headers = {...req.headers};
  const busboy = new Busboy({headers});
  const service = new FilesService({storagePath: storage.path});
  busboy.on('file', async(fieldname, file, filename, encoding, mimetype) => {
    const name = escapeFileName(filename);
    await service.update({id, name, ready: false, readySize: 0});
    let fileStream = await service.createWriteStream({id, name});
    fileStream.once('close', async() => {
      await service.update({id, ready: true});
    });
    let fileSize = 0;
    file.on('data', async(data) => {
      fileSize += data.length;
      await service.update({id, readySize: fileSize});
    });
    file.pipe(fileStream);
  });
  busboy.on('field', async(fieldname, val) => {
    if (fieldname === 'size') {
      let size = parseInt(val);
      if (size) {
        await service.update({id, size});
      }
    }
  });
  busboy.on('finish', function() {
    res.status(201).send();
  });
  req.pipe(busboy);
}
