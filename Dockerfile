FROM node:latest

COPY . /app
WORKDIR /app
COPY package.json ./
RUN npm install
EXPOSE 3000
CMD [ "npm", "start" ]
