<?php
/**
 * DEEPSEEK AI write this file!!!
 */

error_reporting(0);
ini_set('display_errors', 0);


// --- Database configuration from environment ---
define('DB_HOST', getenv('DB_HOST') ?: 'localhost');
define('DB_NAME', getenv('DB_NAME') ?: '***');
define('DB_USER', getenv('DB_USER') ?: '***');
define('DB_PASS', getenv(name: 'DB_PASS') ?: '***');

$apis = [
    'milli.gold' => 'https://milli.gold/api/v1/public/milli-price/external',
    'talasea.ir' => 'https://api.talasea.ir/api/market/getGoldPrice'
];

$results = [];

// --- CORS: restrict to your frontend domain(s) ---
$allowed_origins = [
    'https://azard.net',
    'http://localhost:3456' // 
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
        options: [
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
$results = [];

foreach ($apis as $source => $url) {
    // Fetch with cURL (same secure settings as before)
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_TIMEOUT, 10);
    curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, true);
    curl_setopt($ch, CURLOPT_USERAGENT, 'golde/1.0');
    
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $curlError = curl_error($ch);
    // No explicit curl_close needed
    
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
    } else {
        $data = json_decode($response, true);
        if (json_last_error() !== JSON_ERROR_NONE) {
            $result['error'] = 'Invalid JSON response';
            error_log("$source invalid JSON: " . json_last_error_msg());
        } else {
            // Extract price based on source
            if ($source === 'milli.gold') {
                $price = isset($data['data']['price18']) ? filter_var($data['data']['price18'], FILTER_VALIDATE_INT) : false;
                $apiDate = $data['data']['date'] ?? null;
            } else { // talasea.ir
                // Adjust this path according to the actual API response
                $price = isset($data['data']['price']) ? filter_var($data['data']['price'], FILTER_VALIDATE_INT) : false;
                $apiDate = $data['data']['date'] ?? null; // adjust if date field differs
            }
            
            if ($price === false || $price < 0) {
                $result['error'] = 'Invalid price value';
                error_log("$source invalid price");
            } else {
                $result['success'] = true;
                $result['price'] = $price;
                $result['api_date'] = $apiDate;
                
                // --- Store in database (optional) ---
                // If you want to store both prices, you need a table structure that can hold multiple entries.
                // For simplicity, we'll keep the existing table and insert a row for each source.
                // You might want to add a 'source' column to the table.
                try {
                    // Assuming you've added a 'source' column to gold_prices
                    $stmt = $pdo->prepare('INSERT INTO gold_prices (source, price, api_date) VALUES (:source, :price, :api_date)');
                    $stmt->execute([
                        'source' => $source,
                        'price' => $price,
                        'api_date' => $apiDate
                    ]);
                } catch (PDOException $e) {
                    error_log("Database insert failed for $source: " . $e->getMessage());
                    // Don't fail the whole response if storage fails
                }
            }
        }
    }
    
    $results[] = $result;
}

// --- Return the array ---
http_response_code(200);
echo json_encode($results, JSON_PRETTY_PRINT);