
var $$ = require('../lib/mst.js');

console.log("Testing 'Limiter' ...");
var window1 = 1000,
  limit1 = 3,
  limiter = new $$.Limiter(),
  start = +Date.now(),
  // Document the start and end time of every thread
  times = [],
  cont = {
    // The count of things in flight
    count: 20,
    // A function to mark star
    up: function() {
      ++this.count;
    },
    // A function to mark completion
    down: function() {
      if (--this.count == 0) {
        var good = true;
        // Tally up the stuff
        for (var i = 0; i < times.length - 1; ++i) {
          // Count forward until we're over the time limit or reach the
          // process limit.
          var j = i + 1;
          for (; j < times.length; ++j) {
            if (times[j].end - times[i].start <= window1
              && j - i + 1 > limit1) {
              // We had more than the limited number of processes inside a
              // single window.
              console.log("Max process violation: " + (j - i + 1)
                + " inside " + (times[j].end - times[i].start) + " ms");
              good = false;
            }
          }
        }
        if (!good) {
          console.log("*** Failed 'Limiter' test! ***");
        } else {
          console.log("'Limiter' passed.");
        }
      }
    }
  };
for (var i = 0; i < 10; ++i) {
  (function(i) {
    //cont.up();
    limiter.attach(function() {
      var myEnd = +Date.now();
      times.push({
        start: myEnd,
        end: myEnd
      });
      //console.log(((myEnd - start) / 1000) + " - ran " + i);
      cont.down();
    });
  })(i);
}
for (var i = 10; i < 20; ++i) {
  (function(i) {
    //cont.up();
    limiter.attach(function(signal) {
      var myStart = +Date.now();
      //console.log(((myStart - start) / 1000) + " - starting " + i + " ...");
      setTimeout(function() {
        var myEnd = +Date.now();
        //console.log(((myEnd - start) / 1000) + " - stopped " + i);
        times.push({
          start: myStart,
          end: myEnd
        });
        signal();
        cont.down();
      }, 500);
    });
  })(i);
}


