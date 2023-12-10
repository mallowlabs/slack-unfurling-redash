const {screenshot} = require('./screenshot');
const { WebClient } = require('@slack/web-api');

/**
 *
 * Event doc: https://docs.aws.amazon.com/apigateway/latest/developerguide/set-up-lambda-proxy-integrations.html#api-gateway-simple-proxy-for-lambda-input-format
 * @param {Object} event - API Gateway Lambda Proxy Input Format
 * @param {string} event.resource - Resource path.
 * @param {string} event.path - Path parameter.
 * @param {string} event.httpMethod - Incoming request's method name.
 * @param {Object} event.headers - Incoming request headers.
 * @param {Object} event.queryStringParameters - query string parameters.
 * @param {Object} event.pathParameters - path parameters.
 * @param {Object} event.stageVariables - Applicable stage variables.
 * @param {Object} event.requestContext - Request context, including authorizer-returned key-value pairs, requestId, sourceIp, etc.
 * @param {Object} event.body - A JSON string of the request payload.
 * @param {boolean} event.body.isBase64Encoded - A boolean flag to indicate if the applicable request payload is Base64-encode
 *
 * Context doc: https://docs.aws.amazon.com/lambda/latest/dg/nodejs-prog-model-context.html
 * @param {Object} context
 * @param {string} context.logGroupName - Cloudwatch Log Group name
 * @param {string} context.logStreamName - Cloudwatch Log stream name.
 * @param {string} context.functionName - Lambda function name.
 * @param {string} context.memoryLimitInMB - Function memory.
 * @param {string} context.functionVersion - Function version identifier.
 * @param {function} context.getRemainingTimeInMillis - Time in milliseconds before function times out.
 * @param {string} context.awsRequestId - Lambda request ID.
 * @param {string} context.invokedFunctionArn - Function ARN.
 *
 * Return doc: https://docs.aws.amazon.com/apigateway/latest/developerguide/set-up-lambda-proxy-integrations.html
 * @returns {Object} object - API Gateway Lambda Proxy Output Format
 * @returns {boolean} object.isBase64Encoded - A boolean flag to indicate if the applicable payload is Base64-encode (binary support)
 * @returns {string} object.statusCode - HTTP Status Code to be returned to the client
 * @returns {Object} object.headers - HTTP Headers to be returned
 * @returns {Object} object.body - JSON Payload to be returned
 *
 */
exports.lambdaHandler = async (event, context) => {
    // For keeping the browser launch
    context.callbackWaitsForEmptyEventLoop = false;

    try {
        const params = JSON.parse(event.body);

        // slack unfurling
        if (params.type === 'url_verification') {
            return {
                'statusCode': 200,
                'body': JSON.stringify({
                    challenge: params.challenge
                })
            }
        } else if (params.type === 'event_callback') {
            const channel = params.event.channel;
            const ts = params.event.message_ts;
            const links = params.event.links;

            const unfurls = {};
            for(const link of links) {
                const emebedUrl = parseRedashUrl(link.url, process.env.REDASH_API_KEY);
                if (emebedUrl !== null) {
                    const screenshotUrl = await screenshot(emebedUrl, process.env.BUCKET_NAME);
                    unfurls[link.url] = {
                        text: 'Screenshot',
                        image_url: screenshotUrl
                    };
                }
            }

            // post to Slack
            if (Object.keys(unfurls).length > 0) {
                console.log(JSON.stringify({
                    ts: ts,
                    channle: channel,
                    unfurls: unfurls
                }));

                const slack = new WebClient(process.env.SLACK_OAUTH_TOKEN);
                await slack.chat.unfurl({
                    ts: ts,
                    channel: channel,
                    unfurls: unfurls
                });
            }

            return {
                'statusCode': 200,
                'body': JSON.stringify({
                    ok: true
                })
            }
        }
    } catch (err) {
        console.log(err);
        return {
            'statusCode': 500,
            'body': JSON.stringify({
                err
            })
        }
    }
};

function parseRedashUrl(rawUrl, apiKey) {
    const m = rawUrl.match(/(.+)\/queries\/(\d+)#(\d+)/);
    if (m === null) {
        return null;
    }
    return `${m[1]}/embed/query/${m[2]}/visualization/${m[3]}?api_key=${apiKey}`;
}
