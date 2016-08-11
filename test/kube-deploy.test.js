const assert = require('assert')
const http = require('http')
const kube = require('..')

describe('kube deploy', function() {
    var server

    before(function(done) {
        server = http.createServer(function(req, res) {
            if (req.method === 'PATCH' && req.url === '/apis/extensions/v1beta1/namespaces/default/deployments/test-deployment') {
                var body = ''
                req.on('data', function(chunk) {
                    body += chunk.toString()
                })
                req.on('end', function() {
                    res.writeHead(200, {'Content-Type': 'application/json'})
                    res.end(JSON.stringify({ok: true, payload: body, headers: req.headers}))
                })
                return
            }
            res.writeHead(404, {'Content-Type': 'application/json'})
            res.end(JSON.stringify({ok: false, error: 'not found'}))
        })
        server.listen(3000, done)
    })

    after(function(done) {
        server.close(done)
    })

    it('should send a patch request with the correct headers and payload', function(done) {
        kube.deploy({
            protocol: 'http',
            hostname: 'localhost',
            port: 3000,
            token: 'testToken',
            namespace: 'default',
            resourceType: 'deployment',
            resourceName: 'test-deployment',
            containerName: 'test-container',
            containerImage: 'repo/image:tag'
        }, function(err, json) {
            assert.ifError(err)
            assert.equal(json.ok, true)
            assert.equal(json.payload, '{"spec":{"template":{"spec":{"containers":[{"name":"test-container","image":"repo/image:tag"}]}}}}')
            assert.equal(json.headers['content-type'], 'application/strategic-merge-patch+json')
            assert.equal(json.headers['authorization'], 'Bearer testToken')
            done()
        })
    })

    it('should handle http errors', function(done) {
        kube.deploy({
            protocol: 'http',
            hostname: 'localhost',
            port: 3000,
            namespace: 'none',
            resourceType: 'deployment',
            resourceName: 'none',
            containerName: 'none',
            containerImage: 'none'
        }, function(err, json) {
            assert.ok(err)
            assert.equal(err.message, 'unexpected response code: 404')
            assert.equal(json.ok, false)
            assert.equal(json.error, 'not found')
            done()
        })
    })

    it('should use sane defaults', function(done) {
        kube.deploy({
            protocol: 'http',
            hostname: 'localhost',
            namespace: 'none',
            resourceType: 'deployment',
            resourceName: 'none',
            containerName: 'none',
            containerImage: 'none'
        }, function(err, json) {
            assert.ok(err)
            assert.equal(err.message, 'connect ECONNREFUSED 127.0.0.1:80')
            done()
        })
    })

    it('should handle invalid http options', function(done) {
        kube.deploy({protocol: 'invalid_protocol'}, function(err, json) {
            assert.ok(err)
            assert.equal(err.message, 'unknown protocol: invalid_protocol')
            done()
        })
    })

    it('should handle invalid kubernetes options', function(done) {
        kube.deploy({resourceType: 'unknown'}, function(err, json) {
            assert.ok(err)
            assert.equal(err.message, 'unknown resource type: unknown')
            done()
        })
    })

    it('should handle network errors', function(done) {
        kube.deploy({
            protocol: 'http',
            hostname: 'nohost',
            namespace: 'none',
            resourceType: 'deployment',
            resourceName: 'none',
            containerName: 'none',
            containerImage: 'none'
        }, function(err, json) {
            assert.ok(err)
            assert.equal(err.message, 'getaddrinfo ENOTFOUND nohost nohost:80')
            done()
        })
    })
})
