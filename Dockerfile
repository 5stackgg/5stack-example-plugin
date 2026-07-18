# Builds the Module Federation remote (remoteEntry.js + assets) and serves it as
# static files. There is no backend — a plugin this small is just a web server
# handing the panel one JS file.
FROM node:22-alpine AS build
WORKDIR /app
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile
COPY . .
RUN yarn build

FROM nginx:alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
