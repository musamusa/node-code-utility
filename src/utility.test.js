'use strict'

const Utility = require('./index')

describe('Utility', () => {
  test('[Utility.is.array] it should test if value is array', () => {
    expect(Utility.is).toBeDefined()
    expect(Utility.is.array('my name')).toBeFalsy()
    expect(Utility.is.array(['names'])).not.toBeFalsy()
  })
})
