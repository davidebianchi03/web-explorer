FROM node:latest

COPY . /webexplorer

WORKDIR /webexplorer

RUN cd /webexplorer && \
    npm install && \
    npm run build && \
    cd /webexplorer && \
    cp -R ./dist/react ./dist/express/react && \ 
    cp -R ./dist/express ./build && \
    cp ./docker/.env . && \
    rm -R dist && \
    npx prisma db push

EXPOSE 5000

CMD [ "build/server.js" ]
