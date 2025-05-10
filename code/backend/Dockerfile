FROM node:lts-alpine

RUN apk add --no-cache python3 make g++

WORKDIR /app

RUN apk add --no-cache graphicsmagick imagemagick ghostscript poppler-utils
RUN apk add --no-cache make gcc g++ python3 libc6-compat

COPY package*.json ./
RUN npm install
RUN npm uninstall bcrypt && npm install bcryptjs

RUN npm install --build-from-source

COPY . .
RUN find . -type f -name "*.js" -exec sed -i 's/require("bcrypt")/require("bcryptjs")/g' {} \;

EXPOSE 5000

CMD ["npm", "start"]
