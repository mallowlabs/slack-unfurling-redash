'use strict';

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import app from '../../app.js';

describe('Tests handler', function () {
    it('verifies url_verification response', async () => {
        const event = { body: JSON.stringify({
                type: 'url_verification',
                challenge: 'abc'
            })
        };
        const context = {};

        const result = await app.lambdaHandler(event, context);

        assert.ok(typeof result === 'object');
        assert.strictEqual(result.statusCode, 200);
        assert.ok(typeof result.body === 'string');

        const response = JSON.parse(result.body);

        assert.ok(typeof response === 'object');
        assert.strictEqual(response.challenge, 'abc');
    });
});
