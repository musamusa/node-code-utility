'use strict'

const Promise = require('bluebird')
const extend = require('extend')
const DefaultLogger = require('node-logger-extended').DefaultLogger
const logger = new DefaultLogger({name: 'Utility'})
const PNF = require('google-libphonenumber').PhoneNumberFormat
const phoneUtil = require('google-libphonenumber').PhoneNumberUtil.getInstance()

class Utility {
  /**
   * Returns a single dimensional array of the values within the object passed in
   * e.g:
   * objectValues({name: 'John Doe', age: '51'}) becomes ['John Doe', '51']
   *
   * @param {Object} object
   * @returns {Array}
   */
  static objectValues (object) {
    if (Object.values) {
      return Object.values(object)
    }
    const arrValues = []
    const arrKeys = Object.keys(object)
    let i = arrKeys.length
    while (i--) {
      const key = arrKeys[i]
      arrValues.unshift(object[key])
    }
    return arrValues
  }

  /**
   * Returns a promise rejection if either of the arguments (response)
   * is empty else, the response object is returned
   *
   * @param {Object} arg1
   * @param {Object} arg2
   * @return {Promise}
   */
  static rejectIfResponseIsNone (arg1, arg2) {
    const response = arg2 || arg1
    response.rows = response.rows || []
    if (response.rows.length === 0) {
      logger.debug('Rejecting Promise : Response("response.rows") is empty or null')
      return Promise.reject(extend({status: 404, msg: 'Not Found'}, arg1))
    }
    return Promise.resolve(response)
  }

  /**
   * Returns a promise rejection if the response object
   * is not empty else, the response object is returned
   *
   * @param {Object} response
   * @returns {Promise}
   */
  static rejectIfExist (response) {
    response.rows = response.rows || []
    if (response.rows.length > 0) {
      logger.debug('Rejecting Promise : Response("response.rows") is not empty')
      return Promise.reject(extend({status: 409, msg: 'User already exist'}))
    }
    return Promise.resolve(response)
  }

  /**
   * Returns a promise rejection if either of the arguments is an error object
   *
   * @param {Object|Boolean} arg1
   * @param {Object} arg2
   * @returns {Promise.<*>}
   */
  static simpleErrorHandler (arg1, arg2) {
    const error = !arg2 ? arg1 : arg2
    logger.debug(error.message || error.body || error.msg || error, 'Error was handled using SimpleErrorHandler')
    if (arg2 === undefined) {
      return Promise.reject(error)
    }
  }

  /**
   * Returns a string if it successfully strips any leading zeros
   * else, the argument passed in, is returned as is
   * e.g:
   * stripLeadingZeros('003') becomes '3'
   *
   * @param {String} text
   * @returns {String}
   */
  static stripLeadingZeros (text) {
    try {
      text = text.replace(/^0+/, '')
    } catch (e) {}
    return text
  }

  /**
   * Returns a string if it successfully strips any set of specified leading character(s)
   * else, the argument passed in, is returned as is
   *
   * @param {String} char
   * @param {String} string
   * @returns {String}
   */
  static stripLeadingChar (char, string) {
    if (!Utility.is.string(string) || !Utility.is.string(char)) {
      return string
    }
    const regex = new RegExp(['^', char].join(''), 'ig')
    return string.replace(regex, '').trim()
  }

  /**
   * Returns a list of formatted E164 string else, the argument passed in, is returned as is
   * e.g:
   * reformatPhoneNumbers(['08012345678', false]) becomes ['+2348012345678', false]
   *
   * @param {Array} numbers
   * @param {String} countryCode
   * @returns {Array}
   */
  static reformatPhoneNumbers (numbers, countryCode = 'NG') {
    let result = numbers || []

    if (Utility.is.array(result) && result.length > 0) {
      const arrPhones = result
      result = []
      arrPhones.forEach(eachPhone => {
        let phoneNumber = phoneUtil.parse(eachPhone.trim(), countryCode)
        result.push(phoneUtil.format(phoneNumber, PNF.E164))
      })
    }

    return result
  }

  /**
   * Returns a formatted E164 string else, the argument passed in, is returned as is
   * e.g:
   * reformatPhoneNumber('08012345678') becomes '+2348012345678'
   *
   * @param {Number|String} number
   * @param {String} countryCode
   * @returns {String}
   */
  static reformatPhoneNumber (number, countryCode = 'NG') {
    let result = number || ''

    if (Utility.is.string(result) && result !== '') {
      let phoneNumber = phoneUtil.parse(result.trim(), countryCode)
      result = phoneUtil.format(phoneNumber, PNF.E164)
    }

    return result
  }

  /**
   * @description get index of all occurrences of element
   * @param {Array} list
   * @param {*} element
   * @return {Array}
   */
  static findAllIndex (list, element) {
    const indices = []
    var idx = list.indexOf(element)
    while (idx !== -1) {
      indices.push(idx)
      idx = list.indexOf(element, idx + 1)
    }
    return indices
  }

  /**
   *
   * @param {String} string
   * @return {Boolean}
   */
  static hasAlphabet (string) {
    return /[a-z]/i.test(string)
  }

  /**
   * @description returns proper Javascript error object expected properties could include message, status and so on.
   * @param {Object} object
   * @return {Error}
   */

  static toNodeError (object) {
    object = Utility.is.object(object) ? object : {}
    const error = new Error(object.message || object.msg || '')

    return extend(error, object)
  }
}

/**
 * Returns a boolean affirmation whether the argument passed in, is an object, an array or a string
 *
 * @type {String}
 */
Utility.is = {
  object: object =>
    Object.prototype.toString.call(object) === '[object Object]',
  array: array =>
    Object.prototype.toString.call(array) === '[object Array]',
  string: string =>
    Object.prototype.toString.call(string) === '[object String]',
  number: number =>
    Object.prototype.toString.call(number) === '[object Number]' && !isNaN(parseInt(number, 10)),
  emptyObject: object => {
    if (!Utility.is.object(object)) {
      return true
    }

    return Object.keys(object).length === 0
  }
}

module.exports = Utility
