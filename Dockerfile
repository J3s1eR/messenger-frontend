# Используем базовый образ Node.js
FROM node:22.15

# Устанавливаем рабочую директорию
WORKDIR /app

# Копируем package.json и pnpm-lock.yaml для установки зависимостей
COPY package.json pnpm-lock.yaml ./

# Устанавливаем pnpm и зависимости (pnpm install автоматически установит pnpm, если его нет)
    RUN npm install -g pnpm 
    #RUN pnpm install 
#corepack enable включит поддержку pnpm, если она отключена. Использование --frozen-lockfile гарантирует, что зависимости установятся точно по pnpm-lock.yaml, без обновлений.
#RUN npm install -g pnpm@10.6.2
# Настраиваем кэш pnpm
#RUN pnpm config set store-dir /root/.pnpm-store
# Очищаем кэш и устанавливаем зависимости
#RUN pnpm store prune
# Явно устанавливаем vite
#RUN pnpm install vite@6.2.1 --save-dev --verbose
RUN pnpm install --frozen-lockfile --verbose
##RUN corepack enable && pnpm install --frozen-lockfile

##RUN pnpm add esbuild@latest
##RUN pnpm add esbuild@0.25.2
##RUN pnpm install --frozen-lockfile
#
## Явно устанавливаем esbuild
##RUN pnpm install esbuild --save
## Перестраиваем бинарные файлы
##RUN pnpm rebuild esbuild

# Копируем конфигурационные.ConcurrentModificationException файлы и index.html
COPY vite.config.ts tsconfig.json tsconfig.app.json tsconfig.node.json index.html ./

# Копируем остальные файлы для билда (src и public будут перезаписаны монтированием)
COPY src ./src
COPY public ./public

# Проверяем наличие vite.js
#RUN ls -l /app/node_modules/vite/bin/vite.js || (echo "vite.js not found" && exit 1)

# Открываем порт для приложения
EXPOSE 40500



#####  1 вариант запуска  #####################################################
# Запускаем приложение в dev режиме
CMD ["pnpm", "run", "dev", "--host", "0.0.0.0", "--port", "40500"]
###############################################################################


#####  2 вариант запуска  #####################################################
## Строим проект
#RUN pnpm run build
#
## Запускаем приложение с помощью Vite в продакшн-режиме
#CMD ["pnpm", "run", "preview", "--host", "0.0.0.0", "--port", "40500"]
###############################################################################