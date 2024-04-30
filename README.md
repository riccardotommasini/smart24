# Lancer oggm sur votre machine avec un venv (bash sous windows)

1. Dans vscode, ouvrez un terminal, passez sur bash
2. tapez ``code .`
3. lancer le venv dans le terminal si vous voulez lancer des scripts `source oggm_env/bin/activate`
4. si vous voulez utiliser des notebooks, ctrl maj P et cliquez sur `oggm_env`
    => POUR LE CREER
    - `python -m venv oggm_venv`
    - `source oggm_env/bin/activate`
    - `pip install numpy scipy pandas matplotlib shapely requests configobj netcdf4 xarray pytest seaborn oggm tables geopandas salem rasterio`
    Avec ça vous devriez avoir une configuration minimale pour lancer oggm

    SI CA NE MARCHE PAS alors faire `pip install -r requirements.txt --upgrade`


EXPLORATEUR DE FICHIERS
- Données OGGM stockées à \\wsl.localhost\Ubuntu\home\linab pour Lina
    - `cfg.CONFIG_FILE`
    - cd @
    - `xdg-open .`


# NOTEBOOKS NOTABLES
- `distribute_flowline.ipynb` : permet de générer une carte de l'épaisseur d'un glacier donné en fonction de prévisions d'augmentation de la température (VALEURS POSITIVES !!!)


# SMART 2024 Glaciers evolution

![Insalogo](./images/logo-insa_0.png)

Project [SMART(PLD)](riccardotommasini.com/teaching/smart) is provided by [INSA Lyon](https://www.insa-lyon.fr/).

Students: **Lina Borg, Léa Durand, Billy Villeroy et Kaiming Zhu**

### Abstract

## Description 

## Project Goal

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

