FROM mhart/alpine-node:6

RUN npm install -g kube-deploy

ENTRYPOINT ["kube-deploy"]

