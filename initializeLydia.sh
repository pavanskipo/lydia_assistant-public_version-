#!/bin/bash

sudo npm install

echo "export PATH=$PATH:$(pwd)" >> ~/.bashrc

sudo echo "node Lydia/lydia.js" > lydia
sudo chmod +x lydia
sudo chmod +x Lydia/whereIsLydia.sh

echo "Done..., To call me just type 'lydia' "
exec bash
