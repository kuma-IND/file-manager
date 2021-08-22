<?php

require_once '../includes/config.php';
$current_page = getCurrentPage();
$current_class = getCurrentClass();
$permuted_array = [];

function cleanProductName($pname) {
    $pname = preg_replace('`\[[^\]]*\]`', '', $pname);
    $pname = preg_replace('`\([^\]]*\)`', '', $pname);
    return $pname;
}

function embedLogoInQRCode($filepath) {
    $logopath = "../images/small/uvw_1.png";

    $QR = imagecreatefrompng($filepath);

// START TO DRAW THE IMAGE ON THE QR CODE
    $logo = imagecreatefromstring(file_get_contents($logopath));

    /**
     *  Fix for the transparent background
     */
    imagecolortransparent($logo, imagecolorallocatealpha($logo, 0, 0, 0, 127));
    imagealphablending($logo, false);
    imagesavealpha($logo, true);

    $QR_width = imagesx($QR);
    $QR_height = imagesy($QR);

    $logo_width = imagesx($logo);
    $logo_height = imagesy($logo);

// Scale logo to fit in the QR Code
    $logo_qr_width = $QR_width / 3;
    $scale = $logo_width / $logo_qr_width;
    $logo_qr_height = $logo_height / $scale;

    imagecopyresampled($QR, $logo, $QR_width / 3, $QR_height / 3, 0, 0, $logo_qr_width, $logo_qr_height, $logo_width, $logo_height);

// Save QR code again, but with logo on it
    imagepng($QR, $filepath);
}

function generateOTP($length = 4) {
    $characters = '0123456789';
    $charactersLength = strlen($characters);
    $randomString = '';
    for ($i = 0; $i < $length; $i++) {
        $randomString .= $characters[rand(0, $charactersLength - 1)];
    }
    return $randomString;
}

function getBasicValue($amount, $percentage) {
    if ($amount === "" || $amount == 0) {
        $amount = 0;
    }

    return round($amount / (1 + ($percentage / 100)), 2);
}

function truncateTO($value, $decimal_places) {
    return (float)number_format($value, $decimal_places, '.', '');
}

function getFormattedRefNo($ref_no) {
    $formatted_ref_no = "";

    if ($ref_no !== "") {
        $estimate_ref_no = explode(">", $ref_no);
        foreach ($estimate_ref_no as $i => $ref_no) {
            $estimate_ref_no[$i] = implode("", explode("<", $ref_no));
        }

        $formatted_ref_no .= implode(",", $estimate_ref_no);
    }

    return $formatted_ref_no;
}

function isAutoDarkModeSet($applicable = false) {
    $is_auto_dark_mode_set = false;

    $cookie_name = "user";

    if (isset($_SESSION[$cookie_name]) && isset($_SESSION["theme_user"])) {
//        $cookie_value = json_decode($_SESSION[$cookie_name], true);
        $cookie_value = $_SESSION[$cookie_name];

        $is_auto_dark_mode_set = intval($cookie_value[$_SESSION["theme_user"]]["is_auto_dark_mode_set"]) ? true : false;
    }

    //decide auto dark mode period


    $time_based_dark_mode = false;

    if ($is_auto_dark_mode_set) {
        if (isset($_SESSION[$cookie_name])) {
            $cookie_value = $_SESSION[$cookie_name];

            $cookie_value[$_SESSION["theme_user"]]['dark_start_time'] = str_replace("+", " ", $cookie_value[$_SESSION["theme_user"]]['dark_start_time']);
            $cookie_value[$_SESSION["theme_user"]]['dark_end_time'] = str_replace("+", " ", $cookie_value[$_SESSION["theme_user"]]['dark_end_time']);


            $current_time = strtotime(date('Y-m-d H:i:s'));
            $today_noon = strtotime(date('Y-m-d 23:59:59'));

            $start_date = new DateTime($cookie_value[$_SESSION["theme_user"]]['dark_start_time']);
            $end_date = new DateTime($cookie_value[$_SESSION["theme_user"]]['dark_end_time']);

            $start_time = strtotime(date("Y-m-d ") . $start_date->format('H:i:00'));
            $start_date = $start_date->format('Y-m-d');

            $end_time = strtotime(date("Y-m-d ") . $end_date->format('H:i:00'));
            $end_date = $end_date->format('Y-m-d');

            if ($start_time > $end_time) {
                $end_time = strtotime(date('Y-m-d H:i:00', strtotime("+1 day", $end_time)));
            }

//            echo date('Y-m-d H:i:s', $current_time) . "<br>";
//            echo date('Y-m-d H:i:s', $start_time) . "<br>";
//            echo date('Y-m-d H:i:s', $end_time) . "<br><br>";

//            echo ($start_time >= $current_time) ? "Curret > Start Time <===> " : "";
//
//            echo ($current_time <= $end_time) ? "End Time < Curret <===> " : "";

            $time_based_dark_mode = ($start_time <= $current_time && $end_time >= $current_time);
        }
    }


    if ($applicable) {
        return $time_based_dark_mode;
    } else {
        return $is_auto_dark_mode_set;
    }
}

function isManualDarkModeSet() {
    $is_manual_dark_mode_set = false;

//    if (isset($_GET['white'])) {
//        $is_manual_dark_mode_set = false;
//    } else {
//        $is_manual_dark_mode_set = isset($_GET['dark']);
//
//        if (!$is_manual_dark_mode_set) {
//            if (isset($_COOKIE["manual_dark_mode"])) {
//                $cookie_value = $_COOKIE["manual_dark_mode"];
//                if ($cookie_value === "dark") {
//                    $is_manual_dark_mode_set = true;
//                } else {
//                    $is_manual_dark_mode_set = false;
//                }
//            }
//        }
//    }
//
//    $manual_dark_mode_value = $is_manual_dark_mode_set ? "dark" : "white";
//
//    setcookie("manual_dark_mode", $manual_dark_mode_value, time() + (86400 * 30) * 365, "/"); // 86400 = 1 year

    $cookie_name = "user";

    if (isset($_SESSION[$cookie_name]) && isset($_SESSION["theme_user"])) {
//        $cookie_value = json_decode($_COOKIE[$cookie_name], true);
        $cookie_value = $_SESSION[$cookie_name];
        $is_manual_dark_mode_set = intval($cookie_value[$_SESSION["theme_user"]]["is_manual_dark_mode_set"]) ? true : false;
    }

    return $is_manual_dark_mode_set;
}

function isDarkModeEnabled() {

    $enable_dark_mode = false;

    $is_manual_dark_mode_set = isManualDarkModeSet();

    if (!$is_manual_dark_mode_set) {
        $time_based_dark_mode = isAutoDarkModeSet(true);

        if ($time_based_dark_mode) {
            $enable_dark_mode = true;
        }
    } else {
        $enable_dark_mode = true;
    }

    return $enable_dark_mode;
}

function createFolders($dir) {
    if (!file_exists($dir)) {
        mkdir($dir, 0777, true);
    }
}

function isLocationBasedDarkModeEnabled($latitude, $longitude) {
    $current_time = strtotime(date("Y-m-d H:i:s"));
    $sunset_time = strtotime(date_sunset(time(), SUNFUNCS_RET_STRING, $latitude, $longitude));
    $sunrise_time = strtotime(date_sunrise(time(), SUNFUNCS_RET_STRING, $latitude, $longitude));

    return !($current_time >= $sunrise_time && $current_time <= $sunset_time);
}

function pc_permute($items, $perms = []) {
//    $ignore_chars = ["[", "]", "{", "}", "(", ")"];
//
//    foreach ($perms AS $i => $t) {
//        foreach ($ignore_chars AS $ignore_char) {
//            $perms[$i] = str_replace($ignore_char, "", $perms[$i]);
//        }
//    }

    global $permuted_array;
    if (empty($items)) {
        $permuted_array[] = "%" . join('%%', $perms) . "%";
    } else {
        for ($i = count($items) - 1; $i >= 0; --$i) {
            $newitems = $items;
            $newperms = $perms;
            [$foo] = array_splice($newitems, $i, 1);
            array_unshift($newperms, $foo);
            pc_permute($newitems, $newperms);
        }
    }
}

function getCSSVersion($files, $type = "css", $id = "") {
    getAssetVersion($files, $type, $id);
}

function getJSVersion($files, $type = "js", $id = "") {
    getAssetVersion($files, $type, $id);
}

function getAssetVersion($files, $type = "css", $id = "") {
    $manifestPath = "../../assets/rev/manifest-{$type}.json";
    if (!file_exists($manifestPath)) {
        echo "File not found : {$manifestPath}";
    }
    $paths = json_decode(file_get_contents($manifestPath), true);
    foreach ($files as $filename) {
        $filename = $type . "/" . $filename . "." . $type;
        if (!isset($paths[$filename])) {
            echo "File not found : {$filename}";
            echo "<script>alert('File not found : {$filename}')</script>";
        } else {
            if ($id !== "") {
                $id = " id='{$id}' ";
            }
            switch ($type) {
                case "css":
                    echo "<link {$id} href='../{$paths[$filename]}' rel='stylesheet'/>";
                    break;
                case "js":
                    echo "<script {$id} src='../{$paths[$filename]}'></script>";
                    break;
                case "text":
                    echo $paths[$filename];
                    break;
                default:
                    echo "No path found";
                    break;
            }
        }
    }
}

function getAssetVersionFile($files, $type = "css", $id = "") {
    $manifestPath = "../../assets/rev/manifest-{$type}.json";
    if (!file_exists($manifestPath)) {
        return false;
    }
    $paths = json_decode(file_get_contents($manifestPath), true);
    foreach ($files as $filename) {
        $filename = $type . "/" . $filename . "." . $type;
        if (!isset($paths[$filename])) {
            return false;
        } else {
            if ($id !== "") {
                $id = " id='{$id}' ";
            }
            switch ($type) {
                case "css":
                    return $paths[$filename];
                    break;
                case "js":
                    return $paths[$filename];
                    break;
                case "text":
                    return $paths[$filename];
                    break;
                default:
                    return false;
                    break;
            }
        }
    }
}

function getESTRTDProductQuery($table, $id) {
    $parent_table_name = "";
    $product_table_name = "";

    switch ($table) {
        case "estimate":
            $parent_table_name = "estimate_master";
            $product_table_name = "estimate_details";
            break;
        default:
            $parent_table_name = "{$table}_master";
            $product_table_name = "{$table}_products";
            break;
    }

    $query = "SELECT " .
        "product.name AS product_name, " .
        "COALESCE(producttype_sub.hsn_code,'') AS hsn_code, " .
        "product.sgst AS sgst, " .
        "product.cgst AS cgst, " .
        "product.igst AS igst, " .
        "COALESCE(products.length,'') AS length, " .
        "COALESCE(products.breadth,'') AS breadth, " .
        "products.quantity AS quantity, " .
        "products.rate AS rate, " .
        "COALESCE(product_group_size.length,'') AS product_group_size_length, " .
        "COALESCE(product_group_size.breadth,'') AS product_group_size_breadth, " .
        "COALESCE(product_group.group_no,'') AS group_no, " .
//        "COALESCE(product_group.group_prefix,'') AS product_group_prefix, " .
//        "COALESCE(product_group.group_before,'') AS product_group_before, " .
//        "COALESCE(product_group.group_after,'') AS product_group_after, " .
        "COALESCE(product.veneer_series,'') AS veneer_series, " .
        "producttype_super.id AS producttype_super_id, " .
        "producttype_super.name AS producttype_super_name, " .
        "products.product_id AS product_id, " .
        "products.id AS products_id " .
        "FROM " .
        "{$product_table_name} AS products " .
        "INNER JOIN " .
        "{$parent_table_name} AS main " .
        "ON " .
        "products.{$table}_id = main.id AND " .
        "products.active = 1 AND " .
        "main.active = 1 AND " .
        "main.id = {$id} " .
        "INNER JOIN " .
        "product_master product " .
        "ON " .
        "products.product_id = product.id " .
        "INNER JOIN " .
        "producttype_sub_master producttype_sub " .
        "ON " .
        "producttype_sub.id = product.producttype_sub_id " .
        "INNER JOIN " .
        "producttype_super_master producttype_super " .
        "ON " .
        "producttype_super.id = producttype_sub.producttype_super_id " .
        "LEFT JOIN " .
        "product_group_size_master product_group_size " .
        "ON " .
        "products.product_group_size_id = product_group_size.id " .
        "LEFT JOIN " .
        "product_group_master product_group " .
        "ON " .
        "product_group_size.product_group_id = product_group.id " .
        "ORDER BY " .
        "main.id ";
    return $query;
}

function getEstimateExtraJoins($alias_name = "estimate") {
    $query = "LEFT JOIN " .
        " (" .
        "SELECT " .
        "GROUP_CONCAT(branch.name,',') AS branch_names, " .
        "estimate_id FROM estimate_branch_master " .
        "INNER JOIN " .
        "branch_master branch " .
        "ON " .
        "estimate_branch_master.branch_id = branch.id " .
        "GROUP BY " .
        "estimate_id " .
        ")branches " .
        "ON {$alias_name}.id = branches.estimate_id " .
        "LEFT JOIN " .
        "customer_balance_payment_master " .
        "ON " .
        "{$alias_name}.balance_payment_id = customer_balance_payment_master.balance_payment_id AND " .
        "{$alias_name}.customer_id = customer_balance_payment_master.customer_id ";

    return $query;
}

function getReadyCondition($alias = "gatepass", $negate = false, $cancelled = false) {
    $operator = $negate ? "" : "NOT";

    $query = "SELECT " .
        "FLOOR(AVG(gatepass_master.id)) AS id " .
//            "SUM(CASE WHEN original = 1 THEN 1 ELSE 0 END) AS original_qty, " .
//            "SUM(CASE WHEN original = 0 AND gatepass_products.is_ready = 1 THEN 1 ELSE 0 END) AS ready_qty " .
        "FROM " .
        "gatepass_master " .
        "INNER JOIN " .
        "gatepass_products " .
        "ON " .
        "gatepass_master.id = gatepass_products.gatepass_id " .
        "WHERE " .
        "gatepass_master.active = 1 AND " .
        "gatepass_products.active = 1 AND " .
        "gatepass_products.estimate_details_id IS NOT NULL " .
        "GROUP BY " .
        "gatepass_master.id, " .
        "gatepass_products.estimate_details_id " .
        "HAVING " .
        "SUM(CASE WHEN original = 1 THEN quantity ELSE 0 END) != " .
        "SUM(CASE WHEN original = 0 AND gatepass_products.is_ready = 1 THEN quantity ELSE 0 END)";

    $query = " AND {$alias}.id {$operator} IN({$query}) ";

    if ($cancelled) {
        $query = "";
    }

    $cancelled = $cancelled ? 1 : 0;

    $query .= " AND {$alias}.is_order_cancelled = {$cancelled} ";

    return $query;
}

function getNewBlockedOrderCondition($alias_name, $type) {
    $condition = "";

    switch ($type) {
        case "estimate":
            $condition = " {$alias_name}.active = 1 AND {$alias_name}.all_conditions_met = 0 ";
            break;
        case "confirmed":
            $condition = " {$alias_name}.active = 1 AND {$alias_name}.all_conditions_met = 1 ";
            break;
        case "pending":
            $condition = " {$alias_name}.active = 1 AND {$alias_name}.pending_needs_approval = 1 ";
            break;
        case "fulfilled":
            $condition = " {$alias_name}.active = 1 AND {$alias_name}.is_fulfilled = 1 ";
            break;
        case "any_order":
            $condition = " {$alias_name}.active = 1 AND ({$alias_name}.is_fulfilled = 1 OR {$alias_name}.all_conditions_met = 1)";
            break;
    }

    return $condition;
}

function getBlockedOrderCondition($alias_name = "estimate", $negate = false, $pending = false, $fulfilled = false) {

//    $condition = " {$alias_name}.id NOT IN (" .
//        "SELECT " .
//        "FLOOR(AVG(estimate_id)) AS id " .
//        "FROM " .
//        "estimate_master estimate " .
//        "INNER JOIN " .
//        "estimate_details details " .
//        "ON " .
//        "estimate.id = details.estimate_id AND " .
//        "estimate.is_fulfilled = 0 AND " .
//        "estimate.order_confirmed = 1 " .
//        "INNER JOIN " .
//        "product_master product " .
//        "ON " .
//        "details.product_id = product.id AND " .
//        "ignore_stock = 0 AND " .
//        "details.active = 1 AND " .
//        "details.product_group_size_id IS NOT NULL " .
//        "INNER JOIN " .
//        "godown_location_stack_master stack " .
//        "ON " .
//        "stack.product_id = details.product_id AND " .
//        "stack.product_group_size_id = details.product_group_size_id " .
//        "GROUP BY " .
//        "details.product_group_size_id " .
//        "HAVING SUM(stack.quantity) <=0 " .
//        ") AND ";

    $pending_search = $pending ? "" : "NOT";
    $pending_operator = $pending ? "OR" : "AND";

    $condition = "";
    $condition .= "( ";

    $condition .= "{$alias_name}.id {$pending_search} IN (" .
        "SELECT " .
        "estimate_id " .
        "FROM " .
        "estimate_discount discount " .
        "INNER JOIN " .
        "estimate_master estimate1 " .
        "ON " .
        "estimate1.id = discount.estimate_id AND " .
        "discount.active = 1 " .
        "INNER JOIN " .
        "customer_discount_master customer_discount ON " .
        "customer_discount.producttype_super_id = discount.producttype_super_id AND " .
        "customer_discount.customer_id = estimate1.customer_id AND " .
        "(customer_discount.discount NOT LIKE discount.discount_slabs AND estimate1.is_discount_approved = 0) AND " .
        "estimate1.confirmed_date > '" . CONFIRM_START_DATE . "' AND " .
        "estimate1.confirmed_date IS NOT NULL AND " .
        "customer_discount.active = 1 " .
        ")  ";

    $condition .= $pending_operator . " ";

    if ($pending) {
        $condition .= "({$alias_name}.balance > 0 AND customer_balance_payment_master.customer_id IS NULL AND {$alias_name}.is_balance_payment_approved = 0) ";
    } else {
        $condition .= "( " .
            "({$alias_name}.balance > 0 AND customer_balance_payment_master.customer_id IS NOT NULL OR {$alias_name}.is_balance_payment_approved = 1 ) " .
            " OR " .
            "({$alias_name}.balance <= 0) " .
            ") ";
    }

    $condition .= ") AND ";

    $condition .= "  {$alias_name}.confirmed_date IS NOT NULL AND " .
        "{$alias_name}.order_confirmed = 1 AND " .
        "{$alias_name}.wo_group_count = 0 AND " .
        "{$alias_name}.sales_person_id IS NOT NULL AND " .
        "{$alias_name}.customer_id IS NOT NULL AND " .
        "({$alias_name}.architect_id IS NOT NULL OR ({$alias_name}.no_architect IS NOT NULL OR {$alias_name}.unknown_architect IS NOT NULL)) AND " .
        "({$alias_name}.carpenter_id IS NOT NULL OR ({$alias_name}.no_carpenter IS NOT NULL OR {$alias_name}.unknown_carpenter IS NOT NULL)) AND " .
        "({$alias_name}.balance <= 0 OR " .
        "({$alias_name}.balance > 0 && " .
        "{$alias_name}.balance_payment_id IS NOT NULL ";

    $condition .= ")" .
        ") AND {$alias_name}.id IN (SELECT estimate_id FROM estimate_branch_master WHERE active = 1) " .
        " AND {$alias_name}.confirmed_date > '" . CONFIRM_START_DATE . "'";

    if ($fulfilled === true) {
        $condition .= " AND {$alias_name}.is_fulfilled = 1 ";
    } else {
        if ($fulfilled === false) {
            $condition .= " AND {$alias_name}.is_fulfilled = 0 ";
        } else {
            if ($fulfilled === "any") {
                $condition .= " AND ({$alias_name}.is_fulfilled = 0 OR {$alias_name}.is_fulfilled = 1 )";
            }
        }
    }

    if ($negate) {
        $condition = " NOT ({$condition}) ";
    } else {
//        $condition .= " AND LENGTH(branches.branch_names) > 0 ";
    }

    $condition .= " AND {$alias_name}.active = 1 ";

    return $condition;
}

function setPermissionArray($operations, $page) {
    $permissions = [];
    foreach ($operations as $name => $operation) {
        if (in_array($operation, $_SESSION['permitted_operation'][$page])) {
            $permissions[$name] = true;
        } else {
            $permissions[$name] = false;
        }
    }
    return $permissions;
}

function printArray($array) {
    echo "<pre>";
    print_r($array);
    echo "</pre>";
}

function isAuthorized() {
    global $current_page;
    if ($current_page !== "forbidden.php") {
        checkEstimatePermissions();

        if (isset($_SESSION['permitted_operation'])) {
            $is_view_permission_allowed = in_array("view", $_SESSION['permitted_operation'][$current_page]);

            switch ($current_page) {
                case "new_estimate.php":
                    $sales_return_permitted = ($_GET['estimate_operation'] === "sales_return") && in_array("srt", $_SESSION['permitted_operation']["outward.php"]);

                    $return_estimate_permitted = ($_GET['estimate_operation'] === "return_estimate") && in_array("r_est", $_SESSION['permitted_operation']["outward.php"]);

                    $is_view_permission_allowed = $sales_return_permitted ? $sales_return_permitted : $is_view_permission_allowed;

                    $is_view_permission_allowed = $return_estimate_permitted ? $return_estimate_permitted : $is_view_permission_allowed;

                    if (!$is_view_permission_allowed) {
                        header("location:../error_pages/forbidden.php");
                        exit;
                    }
                    break;
                default:
                    if (!$is_view_permission_allowed) {
                        header("location:../error_pages/forbidden.php");
                        exit;
                    }
                    break;
            }
        } else {
            header("location:../error_pages/forbidden.php");
            exit;
        }
    }
}

function checkEstimatePermissions() {
    if (isset($_SESSION['permitted_operation']["estimate.php"])) {
        $_SESSION['permitted_operation']["new_estimate.php"] = [];

        if (in_array("view", $_SESSION['permitted_operation']["estimate.php"])) {
            $_SESSION['permitted_operation']["new_estimate.php"][] = "view";
        }

        if (in_array("add", $_SESSION['permitted_operation']["estimate.php"])) {
            $_SESSION['permitted_operation']["new_estimate.php"][] = "add";
        }

        if (in_array("edit", $_SESSION['permitted_operation']["estimate.php"])) {
            $_SESSION['permitted_operation']["new_estimate.php"][] = "edit";
        }

        if (in_array("delete", $_SESSION['permitted_operation']["estimate.php"])) {
            $_SESSION['permitted_operation']["new_estimate.php"][] = "delete";
        }

        if (in_array("print", $_SESSION['permitted_operation']["estimate.php"])) {
            $_SESSION['permitted_operation']["new_estimate.php"][] = "print";
        }

        if (in_array("excel", $_SESSION['permitted_operation']["estimate.php"])) {
            $_SESSION['permitted_operation']["new_estimate.php"][] = "excel";
        }

        if (in_array("pdf", $_SESSION['permitted_operation']["estimate.php"])) {
            $_SESSION['permitted_operation']["new_estimate.php"][] = "pdf";
        }
    }
}

function br2nl($string) {
    return preg_replace("/\r\n|\n|\r/", "", $string);
}

function removeBold($text) {
    $formatting = "/\*(\S(.*?\S)?)\*/i";
    $text = preg_replace($formatting, "$1", $text);
    return $text;
}

function removeItalic($text) {
    $formatting = "/\_(\S(.*?\S)?)\_/i";
    $text = preg_replace($formatting, "$1", $text);
    return $text;
}

function removeUnderline($text) {
    $formatting = "/\~(\S(.*?\S)?)\~/i";
    $text = preg_replace($formatting, "$1", $text);
    return $text;
}

function checkFormatting($text) {
    $formatting = "";

    if ($text !== removeBold($text)) {
        $text = removeBold($text);
        $formatting .= "B";
    }

    if ($text !== removeItalic($text)) {
        $text = removeItalic($text);
        $formatting .= "I";
    }

    if ($text !== removeUnderline($text)) {
        $text = removeUnderline($text);
        $formatting .= "U";
    }

    return [
        "formatting" => $formatting,
        "text"       => $text,
    ];
}

function getSmallName($file_name) {
    $new_file_name = explode(".", $file_name);
    $name = "";
    for ($i = 0; $i < count($new_file_name) - 1; $i++) {
        $name .= $new_file_name[$i];
    }

    $new_file_name = $name . "_200." . $new_file_name[count($new_file_name) - 1];
    return $new_file_name;
}

function resizeImage($target_filename, $image, $maxDimW = 800, $maxDimH = 800) {
    [$width, $height, $type, $attr] = getimagesize($image); //$_FILES[$filename]['tmp_name']
    if ($width > $maxDimW || $height > $maxDimH) {
        $size = getimagesize($image);
        $ratio = $size[0] / $size[1]; // width/height
        if ($ratio > 1) {
            $width = $maxDimW;
            $height = $maxDimH / $ratio;
        } else {
            $width = $maxDimW * $ratio;
            $height = $maxDimH;
        }
        $src = imagecreatefromstring(file_get_contents($image));
        $dst = imagecreatetruecolor($width, $height);
        imagecopyresampled($dst, $src, 0, 0, 0, 0, $width, $height, $size[0], $size[1]);
        imagejpeg($dst, $target_filename); // adjust format as needed
    }
}

function renameExistingFile($path, $filename) {
    if ($_FILES[$filename]['name'] !== "") {
        $name = $_FILES[$filename]['name'];
        $actual_name = pathinfo($name, PATHINFO_FILENAME);
        $extension = pathinfo($name, PATHINFO_EXTENSION);

        $i = 1;
        while (file_exists($path . "/" . $actual_name . "." . $extension)) {
            $actual_name = (string)$actual_name . $i;
            $name = $actual_name . "." . $extension;
            $i++;
        }
        return $name;
    } else {
        return false;
    }
}

function displayMessages() {
    if (isset($_SESSION['messagebag'])) {
        echo "<script>";
        foreach ($_SESSION['messagebag'] as $message) {
            $message = setMessage($message['message'], $message['type']);
            echo " var json_ob = JSON.parse('" . json_encode($message) . "');";
            echo " showAlert(json_ob);";
        }
        echo "</script>";
        unset($_SESSION['messagebag']);
    }
}

function getCurrentPage() {
    $current_page = explode('/', $_SERVER['PHP_SELF']);
    $current_page = $current_page[count($current_page) - 1];
    return $current_page;
}

function getCurrentClass() {
    $current_class = explode('/', $_SERVER['PHP_SELF']);
    $current_class = $current_class[count($current_class) - 1];

    $current_class = explode('.', $current_class);
    $current_class = $current_class[0];

    return $current_class;
}

function printSearch() {
    echo "<div class='input-group'>" .
        "<input type='text' class='form-control' placeholder='Search'>" .
        "<div class='input-group-btn'>" .
        "<button class='btn btn-default' type='submit'>" .
        "<i class='glyphicon glyphicon-search'>" .
        "</i>" .
        "</button>" .
        "</div>" .
        "</div>";
}

function checkLogin() {
    isAuthorized();
    if (!isset($_SESSION['uid'])) {
        header("location:../public/index.php");
        exit;
    }
}

function getExcelIndex($index_name) {
    $index_name = str_split(strtoupper($index_name));
    $index_name = array_reverse($index_name);

    $final_index = 0;
    foreach ($index_name as $i => $index) {
        $final_index += ($i * 26) + ord($index) - 65;
    }

    return $final_index;
}

function setMessage($message, $type = "success") {
    return [
        "type"    => $type,
        "message" => $message,
    ];
}

function returnEmptyIfZero($value) {
    if ($value === "") {
        return $value;
    } else {
        return intval($value) === 0 ? "" : $value;
    }
}

function setError($message, $type = "danger") {
    return [
        "type"    => $type,
        "message" => $message,
    ];
}

function setAccessError() {
    return setError("Insufficient Privileges");
}

function setWarning($message, $type = "warning") {
    return [
        "type"    => $type,
        "message" => $message,
    ];
}

function logAction($type, $action = false, $message = "") {
    if ($action) {
        $logpath = $_SERVER['DOCUMENT_ROOT'] . '/../logs/';
        $logfile = $type . ".txt";

        if (!file_exists($logpath)) {
            mkdir($logpath, 0777, true);
        }

        $new = file_exists($logpath . $logfile) ? false : true;

        if ($new) {
            $myfile = fopen($logpath . $logfile, "w", 0777);
            fclose($myfile);
        }
        if ($handle = fopen($logpath . $logfile, 'a')) { // append
            $timestamp = strftime("%Y-%m-%d %H:%M:%S", time());
            if ($message !== "") {
                $message = " : {$message}";
            }
            $content = "{$timestamp} | {$action}{$message}\n";
            fwrite($handle, $content);
            fclose($handle);
        } else {
            echo "Could not open log file for writing.";
        }
    }
}

function generateRandomString($length = 100, $digit = true, $upper = true, $lower = true) {
    $characters = "";

    if ($digit) {
        $characters .= '0123456789';
    }

    if ($upper) {
        $characters .= 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    }

    if ($lower) {
        $characters .= 'abcdefghijklmnopqrstuvwxyz';
    }

    $charactersLength = strlen($characters);
    $randomString = '';
    for ($i = 0; $i < $length; $i++) {
        $randomString .= $characters[rand(0, $charactersLength - 1)];
    }
    return $randomString;
}

function removeOtherPageSessions() {
    global $current_page;

    if ($current_page !== "product.php" && $current_page !== "veneer_product.php") {
        if (isset($_SESSION["p_type"])) {
//            unset($_SESSION["p_type"]);
        }
    }

    if (isset($_SESSION["sessions"]) && !isset($_POST['preserve'])) {
        foreach ($_SESSION["sessions"] as $page => $session) {
            if ($page !== $current_page) {
                if ($page !== "product.php") {
                    if (isset($_SESSION["p_type"])) {
//                        unset($_SESSION["p_type"]);
                    }
                }
//                unset($_SESSION["sessions"][$page]);
            }
            if ($page === "product.php") {
                if (isset($_GET['p_type']) && isset($_SESSION['p_type'])) {
                    if ($_GET['p_type'] !== $_SESSION['p_type']) {
                        $_SESSION['p_type'] = $_GET['p_type'];
//                        unset($_SESSION["sessions"][$page]);
                    }
                }
            }
        }
    }
}

function rangeWeek($datestr) {
    date_default_timezone_set(date_default_timezone_get());
    $dt = strtotime($datestr);
    $res['start'] = date('N', $dt) == 1 ? date('Y-m-d', $dt) : date('Y-m-d', strtotime('last monday', $dt));
    $res['end'] = date('N', $dt) == 7 ? date('Y-m-d', $dt) : date('Y-m-d', strtotime('next sunday', $dt));
    return $res;
}

function rangeMonth($datestr) {
    date_default_timezone_set(date_default_timezone_get());
    $dt = strtotime($datestr);
    $res['start'] = date('Y-m-d', strtotime('first day of this month', $dt));
    $res['end'] = date('Y-m-d', strtotime('last day of this month', $dt));
    return $res;
}

function rangeYear() {
    date_default_timezone_set(date_default_timezone_get());
    $res['start'] = date('Y-m-d', strtotime(date('Y-01-01')));
    $res['end'] = date('Y-m-d', strtotime('Dec 31'));
    return $res;
}

function uploadFile($file_name) {
    if ($_SERVER['REQUEST_METHOD'] == 'POST') {
        $name = $_FILES[$file_name]['name'];
        $tmp_name = $_FILES[$file_name]['tmp_name'];
        $path = '../images/products/';
        if (!empty($name)) {
            move_uploaded_file($tmp_name, $path . $name);
            return true;
        } else {
            return false;
        }
    }
}

function getFiles($path, $with_folder = false, $deep_search = false) {
    $files = [];

    if (file_exists($path)) {
        $dh = opendir($path);
        while (false !== ($filename = readdir($dh))) {
            if ($filename != "." && $filename != "..") {
                if (is_dir("{$path}/{$filename}")) {
                    if ($deep_search) {
                        $files = array_merge($files, getFiles("{$path}/{$filename}", $with_folder));
                    }
                } else {
                    if ($with_folder) {
                        $files[] = "{$path}/{$filename}";
                    } else {
                        $files[] = $filename;
                    }
                }
            }
        }
    }

    return $files;
}

function getDirContents($dir, &$results = []) {
    $files = scandir($dir);

    foreach ($files as $key => $value) {
        $path = realpath($dir . DIRECTORY_SEPARATOR . $value);
        if (!is_dir($path)) {
            $results[] = $path;
        } else {
            if ($value != "." && $value != "..") {
                getDirContents($path, $results);
                $results[] = $path;
            }
        }
    }

    return $results;
}

if (isset($_POST["operation"])) {
    if ($_POST["operation"] === "logout") {
        $message = setMessage("successfully logged out");
        logout();
        $_SESSION["messagebag"][] = $message;
        echo json_encode($message);
    }
}

function getClientIP1() {
    $ipaddress = '';
    if (isset($_SERVER['HTTP_CLIENT_IP'])) {
        $ipaddress = $_SERVER['HTTP_CLIENT_IP'];
    } else {
        if (isset($_SERVER['HTTP_X_FORWARDED_FOR'])) {
            $ipaddress = $_SERVER['HTTP_X_FORWARDED_FOR'];
        } else {
            if (isset($_SERVER['HTTP_X_FORWARDED'])) {
                $ipaddress = $_SERVER['HTTP_X_FORWARDED'];
            } else {
                if (isset($_SERVER['HTTP_FORWARDED_FOR'])) {
                    $ipaddress = $_SERVER['HTTP_FORWARDED_FOR'];
                } else {
                    if (isset($_SERVER['HTTP_FORWARDED'])) {
                        $ipaddress = $_SERVER['HTTP_FORWARDED'];
                    } else {
                        if (isset($_SERVER['REMOTE_ADDR'])) {
                            $ipaddress = $_SERVER['REMOTE_ADDR'];
                        } else {
                            $ipaddress = 'UNKNOWN';
                        }
                    }
                }
            }
        }
    }
    return $ipaddress;
}

function checkPermission($operation, $permission_array) {
    if ($permission_array !== null) {
        if (!is_array($permission_array)) {
            $permission_array = $_SESSION["permitted_operation"]["{$permission_array}.php"];
        }
        return in_array($operation, $permission_array);
    } else {
        return false;
    }
}

function makeAssociativeArrayFun($array, $key) {
//    echo $key."<br>";
//    printArray($array);
    $new_array = [];
    foreach ($array as $data) {
        if (isset($data[$key])) {
            $new_array[$data[$key]] = $data;
        }
    }
    return $new_array;
}

function makeAssociativeArrayFun1($array, $key) {
//    echo $key."<br>";
//    printArray($array);
    $new_array = [];
    foreach ($array as $data) {
        if (isset($data[$key])) {

            if (!isset($new_array[$data[$key]])) {
                $new_array[$data[$key]] = [];
            }

            $new_array[$data[$key]][] = $data;
        }
    }
    return $new_array;
}

function moneyFormatIndia($num) {
    $explrestunits = "";
    if (strlen($num) > 3) {
        $lastthree = substr($num, strlen($num) - 3, strlen($num));
        $restunits = substr($num, 0, strlen($num) - 3); // extracts the last three digits
        $restunits = (strlen($restunits) % 2 == 1) ? "0" . $restunits : $restunits; // explodes the remaining digits in 2's formats, adds a zero in the beginning to maintain the 2's grouping.
        $expunit = str_split($restunits, 2);
        for ($i = 0; $i < sizeof($expunit); $i++) {
            // creates each of the 2's group and adds a comma to the end
            if ($i == 0) {
                $explrestunits .= (int)$expunit[$i] . ","; // if is first value , convert into integer
            } else {
                $explrestunits .= $expunit[$i] . ",";
            }
        }
        $thecash = $explrestunits . $lastthree;
    } else {
        $thecash = $num;
    }
    return $thecash; // writes the final format where $currency is the currency symbol.
}

function isGPPrintAllowed($object, $type) {
    if (
        checkPermission("print_godown", $_SESSION['permitted_operation']["{$type}.php"]) ||
        checkPermission("print_office", $_SESSION['permitted_operation']["{$type}.php"])
    ) {
        return true;
    } else {
        return false;
    }
}

function rgbToHsl($r, $g, $b) {
    $oldR = $r;
    $oldG = $g;
    $oldB = $b;
    $r /= 255;
    $g /= 255;
    $b /= 255;
    $max = max($r, $g, $b);
    $min = min($r, $g, $b);
    $h;
    $s;
    $l = ($max + $min) / 2;
    $d = $max - $min;
    if ($d == 0) {
        $h = $s = 0; // achromatic
    } else {
        $s = $d / (1 - abs(2 * $l - 1));
        switch ($max) {
            case $r:
                $h = 60 * fmod((($g - $b) / $d), 6);
                if ($b > $g) {
                    $h += 360;
                }
                break;
            case $g:
                $h = 60 * (($b - $r) / $d + 2);
                break;
            case $b:
                $h = 60 * (($r - $g) / $d + 4);
                break;
        }
    }
    return [round($h, 2), round($s, 2), round($l, 2)];
}

function hslToRgb($h, $s, $l) {
    $r;
    $g;
    $b;
    $c = (1 - abs(2 * $l - 1)) * $s;
    $x = $c * (1 - abs(fmod(($h / 60), 2) - 1));
    $m = $l - ($c / 2);
    if ($h < 60) {
        $r = $c;
        $g = $x;
        $b = 0;
    } else {
        if ($h < 120) {
            $r = $x;
            $g = $c;
            $b = 0;
        } else {
            if ($h < 180) {
                $r = 0;
                $g = $c;
                $b = $x;
            } else {
                if ($h < 240) {
                    $r = 0;
                    $g = $x;
                    $b = $c;
                } else {
                    if ($h < 300) {
                        $r = $x;
                        $g = 0;
                        $b = $c;
                    } else {
                        $r = $c;
                        $g = 0;
                        $b = $x;
                    }
                }
            }
        }
    }
    $r = ($r + $m) * 255;
    $g = ($g + $m) * 255;
    $b = ($b + $m) * 255;
    return [floor($r), floor($g), floor($b)];
}

//pc_permute(explode(' ', 'she sells seashells'));
//
//printArray($permuted_array);

function getCleanedOperation($operation) {
    $operation = strtolower($operation);
    $operation = explode("_", $operation);

    for ($i = 1; $i < count($operation); $i++) {
        $operation[$i] = ucwords($operation[$i]);
    }

    return implode("", $operation);
}

function getHexColor($color) {
    $hex_color = "#";
    for ($j = 0; $j < 3; $j++) {
        $hex = dechex($color[$j]);
        if (strlen($hex) < 2) {
            $hex = "0{$hex}";
        }
        $hex_color .= $hex;
    }

    return $hex_color;
}

function colorInverse($hexColor) {
    // hexColor RGB
    $R1 = hexdec(substr($hexColor, 1, 2));
    $G1 = hexdec(substr($hexColor, 3, 2));
    $B1 = hexdec(substr($hexColor, 5, 2));

    // Black RGB
    $blackColor = "#000000";
    $R2BlackColor = hexdec(substr($blackColor, 1, 2));
    $G2BlackColor = hexdec(substr($blackColor, 3, 2));
    $B2BlackColor = hexdec(substr($blackColor, 5, 2));

    // Calc contrast ratio
    $L1 = 0.2126 * pow($R1 / 255, 2.2) +
        0.7152 * pow($G1 / 255, 2.2) +
        0.0722 * pow($B1 / 255, 2.2);

    $L2 = 0.2126 * pow($R2BlackColor / 255, 2.2) +
        0.7152 * pow($G2BlackColor / 255, 2.2) +
        0.0722 * pow($B2BlackColor / 255, 2.2);

    $contrastRatio = 0;
    if ($L1 > $L2) {
        $contrastRatio = (int)(($L1 + 0.05) / ($L2 + 0.05));
    } else {
        $contrastRatio = (int)(($L2 + 0.05) / ($L1 + 0.05));
    }

    // If contrast is more than 5, return black color
    if ($contrastRatio > 5) {
        return '#000000';
    } else {
        // if not, return white color.
        return '#FFFFFF';
    }
}

function sendSMS($message, $mobile) { //$route 106=OTP, 1=Promotional, 4=Transactional
    $sender = "UROVEN";
    $message = urlencode($message);

    $authkey = "85321A8LDlt5tako555f2398";

    $curl = curl_init();
    $route = 1;

    $url = "";

    switch ($route) {
        case 1:
        case 4:
            $url .= "http://api.msg91.com/api/sendhttp.php?";
            $url .= "route={$route}&";
            $url .= "country=91&";
            $url .= "mobiles={$mobile}&";
            break;
//        case 106:
//            $url .= "https://control.msg91.com/api/sendotp.php?";
//            $url .= "mobile=91{$mobile}&";
//            $url .= "otp={$this->otp}&";
//            break;
    }

    $url .= "sender={$sender}&";
    $url .= "authkey={$authkey}&";
    $url .= "message={$message}";

    curl_setopt_array($curl, [
        CURLOPT_URL            => $url,
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_ENCODING       => "",
        CURLOPT_MAXREDIRS      => 10,
        CURLOPT_TIMEOUT        => 1,
        CURLOPT_HTTP_VERSION   => CURL_HTTP_VERSION_1_1,
        CURLOPT_CUSTOMREQUEST  => "GET",
        CURLOPT_SSL_VERIFYHOST => 0,
        CURLOPT_SSL_VERIFYPEER => 0,
    ]);

    curl_exec($curl);

    $err = curl_error($curl);

    curl_close($curl);

    if ($err) {
        return false;
    } else {
        return true;
    }
}

function sendMail($subject, $message, $email_contact, $type = "delivery") {
    include_once "../classes_common/email.php";
    $mail_ob = new Mail($type);
    $is_sent = false;

    if (!$mail_ob->sendMail($subject, $message, [["email" => $email_contact["email"], "name" => $email_contact["name"]]])) {
        $is_sent = false;
    }

    return $is_sent;
}

function getExcelColIndex($n) {

    $col_name = []; // To store result (Excel column name)lt

    while ($n > 0) {
        $rem = $n % 26; // Find remainder

        if ($rem === 0) { // If remainder is 0, then a 'Z' must be there in output
            $col_name[] = 'Z';
            $n = ($n / 26) - 1;
        } else { // If remainder is non-zero
            $col_name[] = chr(($rem - 1) + 65);
            $n = intval($n / 26);
        }
    }

    // Reverse the string and print result

    return implode("", array_reverse($col_name));
}

function formatSizeUnits($bytes) {
    if ($bytes >= (1024 * 1024 * 1024)) {
        $bytes = number_format($bytes / (1024 * 1024 * 1024), 2) . ' GB';
    } elseif ($bytes >= (1024 * 1024)) {
        $bytes = number_format($bytes / (1024 * 1024), 2) . ' MB';
    } elseif ($bytes >= 1024) {
        $bytes = number_format($bytes / 1024, 2) . ' KB';
    } elseif ($bytes > 1) {
        $bytes = $bytes . ' bytes';
    } elseif ($bytes === 1) {
        $bytes = $bytes . ' byte';
    } else {
        $bytes = '0 bytes';
    }

    return $bytes;
}