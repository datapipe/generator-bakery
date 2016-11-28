/**
 * Feedback module informs users of status conditions and other
 * interactive messages.
 *
 * @module feedback
 */

'use strict';

const
    _ = require('lodash'),
    colors = require('colors');

let writer = console.error.bind(console);

/**
 * Declares the formatting used for each status level.
 *
 * @namespace
 * @public
 * @static
 *
 * @see module:feedback~applyStatusColors
 */
const STATUS = {
// NB: Each method here is documented twice. Once for the
// formatting function, and again for the output function.

  /** Less important informational messages
   * @static
   * @function module:feedback~info */

  /**
   * @default <tt>_.identity</tt>
   * @member {function} */
  info: _.identity,

  /** More important informational messages
   * @static
   * @function module:feedback~notice */

  /**
   * @default <tt>colors.bold</tt>
   * @member {function} */
  notice: colors.bold,

  /** Messages output on error, default is bold red
   * @static
   * @function module:feedback~warn */

  /**
   * @default <tt>colors.bold.red</tt>
   * @member {function} */
  warn: colors.bold.red
};

/**
 * Configure this module to use the given
 * writer function to output feedback to the user.
 *
 * The default writer is <tt>console.error</tt>.
 *
 * @param {function} [writeFunc]
 * @return {function}
 *
 * @public
 * @function module:feedback
 */
function feedback(writeFunc) {
  if (_.isFunction(writeFunc)) {
    writer = writeFunc;
  }

  applyStatusColors.call(feedback);
  return writer;
}

/**
 * Prepend the 'P' icon to the message, then pass
 * arguments to <tt>writer</tt>.
 *
 * @param {string} [message]
 * @param {...any} [context]
 * @return {any}
 *
 * @protected
 */
function writeIcon(message, context) {
  if (_.isString(arguments[0])) {
    arguments[0] = '\u{1F300}  ' + arguments[0];
  }

  return writer.apply(this, arguments);
}

/**
 * Create wrappers for each status level
 * defined in {@link module:feedback.STATUS}
 * to apply colors and call <tt>writeIcon</tt>.
 *
 * @protected
 */
function applyStatusColors() {
  Object.keys(STATUS).forEach((status) => {
    feedback[status] = function(message, context) {
      if (_.isString(message)) {
        const colorize = STATUS[status];
        arguments[0] = colorize(message);
      }

      return writeIcon.apply(this, arguments);
    };
  });
}

applyStatusColors.call(feedback);
feedback.STATUS = STATUS;

module.exports = feedback;
