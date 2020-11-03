FROM node:14

# Create app dir
WORKDIR /usr/src/app/

COPY package*.json ./
COPY src ./src/
COPY public ./public/
COPY backup ./backup/
COPY assets ./assets/
COPY test ./test/

# Set non root user
RUN useradd -c 'CTF' -m -d /home/ctf -s /bin/bash ctf
RUN chown -R ctf:ctf /home/ctf

RUN npm install forever -g
RUN chown -R ctf:ctf /usr/src/app/

USER ctf
ENV HOME /home/ctf
RUN npm install

EXPOSE 3000
# Start server
CMD [ "npm", "start" ]
