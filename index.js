var request = require('request')
var format = require('util').format
var has = require('lodash.has')
var defaults = require('lodash.defaults')
var difference = require('lodash.difference');

const resourceTypes = {
    deployment: {
        apiEndpoint: 'apis/extensions/v1beta1'
    }
}

function formatUrl(options) {
    return format('%s://%s:%d/%s/namespaces/%s/%ss/%s', options.protocol, options.hostname, options.port, resourceTypes[options.resourceType].apiEndpoint, options.namespace, options.resourceType, options.resourceName)
}

function jsonPayload(options) {
    return {spec: {template: {spec: {containers: [{name: options.containerName, image: options.containerImage}]}}}}
}

function perpareOptions(options) {
    var _options = defaults({}, options, {protocol: 'https', namespace: 'default'})
    if (['http', 'https'].indexOf(_options.protocol) === -1) return new Error(format('unknown protocol: %s', _options.protocol))
    _options.port = _options.port || {'http': 80, 'https': 443}[_options.protocol]
    if (!has(resourceTypes, _options.resourceType)) return new Error(format('unknown resource type: %s', _options.resourceType))
    var missing = difference(['protocol', 'hostname', 'port', 'namespace', 'resourceType', 'resourceName', 'containerName', 'containerImage'], Object.keys(_options))
    if (missing.length > 0) return new Error(format('missing options: %s', missing.join(', ')))
    return _options
}

module.exports = {
    resourceTypes: resourceTypes,
    deploy: (options, cb) => {
        var _options = perpareOptions(options)
        if (_options instanceof Error) {
            cb(_options)
            return
        }
        var _headers = {'Content-Type': 'application/strategic-merge-patch+json'}
        if (has(_options, 'token')) _headers['Authorization'] = format('Bearer %s', _options.token)
        request({
            url: formatUrl(_options),
            method: 'PATCH',
            json: jsonPayload(_options),
            headers: _headers,
            strictSSL: !options.insecureHttps
        }, function(err, res, body) {
            if (err) return cb(err)
            if (res.statusCode >= 400) return cb(new Error(format('unexpected response code: %d', res.statusCode)), body)
            cb(null, body)
        })
    }
}
