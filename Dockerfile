FROM node:18-alpine

WORKDIR . 

COPY package*.json ./
RUN npm install
RUN apk add --no-cache openssl

COPY . . 

EXPOSE 3333

CMD ["./start.sh"]