<?php

/**
 * Simple PHP proxy, eliminating Cross Domain issues
 */

// Pre
error_reporting(E_ALL | E_STRICT);
ini_set('display_errors', 'Off');

if(!isset($_GET['url'])) {
	header('HTTP/1.1 400 Bad Request');
	exit;
}

if(!extension_loaded('curl')) {
	header('HTTP/1.1 501 Not Implemented');
	exit;
}
$headers = '';

// Create request
$ch = curl_init($_GET['url']);
curl_setopt_array($ch, array(
	CURLOPT_RETURNTRANSFER => true,

	CURLOPT_HEADERFUNCTION => function($ch, $data) use (&$headers) {
		$headers .= $data;
		return function_exists('mb_strlen') ? mb_strlen($data) : strlen($data);
	}
));

// Additional headers
if(isset($_SERVER['HTTP_ACCEPT_ENCODING'])) {
	curl_setopt($ch, CURLOPT_ENCODING, $_SERVER['HTTP_ACCEPT_ENCODING']);
}
if(!empty($_COOKIE)) {
	$cookie = array();
	foreach($_COOKIE as $name => $value) {
		if(session_name() !== $name) {//exclude sensitive information
			$cookie[] = sprintf('%s: %s', $name, $value);
		}
	}
	curl_setopt($ch, CURLOPT_COOKIE, implode('; ', $cookie));
}
if(isset($_SERVER['HTTP_REFERER'])) {
	curl_setopt($ch, CURLOPT_REFERER, $_SERVER['HTTP_REFERER']);
}
if(isset($_SERVER['HTTP_USER_AGENT'])) {
	curl_setopt($ch, CURLOPT_USERAGENT, $_SERVER['HTTP_USER_AGENT']);
}

$list = array();
if(isset($_SERVER['HTTP_ACCEPT'])) {
	$list[] = sprintf('Accept: %s', $_SERVER['HTTP_ACCEPT']);
}
if(isset($_SERVER['HTTP_ACCEPT_CHARSET'])) {
	$list[] = sprintf('Accept-Charset: %s', $_SERVER['HTTP_ACCEPT_CHARSET']);
}
if(isset($_SERVER['HTTP_ACCEPT_LANGUAGE'])) {
	$list[] = sprintf('Accept-Language: %s', $_SERVER['HTTP_ACCEPT_LANGUAGE']);
}
if(isset($_SERVER['REMOTE_ADDR'])) {
	$list[] = sprintf('X-Forwarded-For: %s', $_SERVER['REMOTE_ADDR']);
}
if(!empty($list)) {
	curl_setopt($ch, CURLOPT_HTTPHEADER, $list);
}

// Execute
$body = curl_exec($ch);

// Post
if(false === $body) {
	header('HTTP/1.1 504 Gateway Timeout');
	exit;
}

//print_R($headers);
// Print
foreach(explode("\r\n", $headers) as $header) {
	//header($header);
}

// Remove headers already handled by proxy
header_remove('Content-Encoding');
header_remove('Content-Length');
header_remove('Transfer-Encoding');

echo $body;