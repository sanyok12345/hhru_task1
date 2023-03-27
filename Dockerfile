FROM node:18

WORKDIR /app

COPY package*.json ./
COPY index.js ./
COPY public ./public
COPY .env ./

RUN npm install

EXPOSE 3000

CMD ["npm", "start"]