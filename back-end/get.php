<?php

error_reporting(0);
ini_set('display_errors', 0);

// --- Database configuration from environment ---
define('DB_HOST', getenv('DB_HOST') ?: 'localhost');
define('DB_NAME', getenv('DB_NAME') ?: '****');
define('DB_USER', getenv('DB_USER') ?: '****');
define('DB_PASS', getenv(name: 'DB_PASS') ?: '****');
// --- Define APIs ---
$apis = [
    'milli.gold' => 'https://milli.gold/api/v1/public/milli-price/external',
    'talasea.ir' => 'https://api.talasea.ir/api/market/getGoldPrice',
    'wallgold.ir' => 'https://api.wallgold.ir/api/v1/price?symbol=GLD_18C_750TMN&side=buy',
    'digikala.com' => 'https://api.digikala.com/non-inventory/v1/prices/',
    'technogold.gold' => 'https://api2.technogold.gold/customer/tradeables/only-price/1',
    'zarpaad.com' => 'https://app.zarpaad.com/api/getRate',
    // 'melligold.com' => 'https://melligold.com/api/v1/exchange/buy-sell-price/?symbol=XAU18&format=json',
    'zarinex.io' => 'https://api.zarinex.io/wallets/v1/prices'
];

// --- CORS: restrict to your frontend domain(s) ---
$allowed_origins = [
    'https://azard.net',
    'http://localhost:3456'
];
if (isset($_SERVER['HTTP_ORIGIN']) && in_array($_SERVER['HTTP_ORIGIN'], $allowed_origins)) {
    header('Access-Control-Allow-Origin: ' . $_SERVER['HTTP_ORIGIN']);
} else {
    header('Access-Control-Allow-Origin: '); // empty = not allowed
}
header('Content-Type: application/json; charset=UTF-8');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Handle preflight
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Only allow GET
if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed. Use GET.']);
    exit();
}

// --- Database connection (PDO) ---
try {
    if (empty(DB_NAME) || empty(DB_USER)) {
        throw new Exception('Database configuration missing');
    }
    $pdo = new PDO(
        "mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=utf8mb4",
        DB_USER,
        DB_PASS,
        [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES => false
        ]
    );
} catch (Exception $e) {
    error_log('Database connection failed: ' . $e->getMessage());
    http_response_code(500);
    echo json_encode(['error' => 'Internal server error']);
    exit();
}

// --- Initialize multi curl ---
$multiHandle = curl_multi_init();
$handles = []; // source => curl handle

foreach ($apis as $source => $url) {
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_TIMEOUT, 10);
    curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
    curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, false);

    curl_setopt($ch, CURLOPT_USERAGENT, 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36');

    curl_multi_add_handle($multiHandle, $ch);
    $handles[$source] = $ch;
}

// --- Execute all requests concurrently ---
$active = null;
do {
    $status = curl_multi_exec($multiHandle, $active);
    if ($status > 0) {
        curl_multi_close($multiHandle);
        http_response_code(500);
        echo json_encode(['error' => 'cURL multi execution failed']);
        exit();
    }
    curl_multi_select($multiHandle);
} while ($active);

// --- Process each response ---
$results = [];
foreach ($handles as $source => $ch) {
    $response = curl_multi_getcontent($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $curlError = curl_error($ch);

    $result = [
        'source' => $source,
        'success' => false,
        'price' => null,
        'api_date' => null,
        'error' => null
    ];

    if ($response === false || $httpCode !== 200) {
        $result['error'] = "HTTP $httpCode, cURL error: $curlError";
        error_log("$source API error: " . $result['error']);
        $results[] = $result;
        curl_multi_remove_handle($multiHandle, $ch);
        // No curl_close – handle will be cleaned up by PHP
        continue;
    }

    // Decode JSON
    $data = json_decode($response, true);
    if (json_last_error() !== JSON_ERROR_NONE) {
        $result['error'] = 'Invalid JSON response';
        error_log("$source invalid JSON: " . json_last_error_msg());
        $results[] = $result;
        curl_multi_remove_handle($multiHandle, $ch);
        continue;
    }

    // --- Extract price and date based on source ---
    $price = false;
    $apiDate = date('Y-m-d H:i:s');

    if ($source === 'milli.gold') {
        $getPrice = isset($data['data']['price18']) ? filter_var($data['data']['price18'], FILTER_VALIDATE_INT) : false;
        $price = $getPrice * 100;
    } elseif ($source === 'talasea.ir') {
        $getPrice = isset($data['price']) ? filter_var($data['price'], FILTER_VALIDATE_INT) : false;
        $price = $getPrice * 1000;
    } elseif ($source === 'wallgold.ir') {
        $price = isset($data['result']['price']) ? filter_var($data['result']['price'], FILTER_VALIDATE_INT) : false;
    } elseif ($source === 'digikala.com') {
        $getPrice = isset($data['gold18']['price']) ? filter_var($data['gold18']['price'], FILTER_VALIDATE_INT) : false;
        $price = $getPrice * 100;
    } elseif ($source === 'technogold.gold') {
        $price = isset($data['results']['price']) ? filter_var($data['results']['price'], FILTER_VALIDATE_INT) : false;
    } elseif ($source === 'zarpaad.com') {
        $price = isset($data['data']['gold']['buy_price']) ? filter_var($data['data']['gold']['buy_price'], FILTER_VALIDATE_INT) : false;
    } 
    // elseif ($source === 'melligold.com') {
    //     $price = isset($data['data']['price_buy']) ? filter_var($data['data']['price_buy'], FILTER_VALIDATE_INT) : false;
    // }
    elseif ($source === 'zarinex.io') {
        $price = isset($data['data']['G18']['buy']['price']) ? filter_var($data['data']['G18']['buy']['price'], FILTER_VALIDATE_INT) : false;
    }

    // Validate price
    if ($price === false || $price < 0) {
        $result['error'] = 'Invalid price value';
        error_log("$source invalid price");
        $results[] = $result;
        curl_multi_remove_handle($multiHandle, $ch);
        continue;
    }

    // Success – populate result
    $result['success'] = true;
    $result['price'] = $price;
    $result['api_date'] = $apiDate;

    // --- Store in database (optional) ---
    try {
        $stmt = $pdo->prepare('INSERT INTO gold_prices (source, price, api_date) VALUES (:source, :price, :api_date)');
        $stmt->execute([
            'source' => $source,
            'price' => $price,
            'api_date' => $apiDate
        ]);
    } catch (PDOException $e) {
        error_log("Database insert failed for $source: " . $e->getMessage());
        // Do not fail the response – just log
    }

    $results[] = $result;

    // Detach handle from multi – PHP will clean up the handle itself
    curl_multi_remove_handle($multiHandle, $ch);
}

// Close the multi handle – this frees its resources
curl_multi_close($multiHandle);

// --- Return the array ---
http_response_code(200);
echo json_encode($results, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);