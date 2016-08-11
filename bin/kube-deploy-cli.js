#!/usr/bin/env node

var program = require('commander')
var format = require('util').format
var url = require('url');
var kube = require('..')

program
    .arguments('<resource-type/resource-name> <container-name> <container-image>')
    .option('-u --url <string>', 'kubernetes API URL')
    .option('-n --namespace <string>', 'optional: kubernetes namespace [default: default]', 'default')
    .option('-k --insecure-https', 'optional: ingore SSL certificate validity')
    .action(main)
    .parse(process.argv)

if (!program.args.length) usage()

function main(resource, containerName, containerImage){
    var resourceInfo = resource.split('/')
    if (resourceInfo.length !== 2) exitError('invalid resource format')
    var options = parseOptions()
    options.resourceType = resourceInfo[0]
    options.resourceName = resourceInfo[1]
    options.containerName = containerName
    options.containerImage = containerImage
    kube.deploy(options, function(err, json) {
        if (err) exitError(err)
        process.exit(0)
    })
    setInterval(function() {}, Number.MAX_VALUE)
}

function parseOptions() {
    if (!program.url) exitError('please specify a URL for kubernetes')
    var parsedUrl = url.parse(program.url)
    if (parsedUrl.hostname === null) exitError('could not parse kubernetes URL')
    var deployOptions = {
        protocol: parsedUrl.protocol ? parsedUrl.protocol.slice(0, -1) : undefined,
        hostname: parsedUrl.hostname,
        namespace: program.namespace,
        containerName: program['container-name'],
        insecureHttps: !!program.insecureHttps
    }
    if (parsedUrl.port) deployOptions.port = parsedUrl.port
    if (process.env.KUBERNETES_TOKEN) deployOptions.token = process.env.KUBERNETES_TOKEN
    return deployOptions
}

function usage() {
    program.outputHelp()
    process.exit(1)
}

function exitError(message) {
    console.error(format('error: %s', message))
    process.exit(1)
}
