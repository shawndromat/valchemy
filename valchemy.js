var _ = require('lodash');

function BasicValidation() {
  this.validators = [];
  this.messages = [];
}

function addValidator(makeValidator) {
  return function() {
    var validator = makeValidator.apply(this, arguments);
    this.validators.push(validator);
    return this;
  }
}

function modifyValidator(makeModifier) {
  return function() {
    var modifier = makeModifier.apply(this, arguments).bind(this);

    var targetValidator = this.validators.pop();
    this.validators.push(function(value) {
      return modifier(targetValidator, value);
    });

    return this;
  }
}

BasicValidation.prototype.length = addValidator(require('./validators/length'));
BasicValidation.prototype.pattern = addValidator(require('./validators/pattern'));

BasicValidation.prototype.withMessage = modifyValidator(require('./modifiers/withMessage'));

BasicValidation.prototype.validate = function(value) {
  var results = _.map(this.validators, function(validator) {
    return validator(value);
  });

  return {
    valid: _.every(results, function(result) {
      return result.valid;
    }),
    messages: _.map(results, function(result) {
      return result.message;
    })
  };
};

module.exports = {
  BasicValidation: BasicValidation
};
