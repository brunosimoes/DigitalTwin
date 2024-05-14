FROM node:20 as builder

ENV PROJECT=./Digital-Twin-Registry
WORKDIR /home/app/Registry

# Install node dependencies
COPY ${PROJECT}/package.json .
COPY ${PROJECT}/yarn.lock .
RUN yarn

# Copy source code
COPY ${PROJECT}/ .

# Remove local dev flag
RUN sed -i '/"devServerHost":/d' ./config/module.json
RUN sed -i ':a;N;$!ba;s/,\n}/\n}/' ./config/module.json

# Build microfrontend
ENV NODE_ENV production
RUN yarn build && \
  rm -rf ./public/types && \
  cp -rf ./public/* ./dist/ && \
  tar xOf ./public/pbcRegistry-dts.tgz 

WORKDIR /home/app/Registry/dist

FROM rockstorm/git-server

ENV PROJECT=./Digital-Twin-Registry

# Install Node and Yarn
RUN apk add --update nodejs npm curl bash && npm install --global yarn

# Install registry service
WORKDIR /srv/Digital-Twin-Registry
ADD ${PROJECT}/registry ./registry
ADD ${PROJECT}/orchestrator.sh .
RUN chmod a+x ./orchestrator.sh

WORKDIR /srv/Digital-Twin-Registry/registry
RUN yarn

# Install microfrontend
COPY --from=builder /home/app/Registry/dist /srv/Digital-Twin-Registry/registry/public

CMD ["yarn", "start"]