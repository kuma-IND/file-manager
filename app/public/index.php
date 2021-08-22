<?php
require_once '../includes/config.php';
require_once '../includes/functions.php';
?>
<!DOCTYPE html>
<html lang='en'>
<head>
    <?php require_once '../includes/head.php'; ?>
    <?php require_once '../includes/css.php';
    getCSSVersion(["index"]);
    ?>
</head>
<body>
<div class="container-fluid" id="main_container">
</div>
<?php require_once '../includes/js.php';
getJSVersion(["index"]);
?>
</body>
</html>