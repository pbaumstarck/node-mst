
// class: Limiter
// Limits the number of active simultaneous requests in a given time window to a
// given number.
function Limiter(obj) {
  var _this = this,
    // The length of our window in milliseconds
    _window = 1000,
    // The cap on the number of active requests
    _limit = 3,
    // Tasks that have yet to be run
    _pending = [],
    // Tasks that are in progress
    _inProgress = [],
    // Tasks that have finished and still occupy our window; otherwise, they are
    // flushed from memory.
    _finished = [];

  function _ctor() {
    if (obj && typeof obj == "object") {
      _window = obj.window || _window;
      _limit = obj.limit || _limit;
    }
  }


  // function: attach
  // Attach a callback that should be run in the normal queue
  _this.attach = function(callback) {
    _pending.push(callback);
    _launch();
  }

  // function: _launch
  // Attempt to launch callbacks
  function _launch() {
    if (_pending.length == 0) {
      return;
    }
    // See how many free slots we have
    var now = +Date.now(),
      // Always take off the number of in-progress callbacks
      nFree = _limit - _inProgress.length;
    for (var i = _finished.length - 1; i >= 0; --i) {
      var fin = _finished[i];
      if (fin.finish < now - _window) {
        // This task is out of range, so we can drop them
        _finished = _finished.slice(i + 1);
        break;
      } else {
        // This task is still in the window
        --nFree;
      }
    }
    while (nFree > 0 && _pending.length > 0) {
      // We can launch
      var next = _pending.shift();
      if (next.length == 0) {
        // This callback has no signal callback, so mark it finished immediately
        _finished.push({
          callback: next,
          finish: +Date.now()
        });
        next();
        // And check for re-run once we know this guy is out of the window
        setTimeout(function() { _launch(); }, _window);
      } else {
        // They do have a signal callback, so send them a bookkeeping signal
        _inProgress.push({
          callback: next,
          start: +Date.now()
        });
        next(function() {
          // We can move this guy over from '_inProgress' to '_finished'
          var ix = -1;
          for (var j = 0; j < _inProgress.length; ++j) {
            if (_inProgress[j].callback == next) {
              ix = j;
              break;
            }
          }
          if (ix != -1) {
            _inProgress.splice(ix, 1);
            _finished.push({
              callback: next,
              finish: +Date.now()
            });
            // And check for re-run once we know this guy is out of the window
            setTimeout(function() { _launch(); }, _window);
          }
        });
      }
      --nFree;
    }
    if (_pending.length > 0) {
      setTimeout(function() { _launch(); }, _window);
    }
  }


  _ctor();
}

if (typeof module != "undefined" && module != null) {
  module.exports = Limiter;
}


