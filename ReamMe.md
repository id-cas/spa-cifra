# SPA for visualization of catalog items with PHP backend API
### Stack:
* PHP7.4 (API)
* JavaScript (ES6+)
* HTML5
* Bootstrap 5.3

### Classes description of main site.js file

* Class App uses as main start point of the SPA.
  ```
    apiUrl: HTTP API gateway,
    btnPrevId: html button ID for "prev" button pagination functionality,
    btnNextId: html button ID for "next" button pagination functionality,
    tableId: html table body ID,
    preloaderId: html preloader overlap element ID,
    limitsId: html selector ID of on page show elements limit
  ```

* Class Api uses for communication with a remote server.
  Class contain requests caching control. Active caching control reduces server load,
  but may show user outdate data.
  
  ```
    url: API gateway URL
    cacheLifeTimeMs: requests caching time as ms (if not set or 0 - no cache) 
  ```
  
* Class Pagination controls a pagination block component.
  ```
    btnPrev: button DOM element
    btnNext: button DOM element
  ```

* Class Preloader controls a preloader overlay component.
  ```
    preloader: div DOM element with spinner
  ```

* Class Table controls a table body component with data presentation.
  ```
    table: table body DOM element
  ```

* Class Limits controls a dropdown list with count of items appearing in a table.
  ```
    dropdown: select DOM element
    limits: array of varians of items count showing in table per page
    onChange: callback function (fires when select DOM element would be init or change)
  ```
  
## Installation

Use files from __installation directory.

* Install Debian MongoDB
    ```
    sudo wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -`
    ```

* Install PHP packages 
    ```
    sudo apt install curl php-cli php-mbstring git unzip
    cd ~
    sudo curl -sS https://getcomposer.org/installer -o composer-setup.php
    sudo HASH=`curl -sS https://composer.github.io/installer.sig`
    sudo echo $HASH
    sudo php -r "if (hash_file('SHA384', 'composer-setup.php') === '$HASH') { echo 'Installer verified'; } else { echo 'Installer corrupt'; unlink('composer-setup.php'); } echo PHP_EOL;"
    sudo php composer-setup.php --install-dir=/usr/local/bin --filename=composer
    composer -v
    
    sudo apt-get install php7.4-dev
    sudo pecl install mongodb-1.15.0
    
    sudo service php7.4-fpm restart
    
    cd <project_dir>
    sudo composer require mongodb/mongodb
    ```
  
* Start MongoDB bash and paste data from /__installation/mongodb.txt file.
    ```
    mongosh
    ```

## DEMO
You can test functionality on site http://cifra.cvvrk.ru/ 
