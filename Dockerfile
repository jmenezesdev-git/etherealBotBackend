FROM node:22-alpine3.19
RUN mkdir -p /home/node/app/node_modules && chown -R node:node /home/node/app
WORKDIR /home/node/app
#USER node
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 5000
CMD [ "node", "index.js" ]