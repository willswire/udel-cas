var mongo = require('mongoose');

var Schema = mongo.Schema;

var plansSchema = new Schema({
    objectId: mongo.Schema.Types.ObjectId,
    planID:  String,
    semester_1: Array,
    semester_2: Array,
    semester_3: Array, 
    semester_4: Array,
    semester_5: Array,
    semester_6: Array,
    semester_7: Array, 
    semester_8: Array
  });

module.exports = mongo.model('plans', plansSchema);
