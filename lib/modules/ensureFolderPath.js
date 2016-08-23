import Joi from 'joi';
import fs from 'fs-extra';

/**
* [ensureFolderPath description]
* @param  {Object}
* @param  {Function}
*/
export default function ensureFolderPath(args, done) {
  const schema = Joi.object().required().keys({
    folderPath: Joi.string().required()
  });

  schema.validate(args, (err, val) => {
    if (err) {
      done(err);
      return;
    }

    fs.ensureDir(val.folderPath, err => {
      if (err) {
        done(err);
        return;
      }

      done(null, {
        folderPath: val.folderPath
      });
    });
  });
}
