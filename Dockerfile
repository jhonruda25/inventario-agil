# 1. Base Image: Usamos una imagen oficial de Node.js en su versión 20 (LTS).
FROM node:20-alpine

# 2. Directorio de Trabajo: Establecemos el directorio de trabajo dentro del contenedor.
WORKDIR /app

# 3. Copiar Dependencias: Copiamos los archivos de definición de dependencias.
COPY package.json ./

# 4. Instalar Dependencias: Instalamos las dependencias del proyecto.
# Usamos --frozen-lockfile para asegurar builds consistentes si hubiera un lockfile.
# Dado que no hay, npm install será suficiente.
RUN npm install

# 5. Copiar Código Fuente: Copiamos el resto del código de la aplicación.
COPY . .

# Argumento para la URI de MongoDB en tiempo de construcción
ARG MONGODB_URI
# Establecer la variable de entorno para el proceso de construcción
ENV MONGODB_URI=${MONGODB_URI}

# 6. Construir la Aplicación: Compilamos la aplicación de Next.js para producción.
RUN npm run build

# 7. Exponer Puerto: Exponemos el puerto en el que Next.js corre por defecto en producción.
EXPOSE 3000

# 8. Comando de Inicio: El comando para iniciar la aplicación cuando el contenedor se ejecute.
CMD ["npm", "start"]
