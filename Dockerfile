FROM oven/bun:alpine

COPY . /app
WORKDIR /app

RUN bun install --production

CMD ["bun", "run", "start"]
