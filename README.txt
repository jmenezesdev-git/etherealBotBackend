to build container use the usual
docker build . -t <newEthBotNodeServerImageName>

When containerized you will need the following commands
  node server runs on port 3000 so when running container if you want host exposure don't forget -p <PORT>:3000
  you will require a dns of ethbotmongo so just add it as an alias as seen below if you don't want that as the container name

ie docker run --name <nodeServerContainerName> -d -p 3000:3000 <newEthBotNodeServerImageName>

docker network create <myNetworkNameHere>
docker network connect --alias ethbotmongo <myNetworkNameHere> <mongodbContainerName>
docker network connect <myNetworkNameHere> <nodeServerContainerName>