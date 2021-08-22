<?php
ini_set('session.gc_maxlifetime', 43200);
ini_set('max_execution_time', '1500'); // for infinite time of execution
session_start();
date_default_timezone_set('Asia/Kolkata');

defined("APP_NAME") ? null : define("APP_NAME", "File Manager");

//Host Constants
defined("DB_SERVER") ? null : define("DB_SERVER", "localhost");
defined("DB_USER") ? null : define("DB_USER", "root");
defined("DB_PASS") ? null : define("DB_PASS", "p@ssw0rd");
defined("DB_NAME") ? null : define("DB_NAME", "file_manager");

ob_start('ob_gzhandler');