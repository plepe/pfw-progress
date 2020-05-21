<?php include "conf.php"; /* load a local configuration */ ?>
<?php require "inc/db_init.php" ?>
<?php require "lib/modulekit/PDOext/PDOext.php" ?>
<?php require "src/pfwGetCurrent.php" ?>
<?php
db_init();

Header('Content-Type: text/plain; charset=utf8');

print pfwGetCurrent();
