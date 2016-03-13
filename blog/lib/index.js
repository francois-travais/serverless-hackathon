/**
 * Lib
 */

var AWS = require('aws-sdk');
var docClient = new AWS.DynamoDB.DocumentClient({
  region: AWS.config.region || 'eu-west-1'
});
var table = process.env.SERVERLESS_DATA_MODEL_STAGE + '-blog';

module.exports.respond = function (event, cb) {

  switch (event.method) {
    case 'GET':
      getPosts(cb);
      break;
    case 'POST':
      var post = event.body;
      post.id = null;
      savePost(post, cb);
      break;
    case 'PUT':
      var post = event.body;
      post.id = event.id;
      savePost(post, cb);
      break;
    case 'DELETE':
      deletePost(event.id, cb);
      break;
    default:
      cb("Unkown method " + event.method);
  }
};

function getPosts(cb) {
  var params = {
    TableName: table,
    AttributesToGet: [
      'id',
      'title',
      'content',
      'date'
    ]
  };
  docClient.scan(params, cb);
}

function savePost(post, cb) {
  post.id = post.id ? post.id : Date.now().toString();
  var params = {
    TableName: table,
    Item: post
  };
  docClient.put(params, function (err, response) {
    if (err) {
      cb(err, response)
    }
    cb(null, {
      message: "Post successfully saved !",
      post: post
    });
  });
}

function deletePost(postId, cb) {
  var params = {
    TableName: table,
    Key: {id: postId}
  };
  docClient.delete(params, function (err, response) {
    if (err) {
      cb(err, response);
    }
    cb(null, {message: "Post successfully deleted !", id: postId});
  });
}