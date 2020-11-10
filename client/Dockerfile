FROM node:14

WORKDIR /chatox/client

COPY package.json ./
COPY yarn.lock ./
RUN yarn install

COPY . ./
RUN yarn run build

EXPOSE ${REACT_APP_PRODUCTION_PORT}

CMD ["node", "server.js"]
