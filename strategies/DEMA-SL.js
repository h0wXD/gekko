// helpers
var _ = require('lodash');
var log = require('../core/log.js');

// let's create our own method
var method = {};

// prepare everything our method needs
method.init = function() {
  this.name = 'DEMA-SL';

  this.currentTrend;
  this.requiredHistory = this.tradingAdvisor.historySize;

  // define the indicators we need
  //this.addIndicator('dema', 'DEMA', this.settings);
  this.addIndicator('ema1', 'EMA', this.settings.short);
  this.addIndicator('ema2', 'EMA', this.settings.long);
}

// what happens on every new candle?
method.update = function(candle) {
  // nothing!
}

// for debugging purposes: log the last calculated
// EMAs and diff.
method.log = function() {
  /*var dema = this.indicators.dema;

  log.debug('calculated DEMA properties for candle:');
  log.debug('\t', 'long ema:', dema.long.result ? dema.long.result.toFixed(8) : 'none');
  log.debug('\t', 'short ema:', dema.short.result ? dema.short.result.toFixed(8) : 'none');
  log.debug('\t diff:', dema.result ? dema.result.toFixed(5) : 'none');
  log.debug('\t DEMA age:', dema.short.age, 'candles');*/
}

method.check = function(candle) {
  //var dema = this.indicators.dema;
  var shortEMA = this.indicators.ema1.result;
  var longEMA = this.indicators.ema2.result;

  var diff = 100 * (shortEMA - longEMA) / ((shortEMA + longEMA) / 2);
  var price = candle.close;

  if (!diff) {
    return;
  }

  var message = '@ ' + price.toFixed(8) + ' (' + diff.toFixed(5) + ')';

  // Simple stop loss
  if(this.trendAge > 5 && this.currentTrend === 'up' && price < this.lastPrice) {
    this.currentTrend = 'down';
    this.advice('short');
    this.lastPrice = price;
    this.slAge = 1;
    return;
  }

  // Wait 5 candles
  if (this.slAge < 5) {
    this.slAge++;
    return;
  }

  delete this.slAge;
  this.trendAge++;

  if(diff > this.settings.thresholds.up) {
    log.debug('we are currently in uptrend', message);

    if(this.currentTrend !== 'up') {
      this.currentTrend = 'up';
      this.advice('long');
      this.lastPrice = price;
      this.trendAge = 0;
    } else
      this.advice();

  } else if(diff < this.settings.thresholds.down) {
    log.debug('we are currently in a downtrend', message);

    if(this.currentTrend !== 'down') {
      this.currentTrend = 'down';
      this.advice('short');
      this.lastPrice = price;
      this.trendAge = 0;
    } else
      this.advice();

  } else {
    log.debug('we are currently not in an up or down trend', message);
    this.advice();
  }
}

module.exports = method;
