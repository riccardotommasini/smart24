# SMART 2024 Template Repository

![Insalogo](./images/logo-insa_0.png)

Project [SMART(PLD)](riccardotommasini.com/teaching/smart) is provided by [INSA Lyon](https://www.insa-lyon.fr/).

Students: BENOIT Romain, CHONÉ Théo, CHORYNSKI Ewan, DELHON Florian, GAIGÉ Théo, HASAN TAWFIQ Amar, PEIGUE Alix

### Abstract

Les outils de collaborations sont aujourd'hui omniprésents surtout dans le
monde de la bureautique. Des outils comme Google Docs ou Office360 sont de plus
en plus utilisés pour permettre un meilleur travail d'équipe en temps réel.
Dans le milieu de la programmation, des outils similaires ce sont dévelopés 
afin de permettre de meilleurs session de "pair programming". On peut par exemple
VSCode Live Share. Cependant, les outils actuels sont rigides sur le nombre d'IDE
qu'ils supportent. C'est pourquoi notre projet vise à proposer un outil de collaboration
pour l'édition de fichiers textes qui permettrait à chacun d'utiliser l'outil avec
lequel il est le plus à l'aise.

## Description 

### Compatibilité avec plusieurs IDE

Ce projet s'inspire d'une grande avancée dans le domaine de l'autocomplétion dans les IDE : 
le *Language Server Protocol* (LSP). Il s'agit d'un protocol permettant à un éditeur de texte
de communiquer avec un programme externe nommé *Language Server* qui peut donner des
propositions d'autocomplétion. Un bon exemple de *Language Server* est *rust-analyzer* qui
permet l'autocomplétion en Rust. Ce seul programme maintenue par la fondation Rust peut 
être utilisé sur tous les éditeurs supportant le LSP. Ainsi chaque éditeur n'a pas
besoin d'implémenter l'analyse complexe du code que le compilateur fait déjà.

Le LSP permet d'avoir une seule implémentation pour tous les éditeurs. Nous nous inspirons
de ce constat pour proposer une idée similaire avec le partage de code : une seule implémentation
du protocol de syncronisation pour tous les IDE et un protocol qui permet à l'éditeur de communiquer
avec cette implémentation. Il faudra donc faire des plugins pour les différents IDE afin d'intéragir
avec ce programme central.

### Pas besoin de faire passer son code par des serveurs externes

Le protocol de syncronisation devra fonctionner de façon pair-à-pair entre l'hôte de la session
et les différents membres. Cependant, l'hôte agira tout de même comme l'authorité de la session
qui détient le véritable état des documents édités.

Un serveur de rendez vous sera surement tout de même nécessaire afin de passer à travers les 
potentiels NAT.

## Project Goal

- Proposer un protocol de syncronisation de projet
- Proposer un protocol permettant à un IDE de communiquer avec l'implémentation du protocol
  syncronisation.
- Implémenter un programme qui tourne en arrière plan pour implémenter le protocol de syncronisation
- Implémenter des plugins pour différents IDE afin de communiquer avec notre programme
  - Neovim
  - VSCode
  - Autre IDE à discuter

## Requirements

## Material

## Note for Students

* Clone the created repository offline;
* Add your name and surname into the Readme file and your teammates as collaborators
* Complete the field above after project is approved
* Make any changes to your repository according to the specific assignment;
* Ensure code reproducibility and instructions on how to replicate the results;
* Add an open-source license, e.g., Apache 2.0;
* README is automatically converted into pdf

