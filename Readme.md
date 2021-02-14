docker container rm $(docker container ls)  
docker container stop $(docker container ls)
docker rmi $(docker images -a -q)

docker-compose build --no-cache 
docker-compose up
heroku container:login
heroku container:push web -a brittny-web-api-gateway
heroku container:release web -a brittny-web-api-gateway
heroku logs --tail  -a brittny-web-api-gateway
