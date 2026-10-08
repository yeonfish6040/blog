---
title: "Automated Typeorm Schema Migration."
description: "Typeorm을 사용할때 자동으로 db에 스키마 변경사항을 적용시키는 방법."
published: 2025-04-03
tags: [node.js, typeorm]
category: developing
draft: true
locales:
  en:
    title: "Automated Typeorm Schema Migration."
    description: "How to automatically apply schema changes to the DB when using TypeORM."
---

# tl;dr

`package.json`
```json
{
  "scripts": {
    "typeorm": "ts-node -r tsconfig-paths/register ./node_modules/typeorm/cli.js",
    "migration": "$(rm src/migrations/* && npm run typeorm migration:generate src/migrations/InitSchema -- -d src/scripts/data-source.ts && npm run typeorm migration:run -- -d src/scripts/data-source.ts) || true",
  }
}
```
\
`src/scripts/data-source.ts`
```typescript
import * as dotenv from "dotenv";
import { DataSource } from "typeorm";

dotenv.config({ path: `.env.${process.env.NODE_ENV}` });

export default new DataSource({
  type: "postgres",
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  username: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  entities: ["src/schemas/**/*.ts"],
  migrations: ["src/migrations/**/*.ts"],
  synchronize: false,
});
```

# Introduction

:::::locale{lang=ko}
학교 인트라넷을 개발중 typeorm의 synchronize 기능이 e2e test 환경에서 정상적으로 동작하지 않아, 해결방안을 탐색중 synchronize 기능은 안전하지 않다는 사실을 깨닫고 migration 방식으로 migration 했다 (말장난 ㄷㄷ).
고로 이 문서에서는 typeorm의 migration 기능을 프로젝트에 적용하는 방법에 대하여 설명할 것이다.
:::::

:::::locale{lang=en}
While developing the school intranet, TypeORM's synchronize feature didn't work properly in the e2e test environment. Looking for a fix, I realized synchronize isn't safe, so I migrated to the migration approach (what a pun).
This post therefore explains how to apply TypeORM's migration feature to a project.
:::::

:::::locale{lang=ko}
# db 연결
:::::

:::::locale{lang=en}
# Connecting to the DB
:::::

:::::locale{lang=ko}
db 커넥션을 만들어주는 스크립트를 하나 짠다
:::::

:::::locale{lang=en}
Write a script that creates the DB connection.
:::::

\
`src/scripts/data-source.ts`
```typescript
import * as dotenv from "dotenv";
import { DataSource } from "typeorm";

dotenv.config({ path: `.env.${process.env.NODE_ENV}` });

export default new DataSource({
  type: "postgres",
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT),
  username: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  entities: ["src/schemas/**/*.ts"],
  migrations: ["src/migrations/**/*.ts"],
  synchronize: false,
});
```

:::::locale{lang=ko}
# 이전 migration 데이터 삭제
:::::

:::::locale{lang=en}
# Deleting previous migration data
:::::

:::::locale{lang=ko}
이상하게도 기존 migration 파일이 남아있으면 오류가 나기 때문에 해당 파일을 없애준다.
:::::

:::::locale{lang=en}
Oddly enough, leftover migration files cause errors, so we delete them.
:::::

```shell
rm src/migrations/*
```

:::::locale{lang=ko}
# migration 데이터 생성
:::::

:::::locale{lang=en}
# Generating migration data
:::::

```shell
npm run typeorm migration:generate src/migrations/InitSchema -- -d src/scripts/data-source.ts
```

# migration!

```shell
npm run typeorm migration:run -- -d src/scripts/data-source.ts
```

# merge command

:::::locale{lang=ko}
순차적으로 위의 명령들을 실행해야하는데, 명령에 실패하면 뒤에 명령을 실행시키면 안되니, &&로 연결시켜준다
:::::

:::::locale{lang=en}
The commands above have to run in order, and if one fails the following ones must not run — so we chain them with `&&`.
:::::

```shell
(rm src/migrations/* && npm run typeorm migration:generate src/migrations/InitSchema -- -d src/scripts/data-source.ts && npm run typeorm migration:run -- -d src/scripts/data-source.ts
```

:::::locale{lang=ko}
끝!
:::::

:::::locale{lang=en}
Done!
:::::
