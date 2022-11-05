'use strict';

const app = require('../../app.js');
const chai = require('chai');
const expect = chai.expect;

describe('Tests handler', function () {
    it('verifies url_verification response', async () => {
        const event = { body: JSON.stringify({
                type: 'url_verification',
                challenge: 'abc'
            })
        };
        const context = {};

        const result = await app.lambdaHandler(event, context);

        expect(result).to.be.an('object');
        expect(result.statusCode).to.equal(200);
        expect(result.body).to.be.an('string');

        const response = JSON.parse(result.body);

        expect(response).to.be.an('object');
        expect(response.challenge).to.be.equal('abc');
    });
});
