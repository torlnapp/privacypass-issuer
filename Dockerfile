FROM oven/bun:alpine

COPY . /app
WORKDIR /app

RUN bun install --production

EXPOSE 8888

CMD ["bun", "run", "start"]
