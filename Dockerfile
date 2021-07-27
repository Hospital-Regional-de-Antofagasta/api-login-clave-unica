FROM node:lts-alpine3.14
 
# Create app directory
WORKDIR /usr/src/app
 
# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
COPY ["package.json", "package-lock.json*", "npm-shrinkwrap.json*", "./"]
 
# If you are building your code for production
# RUN npm ci --only=production
RUN npm install
 
# Bundle app source
COPY . .
 
EXPOSE 3025
CMD ["npm", "start"]