var fs = require('fs');

module.exports.getGroupsFromFile = function(callback) {

    // Get data from file
    fs.readFile('data/groupdata.json', 'utf-8', function(err, data) {
      if (err) throw err;

      var groups = JSON.parse(data);  
      callback(groups);
    });
}


module.exports.writeGroupsToFile = function(valuesObject, callback) {

  var groupsjson = JSON.stringify(valuesObject);

  fs.writeFile('data/groupdata.json', groupsjson, 'utf-8', function(err){
    if (err) throw err;
    callback(true);
  });
}


module.exports.getUsersFromFile = function(callback) {

    // Get data from file
    fs.readFile('data/userdata.json', 'utf-8', function(err, data) {
      if (err) throw err;
      callback(JSON.parse(data));
    });

}


module.exports.writeUsersToFile = function(valuesObject, callback) {

  var usersjson = JSON.stringify(valuesObject);

  fs.writeFile('data/userdata.json', usersjson, 'utf-8', function(err){
    if (err) throw err;
    callback(true);
  });
}
