# HQ Web frontend container definition
FROM nginx
LABEL maintainer="Renato Juacaba Neto <rjuacaba@gmail.com>"

# Default Environment
ENV SITEMAP_BUILDER_CONFIG_PATH_FILE_SITEMAP=/home/site/sitemap.txt

# Prepare Python environment
RUN apt-get update -y
RUN apt-get install -y python3 python3-pip python3-requests

# Configure the default site
COPY nginx_conf/site_default.conf /etc/nginx/conf.d/default.conf
# Prepare startup Application
RUN mkdir -p /home/app
# Copy startup script
COPY scripts/startup.sh /home/app/startup.sh
RUN chmod 750 /home/app/startup.sh
# Copy sitemap updater
COPY scripts/sitemap_updater.py /home/app/sitemap_updater.py
RUN chmod 750 /home/app/sitemap_updater.py
# Prepare site
RUN mkdir -p /home/site
ADD site/dist/. /home/site
ADD seo/. /home/site
RUN chown nginx:nginx -R /home/site

# Publish the following ports
EXPOSE 80

# Working directory
WORKDIR /home/app

# Getting rid of /bin/sh
# RUN cp /bin/bash /bin/sh

# Launch container
CMD ./startup.sh
