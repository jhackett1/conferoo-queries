// Import data
let labels = require('./labels.json');

// Get modules
const barHorizontal = require('bar-horizontal');
const MongoClient = require('mongodb').MongoClient;
const assert = require('assert');

// Use connect method to connect to the server
MongoClient.connect(process.env.MONGODB_URI, function(err, client) {
  assert.equal(null, err);
  console.log("Connected successfully to server");

  // Make the query
  client.db(process.env.DB_NAME).collection('users').aggregate([
    {$match: {programme: "Friday"}},
    {$unwind:"$agenda"},
    {$group:{_id:null, clrs: {$push : "$agenda"} }},
    {$project:{_id:0, agenda: "$clrs"}} ]
  ).toArray(function(err, result){
    let data = result[0].agenda;

    // Analyse frequency of data
    let counts = {};
    for (var i = 0; i < data.length; i++) {
      var num = data[i];
      counts[num] = counts[num] ? counts[num] + 1 : 1;
    }

    // Sort the results into an array
    var sorted = [];
    for (var event in counts) {
      sorted.push([event, counts[event]]);
    }
    sorted.sort(function(a, b) {
      return a[1] - b[1];
    });

    // Narrow down labels to just the necessaries
    labels = labels.map(function(label){
      return {
        _id: label._id,
        title: label.title
      }
    })

    // And add labels from the labelling data
    let labelled = sorted.map(function(event){
      // Get the ID from the event
      let _id = event[0];
      // Find the corresponding label for that event ID
      let result = labels.filter(function(label){
        return label._id === event[0];
      })
      // If there is a matching result, reassign the ID to the title
      if (result.length > 0) {
        event[0] = result[0].title
      }
      return event;
    })

    // Display in a graph
    let forGraph = {}
    for (var i = 0; i < labelled.length; i++) {

      let label = labelled[i][0];
      let value = labelled[i][1];

      forGraph[label] = value;
    }
    barHorizontal(forGraph, {labels: true})

  })
  // Close database connection
  client.close();
});
