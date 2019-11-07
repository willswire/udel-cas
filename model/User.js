var mongo = require('mongoose');

var Schema = mongo.Schema;

var usersSchema = new Schema({
    objectId: mongo.Schema.Types.ObjectId,
    uid:  String,
    classes : Array,
    credits : Array
  });

module.exports = mongo.model('users', usersSchema);
