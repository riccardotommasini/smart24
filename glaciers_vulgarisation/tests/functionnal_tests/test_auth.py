class TestAuth():
    def test_registration_post(
        self, client, valid_user
    ):
        response = client.post("/auth/registration", json={
            'username': valid_user.username, 'password': valid_user.password
        })

        assert response.status_code == 204

    def test_connexion_post(
        self, client, existing_user
    ):
        response = client.post("/auth/connexion", json={
            'username': existing_user.username, 'password': existing_user.password
        })

        assert response.status_code == 200

    def test_deconnexion_get(
        self, client
    ):
        response = client.get("/auth/deconnexion")

        assert response.status_code == 204

# Manque les tests si les headers ne sont pas complets
