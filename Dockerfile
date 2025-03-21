FROM node:22-alpine

WORKDIR .

COPY package*.json ./
RUN npm install
RUN apk update
RUN apk add --no-cache openssl

COPY .env . 
COPY . . 

EXPOSE 3333

CMD ["sh", "-c", "npx prisma generate && npx prisma migrate deploy && npm run start:prod"]