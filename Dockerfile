# Menggunakan image Node.js untuk backend
FROM node:18-alpine

# Set working directory di dalam container
WORKDIR /app

# Menyalin package.json dan package-lock.json ke container
COPY package.json package-lock.json ./

# Install dependencies
RUN npm install

# Menyalin seluruh file proyek ke container
COPY . .

#Build aplikasi Typescript
RUN npm run build

# Mengekspos port yang digunakan oleh backend
EXPOSE 5000

# Menjalankan aplikasi
CMD ["npm", "start"]
