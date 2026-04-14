<?php
header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['ok' => false, 'error' => 'Method not allowed'], JSON_UNESCAPED_UNICODE);
    exit;
}

$raw = file_get_contents('php://input');
$input = json_decode($raw, true);

if (!is_array($input)) {
    http_response_code(400);
    echo json_encode(['ok' => false, 'error' => 'Invalid JSON body'], JSON_UNESCAPED_UNICODE);
    exit;
}

$name = trim($input['name'] ?? '');
$message = trim($input['message'] ?? '');
$page = trim($input['page'] ?? '');

if ($message === '') {
    http_response_code(400);
    echo json_encode(['ok' => false, 'error' => 'Message is required'], JSON_UNESCAPED_UNICODE);
    exit;
}

require_once __DIR__ . '/telegram-config.php';

if (empty($TELEGRAM_BOT_TOKEN) || empty($TELEGRAM_CHAT_ID)) {
    http_response_code(500);
    echo json_encode(['ok' => false, 'error' => 'Server config error'], JSON_UNESCAPED_UNICODE);
    exit;
}

$textParts = [
    'Новая заявка с сайта',
    $name !== '' ? 'Имя: ' . $name : null,
    'Сообщение: ' . $message,
    $page !== '' ? 'Страница: ' . $page : null,
];

$text = implode("\n", array_filter($textParts));

$url = "https://api.telegram.org/bot{$TELEGRAM_BOT_TOKEN}/sendMessage";
$payload = json_encode([
    'chat_id' => $TELEGRAM_CHAT_ID,
    'text' => $text
], JSON_UNESCAPED_UNICODE);

$ch = curl_init($url);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
curl_setopt($ch, CURLOPT_POSTFIELDS, $payload);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_TIMEOUT, 15);

$response = curl_exec($ch);

if ($response === false) {
    $curlError = curl_error($ch);
    curl_close($ch);

    http_response_code(500);
    echo json_encode(['ok' => false, 'error' => 'cURL error: ' . $curlError], JSON_UNESCAPED_UNICODE);
    exit;
}

$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

$data = json_decode($response, true);

if ($httpCode >= 200 && $httpCode < 300 && !empty($data['ok'])) {
    echo json_encode(['ok' => true], JSON_UNESCAPED_UNICODE);
    exit;
}

$errorText = $data['description'] ?? 'Telegram send failed';
http_response_code(500);
echo json_encode(['ok' => false, 'error' => $errorText], JSON_UNESCAPED_UNICODE);