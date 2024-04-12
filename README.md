# Projet SmartShare

![Insalogo](./images/logo-insa_0.png)

Project [SMART(PLD)](riccardotommasini.com/teaching/smart) is provided by [INSA Lyon](https://www.insa-lyon.fr/).

Students: BENOIT Romain, CHONÉ Théo, CHORYNSKI Ewan, DELHON Florian, GAIGÉ Théo, HASAN TAWFIQ Amar, PEIGUE Alix

## Abstract

Les outils de collaboration sont aujourd'hui omniprésents surtout dans le monde de la bureautique. Des outils comme Google Docs ou Office360 sont de plus en plus utilisés pour permettre un meilleur travail d'équipe en temps réel. Dans le milieu de la programmation, des outils similaires se sont développés afin de permettre de meilleures sessions de "pair programming". On peut par exemple citer Live Share sur VSCode.

Cependant, ces outils sont actuellement spécifiques à un IDE, ce qui rend les utilisateurs dépendants et empêche la collaboration entre plusieurs environnements. De plus, les solutions existantes comme Live Share ne sont pas open source, et pourrait donc devenir payantes au gré de la volonté des entreprises qui les possèdent. C'est pourquoi notre projet vise à proposer un outil open source de collaboration pour l'édition de fichiers textes qui permettrait à chacun d'utiliser l'outil avec lequel il est le plus à l'aise.

## Description

### Interopérabilité

Ce projet s'inspire d'une grande avancée dans le domaine de l'autocomplétion dans les IDE : le *Language Server Protocol* (LSP). Il s'agit d'un protocole permettant à un éditeur de texte de communiquer avec un programme externe nommé *Language Server* qui peut donner des propositions d'autocomplétion. Un bon exemple de *Language Server* est *rust-analyzer* qui permet l'autocomplétion en Rust. Ce seul programme maintenu par la fondation Rust peut être utilisé sur tous les éditeurs supportant le LSP. Ainsi, chaque éditeur n'a pas besoin d'implémenter l'analyse complexe du code que le compilateur fait déjà.

Le LSP permet d'avoir une seule implémentation pour tous les éditeurs. Nous nous inspirons de ce constat pour proposer une idée similaire avec le partage de code : une seule implémentation du protocole de synchronisation pour tous les IDE et un protocole qui permet à l'éditeur de communiquer avec cette implémentation. Il faudra donc faire des plugins pour les différents IDE afin d'interagir avec ce programme central.

### Synchronisation

Un des gros enjeux du projet sera donc de gérer tous les cas possibles de synchronisation des fichiers. Que se passe-t-il si deux personnes écrivent en même temps sur la même ligne ? Comment savoir où appliquer une modification si un autre utilisateur a réordonné les lignes en même temps ? Comment rattraper l'évolution d'un fichier en cas de déconnexion momentanée ? Comment garantir que les fichiers ne divergent pas, ou a minima le vérifier sans les renvoyer dans leur totalité ?

### Pair à pair

Le protocole de synchronisation devra fonctionner de façon pair-à-pair entre l'hôte de la session et les différents utilisateurs. A priori, l'hôte agirait tout de même comme autorité de la session, détenant le véritable état des documents édités. Un serveur de rendez-vous sera potentiellement nécessaire afin de passer à travers d'éventuels NAT.

### Technologies

Le programme de synchronisation sera écrit en Rust pour plusieurs raisons :
- Par son système de typage, le langage permet d'éviter beaucoup de comportements indéfinis (nous obligeant à traiter tous les cas de désynchronisation).
- C'est un langage bas niveau, qui se prête bien aux opérations de traitement de flux de texte et de communication réseau.
- Les membres de notre groupe sont unanimement motivés pour utiliser ce langage.

Les extensions pour IDE seront dans les langages adéquats :
- JavaScript pour VSCode
- Lua pour Neovim

## Project Goal

- Proposer un protocole de synchronisation de projet
- Proposer un protocole de communication entre un IDE et le programme de synchronisation.
- Implémenter un programme qui tourne en arrière-plan pour implémenter le protocole de synchronisation
- Implémenter des plugins pour différents IDE afin de communiquer avec notre programme
  - Neovim
  - VSCode
  - Autre IDE à discuter
