FROM node:22-alpine

WORKDIR /app 

COPY package*.json ./
RUN npm install
RUN apk update
RUN apk add --no-cache openssl

#COPY .env .
COPY . .

# Create the directory where your generated docs will live
RUN mkdir -p build/gendocs

# Declare a Docker volume for the gendocs directory
VOLUME /app/build/gendocs

EXPOSE 3333

CMD ["sh", "-c", "npx prisma generate && npm run start:prod"]