const data = require('./data.json')
let labels = require('./labels.json')
let counts = {};

// Analyse frequency of data
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

// Flip the order of the array
let reversed = [];
for (var i = 0; i < labelled.length; i++) {
  reversed.push([])
  reversed[i].push(labelled[i][1])
  reversed[i].push(labelled[i][0])
}

// Log results to console
console.log(reversed)
