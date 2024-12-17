FROM node:18-alpine

WORKDIR . 

COPY package*.json ./
RUN npm install
RUN apk add --no-cache openssl

COPY . . 

EXPOSE 3333

CMD ["sh", "-c", "npx prisma migrate dev && npx prisma generate && npm run start:prod"]