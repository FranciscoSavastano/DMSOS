FROM node:18-alpine

WORKDIR . 

COPY package*.json ./
RUN npm install
RUN apk add --no-cache openssl

COPY . . 

EXPOSE 3333

CMD ["sh", "-c", "npm i && npx prisma generate && npx prisma migrate dev && npm run start:prod"]