const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const randomstring = require('randomstring');

module.exports.upload = async function (data, bucketName) {
  const s3 = new S3Client({});
  const key = randomstring.generate(6) + '/' + randomstring.generate() + '.png';

  const params = {
    ACL: 'public-read',
    Bucket: bucketName,
    ContentType: 'image/png',
    Key: key,
    Body: data,
  };

  await s3.send(new PutObjectCommand(params));
  return `https://${bucketName}.s3.amazonaws.com/${key}`;
}
