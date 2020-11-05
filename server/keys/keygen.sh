ssh-keygen -t rsa -b 2048 -f privateKey.key -P ""
rm -f privateKey.key.pub
openssl rsa -in privateKey.key -pubout -outform PEM -out publicKey.key