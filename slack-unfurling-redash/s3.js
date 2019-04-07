const AWS = require('aws-sdk');
const randomstring = require('randomstring');

module.exports.upload = async function (data, bucketName) {
  const bucket = new AWS.S3({params: {Bucket: bucketName}});
  const key = randomstring.generate(6) + '/' + randomstring.generate() + '.png';

  const params = {
    ACL: 'public-read',
    Bucket: bucketName,
    ContentType: 'image/png',
    Key: key,
    Body: data,
  };

  const response = await bucket.upload(params).promise();
  return response.Location;
}
