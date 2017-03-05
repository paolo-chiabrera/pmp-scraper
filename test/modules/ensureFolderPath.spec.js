import { expect } from 'chai';
import sinon from 'sinon';

import fs from 'fs-extra';

import ensureFolderPath from '../../lib/modules/ensureFolderPath';

import mocks from '../mocks';

describe('ensureFolderPath', function () {
	it('should be defined', function () {
		expect(ensureFolderPath).to.be.a('function');
	});

	it('should return an error: fs.ensureDir', sinon.test(function (done) {
		const fakeError = new Error('error');
		const ensureDir = sinon.stub(fs, 'ensureDir', (path, callback) => {
			callback(fakeError);
		});

		const cb = this.spy(err => {
			sinon.assert.calledOnce(ensureDir);
			expect(err).to.eql(fakeError);

			ensureDir.restore();
			done();
		});

		ensureFolderPath({
			folderPath: mocks.options.folderPath
		}, cb);
	}));

	it('should return ensure the path', sinon.test(function (done) {
		const ensureDir = sinon.stub(fs, 'ensureDir', (path, callback) => {
			callback(null);
		});

		const cb = this.spy((err, res) => {
			sinon.assert.calledOnce(ensureDir);
			expect(err).to.be.a('null');
			expect(res).to.be.an('object');
			expect(res.folderPath).to.eql(mocks.options.folderPath);

			ensureDir.restore();
			done();
		});

		ensureFolderPath({
			folderPath: mocks.options.folderPath
		}, cb);
	}));
});
