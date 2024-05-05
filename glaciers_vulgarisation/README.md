---

Pour lancer l'environnement virtuel :
. env/bin/activate


pip install Flask
pip install flask-cors
pip install flask-restx
pip install SQLAlchemy

# Se mettre dans le dossier glaciers_vulgarisation

Pour lancer l'application :
./exe
# aller à http://127.0.0.1:5000/vulgarisation/

Pour lancer les tests :
./tests

Pour obtenir le temps de réponse :
snakeviz profs

Possibilité de passer en Drop and Create dans db.py en décommentant dans init_db_command

---

flask --app api init-db
flask --app api run --debug

http://127.0.0.1:5000/
http://127.0.0.1:5000/1/update
http://127.0.0.1:5000/create


UTILISEES
POST
curl -X POST 'http://127.0.0.1:5000/createeasy' -H 'Content-Type: application/json' -d '{"title":"Voici un beau titre!", "body":"Attention aux apostrophes !", "id":"1"}'
curl -X POST 'http://127.0.0.1:5000/createjson' -d '{"title":"Voici un beau titre!", "body":"Attention aux apostrophes !"}' -H "Content-Type: application/json" -H 'User-Agent: Mozilla/5.0 (X11; Linux x86*64; rv:103.0) Gecko/20100101 Firefox/103.0' -H 'Accept: text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/\_;q=0.8' -H 'Accept-Language: fr,fr-FR;q=0.8,en-US;q=0.5,en;q=0.3' -H 'Accept-Encoding: gzip, deflate, br' -H 'Content-Type: application/x-www-form-urlencoded' -H 'Origin: http://127.0.0.1:5000' -H 'Connection: keep-alive' -H 'Referer: http://127.0.0.1:5000/auth/login' -H 'Cookie: session=eyJ1c2VyX2lkIjoxfQ.ZJVWtQ.PKzNmmzhguJDZMsHf2iin5GBes8' -H 'Upgrade-Insecure-Requests: 1' -H 'Sec-Fetch-Dest: document' -H 'Sec-Fetch-Mode: navigate' -H 'Sec-Fetch-Site: same-origin' -H 'Sec-Fetch-User: ?1' --data-raw 'username=lea&password=drd'
DELETE
curl -X DELETE 'http://127.0.0.1:5000/10/delete' -H "Content-Type: application/json"
GET
curl 'http://127.0.0.1:5000'
PATCH
curl -X PATCH 'http://127.0.0.1:5000/6/updatejson' -d '{"title":"Voici une modification réussie", "body":"Le corps est aussi modifié"}' -H "Content-Type: application/json"
