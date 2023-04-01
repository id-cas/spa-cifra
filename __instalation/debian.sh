apt install curl php-cli php-mbstring git unzip
cd ~
curl -sS https://getcomposer.org/installer -o composer-setup.php
HASH=`curl -sS https://composer.github.io/installer.sig`
echo $HASH
php -r "if (hash_file('SHA384', 'composer-setup.php') === '$HASH') { echo 'Installer verified'; } else { echo 'Installer corrupt'; unlink('composer-setup.php'); } echo PHP_EOL;"
php composer-setup.php --install-dir=/usr/local/bin --filename=composer
composer -v

apt-get install php7.4-dev
pecl install mongodb-1.15.0


#Build process completed successfully
#Installing '/usr/lib/php/20190902/mongodb.so'
#install ok: channel://pecl.php.net/mongodb-1.15.0
#configuration option "php_ini" is not set to php.ini location
#You should add "extension=mongodb.so" to php.ini

service php7.4-fpm restart

composer require mongodb/mongodb
