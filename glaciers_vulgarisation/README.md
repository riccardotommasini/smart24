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

Pour passer l'authentification jwt :
curl -X POST 'http://127.0.0.1:5000/blog/' -H 'Content-Type: application/json' -d '{"title":"Quel joli titre!", "body":"Il faut prendre un pause"}' -H "Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJmcmVzaCI6ZmFsc2UsImlhdCI6MTY4Nzk0Mjk1NiwianRpIjoiYjEwMDUzYTAtYzEyZS00OTI1LTljZmItYTBmY2UxMzBjYWY4IiwidHlwZSI6ImFjY2VzcyIsInN1YiI6MiwibmJmIjoxNjg3OTQyOTU2LCJleHAiOjE2ODc5NDM4NTZ9.cjDDTlK3y6cGaBrwEuIGgeW6hmbe2gOeULNH9agXxLI"
///// Adresse à acceder //// /////Toute la clé retournée à l'authentification ////
curl -X DELETE 'http://127.0.0.1:5000/blog/5' -H "Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJmcmVzaCI6ZmFsc2UsImlhdCI6MTY4Nzk0Mjk1NiwianRpIjoiYjEwMDUzYTAtYzEyZS00OTI1LTljZmItYTBmY2UxMzBjYWY4IiwidHlwZSI6ImFjY2VzcyIsInN1YiI6MiwibmJmIjoxNjg3OTQyOTU2LCJleHAiOjE2ODc5NDM4NTZ9.cjDDTlK3y6cGaBrwEuIGgeW6hmbe2gOeULNH9agXxLI"

curl -X PATCH 'http://127.0.0.1:5000/blog/3' -H "Content-Type: application/json" -d '{"title":"Joli papillon", "body":"Bientôt les vacances"}' -H "Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJmcmVzaCI6ZmFsc2UsImlhdCI6MTY4Nzk0MzkwNiwianRpIjoiNzIyZTNlOWYtZThmNC00MDZmLThiMWYtZDVhYTY1NGY5MmIyIiwidHlwZSI6ImFjY2VzcyIsInN1YiI6MSwibmJmIjoxNjg3OTQzOTA2LCJleHAiOjE2ODc5NDQ4MDZ9.gDB676sED7nNZ4RRIGjeXBXjkvUAwgD1hmhuu_YjYis"

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

AVEC AUTHENTIFICATION

curl -X PATCH 'http://127.0.0.1:5000/3/updatejson' -d '{"title":"Modification du titre", "body":"Modification du corps"}' -H "Content-Type: application/json" -H 'User-Agent: Mozilla/5.0 (X11; Linux x86*64; rv:103.0) Gecko/20100101 Firefox/103.0' -H 'Accept: text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/\_;q=0.8' -H 'Accept-Language: fr,fr-FR;q=0.8,en-US;q=0.5,en;q=0.3' -H 'Accept-Encoding: gzip, deflate, br' -H 'Referer: http://127.0.0.1:5000/' -H 'Connection: keep-alive' -H 'Cookie: session=eyJ1c2VyX2lkIjoxfQ.ZJP3sQ.drCRMx1HUX7MLBNahOSTa9nN7ds' -H 'Upgrade-Insecure-Requests: 1' -H 'Sec-Fetch-Dest: document' -H 'Sec-Fetch-Mode: navigate' -H 'Sec-Fetch-Site: same-origin' -H 'Sec-Fetch-User: ?1'
