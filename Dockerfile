# --- Stage 1: Builder ---
FROM node:20-alpine AS builder
WORKDIR /app

# Copy แค่ package files ก่อน เพื่อใช้ประโยชน์จาก Docker Cache (build เร็วขึ้น)
COPY package.json package-lock.json ./
RUN npm ci

# Copy Source Code ทั้งหมด
COPY . .

# รับ Argument ตอน Build (เพื่อฝัง Environment Variables ลงไปใน Build)
ARG VITE_FIREBASE_API_KEY
ARG VITE_FIREBASE_AUTH_DOMAIN
ARG VITE_FIREBASE_PROJECT_ID
ARG VITE_FIREBASE_STORAGE_BUCKET
ARG VITE_FIREBASE_MESSAGING_SENDER_ID
ARG VITE_FIREBASE_APP_ID
ARG VITE_FIREBASE_MEASUREMENT_ID
ARG VITE_ADMIN_EMAILS
ARG GEMINI_API_KEY

# Set ENV ให้ Vite เห็นตอน Build
ENV VITE_FIREBASE_API_KEY=$VITE_FIREBASE_API_KEY
ENV VITE_FIREBASE_AUTH_DOMAIN=$VITE_FIREBASE_AUTH_DOMAIN
ENV VITE_FIREBASE_PROJECT_ID=$VITE_FIREBASE_PROJECT_ID
ENV VITE_FIREBASE_STORAGE_BUCKET=$VITE_FIREBASE_STORAGE_BUCKET
ENV VITE_FIREBASE_MESSAGING_SENDER_ID=$VITE_FIREBASE_MESSAGING_SENDER_ID
ENV VITE_FIREBASE_APP_ID=$VITE_FIREBASE_APP_ID
ENV VITE_FIREBASE_MEASUREMENT_ID=$VITE_FIREBASE_MEASUREMENT_ID
ENV VITE_ADMIN_EMAILS=$VITE_ADMIN_EMAILS
ENV GEMINI_API_KEY=$GEMINI_API_KEY

# Build Production Code (ผลลัพธ์จะอยู่ที่ /app/dist)
RUN npm run build

# --- Stage 2: Production Runtime ---
FROM nginx:alpine
# ใช้ User nginx แทน root (Security Best Practice เบื้องต้น) - *Cloud Run อาจ override user แต่เราทำไว้ก่อน
# Copy Nginx Config ที่เราทำไว้
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy ไฟล์ที่ Build เสร็จแล้วจาก Stage 1 มาใส่
COPY --from=builder /app/dist /usr/share/nginx/html

# Cloud Run ต้องการ PORT 8080
EXPOSE 8080

CMD ["nginx", "-g", "daemon off;"]