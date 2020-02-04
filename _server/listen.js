
module.exports = function(PORT, URL, app) {

  let server = app.listen(PORT, '127.0.0.1', function() {
    let host = server.address().address;
    // let port = server.address().port;
    var d = new Date();
    var h = d.getHours();
    var m = d.getMinutes();

    console.log('-------------------------------------------------------');
    console.log("|  > Server listening: '" + host + "' on " + PORT);
    console.log("|  > MongoDb conected: " + URL);
    console.log("| => Server started at: " + h + ":" + m);
    console.log('-------------------------------------------------------');
  });

}