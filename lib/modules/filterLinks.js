import Joi from 'joi';
import _ from 'lodash';

import validators from './validators';

/**
* [filterLinks description]
* @param  {Object}
* @param  {Function}
*/
export default function filterLinks(args, done) {
  const schema = Joi.object().required().keys({
    links: validators.links
  });

  schema.validate(args, (err, val) => {
    if (err) {
      done(err);
      return;
    }

    const exts = ['jpg', 'jpeg', 'png'];

    done(null, {
      links: _.filter(val.links, link => {
        if (!_.isString(link)) return false;
        return _.some(exts, ext => link.indexOf('.' + ext) > 0);
      })
    });
  });
}
