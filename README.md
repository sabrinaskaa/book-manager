This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

### 1) Install dependencies

```bash
npm install
```

### 2) Buat database MySQL

Buat database dengan nama `library_db`.

### 3) Buat file environment

Buat file .env.local di root project.

### 4) Jalankan migration dan seeder

Jalankan migration dan seeder dengan `npx sequelize-cli db:migrate` dan `npx sequelize-cli db:seed:all`.

### 5) Jalankan project (development)

```bash
npm run dev
```
