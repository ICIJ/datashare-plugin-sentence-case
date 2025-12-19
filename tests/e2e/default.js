const axios = require('axios')
const document = require('../dummy.json')
const { main } = require('../../package.json')

module.exports = {
  before: function () {
    // Add a document in CAPSLOCK in Datashare using ElasticSearch API
    return axios.post('http://localhost:9200/local-datashare/_doc/b53063', document)
  },
  after: function () {
    // Delete the document
    return axios.delete('http://localhost:9200/local-datashare/_doc/b53063')
  },
  'default configuration test': function (browser) {
    browser.url('http://localhost:8080')
    // Wait for the app to be started
    browser.waitForElementVisible('.app')
    // Is the script injected correctly?
    browser.expect.element(`script[src="/plugins/package/${main}"]`).to.be.present
  },
  // This test is currently disabled until we release v20
  'it convert text to sentence case': ''+function() {
    // Move to a document
    browser.url('http://localhost:8080/#/d/local-datashare/b53063')
    // Wait for the document to be loaded
    browser.waitForElementVisible('.document-content')
    // Activate sentence case filter
    browser.click('.document__content__sentence-case label')
    // The content must be different now
    browser.expect.element('.document-content__body').text.to.equal('Lorem ipsum dolor sit amet.\nConsectetur adipisicing elit.')
    // Dectivate sentence case filter
    browser.click('.document__content__sentence-case label')
    // The document must have the same content that the test document
    browser.expect.element('.document-content__body').text.to.equal(document.content)
  }
};
