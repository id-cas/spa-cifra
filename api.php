<?php
require 'vendor/autoload.php';

header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
	echo json_encode([
		'error' => 'Wrong request method.'
	]);
	exit();
}

define('DEFAULT_PAGE', 0);
define('DEFAULT_LIMIT', 5);

$pageNum = intval($_GET['p'] ?? DEFAULT_PAGE);
$limit = intval($_GET['l'] ?? DEFAULT_LIMIT);

$limit = in_array($limit, [5, 10]) ? $limit : DEFAULT_LIMIT;

try {
	$client = new MongoDB\Client("mongodb://localhost:27017");
	$collection = $client->cifra->catalog;

	$total = $collection->count();
	$result = $collection->find([], [
		'limit' => $limit,
		'skip' => $pageNum * $limit
	]);

	$response = [
		'items' => []
	];
	foreach ($result as $entry) {
		$response['items'][] = [
			'id' => $entry['id'],
			'title' => $entry['title'],
			'price' => $entry['price'],
			'quantity' => $entry['quantity']
		];
	}

	$response['page'] = $pageNum;
	$response['pages'] = ceil($total / $limit);
	$response['limit'] = $limit;

	echo json_encode($response);
}
catch (Exception $e){
	echo json_encode([
		'error' => 'Database error.'
	]);
	exit();
}

