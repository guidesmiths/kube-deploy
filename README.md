[![Build Status](https://img.shields.io/travis/guidesmiths/kube-deploy/master.svg)](https://travis-ci.org/guidesmiths/kube-deploy)
[![Code Style](https://img.shields.io/badge/code%20style-imperative-brightgreen.svg)](https://github.com/guidesmiths/eslint-config-imperative)

# kube-deploy
It's meant to be used in continuous integration pipelines in order to update a kubernetes deployment with the most recent docker image. It sends a PATCH request to the kubernetes apiserver in order to do so.

Currently, only [deployments](http://kubernetes.io/docs/user-guide/deployments/) are supported and other types of kubernetes resources will be added when and if they are requested.

## Usage
```
  Usage: kube-deploy [options] <resource-type/resource-name> <container-name> <container-image>

  Options:

    -h, --help               output usage information
    -u --url <string>        kubernetes API URL
    -n --namespace <string>  optional: kubernetes namespace [default: default]
    -k --insecure-https      optional: ingore SSL certificate validity
```

## Example
It's designed to be used as a script in other packages:

```
"scripts": {
  ...
  "deploy": "kube-deploy -u https://kubernetes.example.com deployment/my-deployment my-container-name docker/image:tag",
  ...
}
```

So that it makes it easy to just say `npm run kube-deploy` in the CI pipeline.

## Authentication
In order to authenticate against the kubernetes deployment, `kube-deploy` will use the access token from the environment variable `KUBERNETES_TOKEN`.

## Docker
You also can run kube-deploy with docker
```
docker run guidesmiths/kube-deploy [options] <resource-type/resource-name> <container-name> <container-image>
```
