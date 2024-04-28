# SMART 2024 Template Repository

![Insalogo](./images/logo-insa_0.png)

Project [SMART(PLD)](riccardotommasini.com/teaching/smart) is provided by [INSA Lyon](https://www.insa-lyon.fr/).

Students: BONDYFALAT Julien, BOYER Thomas, FAYALA Mohamed, LECLUSE Martin, MOUYSSET Tao, ST-CYR Charles-François, VELOSA ROMERO Paula

### Abstract

Concerned by the miscellaneous use of social networks to spread false information, we aim to create the prototype of a news social network, in which the content proposals made by the algorithm will promote true information and dismiss false one.

## Description 

Our social network will implement a "trust design" on top a a classical content proposal algorithm only based on the likes. It will consist of a set of fonctionnalities (such as "I trust/don't trust this content", "I trust/don't trust this user") and user roles (s.a. <em>fact-checkers</em>), which will allow us to transform the order of the recommended contents for each user. The goal is of course to find a design that, by letting it run, will promote real information.

By doing this way, we avoid the necessity of looking into the contents of the posts, which would create lots of problems on an ethical level, and probably kill the trust of the user in our social network.

## Project Goal

The goal of our project is to build a fonctional prototype of our social network, and to show with simulations that our design is better than a algorithm based only on likes for the promotionof true information.
For that, we will use a dataset of newws, for which we know the true ones and the <em>fake news</em>, and custom indicators, in order to compare a scenario run on different implementations of the "trust design"

## Requirements

- Using Docker:

    - [Docker](https://www.docker.com/): To run the project in a containerized environment.
    
- Using local environment:

    - [Node.js](https://nodejs.org/): JavaScript runtime built on Chrome's V8 JavaScript engine.
    - [npm](https://www.npmjs.com/): Node package manager.
    - [MongoDB](https://www.mongodb.com/): NoSQL database.

## Installation and execution

- Using Docker:

    1. For each packages in the `packages` directory and each apps in the `apps` directory, follow the instructions in the README file.

    2. Start the project.

        ```bash
        docker-compose up

        # OR

        make # Will only attach to certain services
        ```

## Material

## Note for Students

* Clone the created repository offline;
* Add your name and surname into the Readme file and your teammates as collaborators
* Complete the field above after project is approved
* Make any changes to your repository according to the specific assignment;
* Ensure code reproducibility and instructions on how to replicate the results;
* Add an open-source license, e.g., Apache 2.0;
* README is automatically converted into pdf

