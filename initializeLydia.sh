#!/bin/bash

sudo npm install

echo "export PATH=$PATH:$(pwd)" >> ~/.bashrc

sudo chmod +x lydia
sudo chmod +x whereIsLydia.sh

echo "Done..., To call me just type 'lydia' "
exec bash
