FROM node:16

COPY . /usr/src/app

# COPY ./sample/analyzer.json /sample/analyzer.json

# COPY ./sample/mapping.json /sample/mapping.json

COPY ./healthcheck.sh /usr/bin/healthcheck.sh

RUN mkdir -p /tmp/locks 

RUN chmod +x /usr/bin/healthcheck.sh

RUN npm install --prefix /usr/src/app

RUN npm install -g /usr/src/app

ENTRYPOINT [ "elasticsetup"]