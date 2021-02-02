<?php

use Workerman\Worker;
use Workerman\Lib\Timer;

require_once __DIR__ . '/../vendor/autoload.php';

$ws_worker = new Worker( 'websocket://0.0.0.0:12345' );

$ws_worker->count = 4;

$ws_worker->onConnect = function ( $connection ) {
	$file = file_get_contents( __DIR__ . '/madams.json' );
	$connection->send( $file );

	Timer::add( 1, function () use ( $connection ) {
		$file = file_get_contents( __DIR__ . '/madams.json' );
		$connection->send( $file );
	} );
};

$ws_worker->onMessage = function ( $connection, $data ) use ( $ws_worker ) {
	file_put_contents( __DIR__ . '/madams.json', $data );

	foreach ( $ws_worker->connections as $clientConnection ) {
		$clientConnection->send( $data );
	}
};

$ws_worker->onClose = function ( $connection ) {};

Worker::runAll();