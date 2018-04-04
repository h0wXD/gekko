// @link http://stockcharts.com/school/doku.php?id=chart_school:technical_indicators:moving_averages

var Indicator = function(weight) {
  this.input = 'price';
  this.weight = weight;
  this.result = false;
  this.prices = [];
  this.age = 0;
}

Indicator.prototype.update = function(price) {
  // We need a certain history before we can calculate EMA
  if (this.prices.length < this.weight) {
    this.prices.push(price);

    // EMA has to start somewhere
    // use SMA as initial value
    if (this.prices.length === this.weight) {
      var sum = 0;
      for (var i = 0; i < this.prices.length; i++) {
        sum += this.prices[i];
      }
      var sma = sum / this.weight;
      this.result = sma;
      this.age++;
      return this.result;
    }

    return false;
  }

  var lastEma = this.result;
  var multiplier = 2 / (this.weight + 1);
  var ema = (price - lastEma) * multiplier + lastEma;
  this.result = ema;
  this.age++;

  return this.result;
}

module.exports = Indicator;
