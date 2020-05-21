<?php include "conf.php"; /* load a local configuration */ ?>
<?php require "inc/db_init.php" ?>
<?php require "lib/modulekit/PDOext/PDOext.php" ?>
<?php require "src/pfwGetCurrent.php" ?>
<?php
db_init();

$date = new DateTime();
$date->sub(new DateInterval('P1D'));
$date = $date->format('Y-m-d');

$count = pfwGetCurrent();

file_put_contents("progress.csv", "{$date},{$count}\n", FILE_APPEND);
