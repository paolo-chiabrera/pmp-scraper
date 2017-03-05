import _ from 'lodash';
import fs from 'fs-extra';

export default function ensureFolderPath(args, done = _.noop) {
	const { folderPath } = args;

	fs.ensureDir(folderPath, err => {
		if (err) {
			done(err);
			return;
		}

		done(null, {
			folderPath
		});
	});
}
