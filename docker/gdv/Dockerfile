FROM ubuntu:22.04

ENV DEBIAN_FRONTEND=noninteractive

RUN apt-get update && apt-get install -y \
    build-essential \
    git \
    curl \
    libcurl4-openssl-dev \
    perl \
    ca-certificates \
    make \
    gcc \
    g++ \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /opt

RUN git clone https://github.com/TPTPWorld/GDV.git

WORKDIR /opt/GDV

RUN rm -rf JJParser && \
    git clone https://github.com/TPTPWorld/JJParser.git JJParser

RUN make

ENV PATH="/opt/GDV:${PATH}"

WORKDIR /work

CMD ["bash"]