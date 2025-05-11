#!/bin/bash
chmod +x build.sh
# Cài đặt Python và pip
apt-get update
apt-get install -y python3 python3-pip
# Cài đặt các thư viện từ requirements.txt
pip3 install -r requirements.txt
