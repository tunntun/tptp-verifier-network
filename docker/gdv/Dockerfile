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

RUN git clone --recursive https://github.com/TPTPWorld/GDV.git

WORKDIR /opt/GDV

RUN git submodule update --init --recursive

RUN make

ENV PATH="/opt/GDV:${PATH}"

WORKDIR /work

CMD ["bash"]