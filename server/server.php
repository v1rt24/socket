<?php

use Workerman\Worker;
use Workerman\Lib\Timer; // подключаем таймер

require_once __DIR__ . '/../vendor/autoload.php';

// Создание Websocket сервера
$ws_worker = new Worker( 'websocket://0.0.0.0:12345' );

// 4 processes
$ws_worker->count = 4;

// Срабатывает при подключении клиента
$ws_worker->onConnect = function ( $connection ) {
	echo "Новое подключение\n";

    // Отправляем данные на клиента. Сейчас отправляем с файла, но можно с БД
	$file = file_get_contents( __DIR__ . '/madams.json' );
	$connection->send( $file );

	// Запускаем таймер на считывание файла каждую секунду, т.е. если в нём поменяем количество, то на странице оно тоже изменится
	// \Workerman\Lib\Timer::add(); - так если не подключили через: use Workerman\Lib\Timer;
	Timer::add( 1, function () use ( $connection ) { // 1 - это поставили 1 секунду
		$file = file_get_contents( __DIR__ . '/madams.json' );
		$connection->send( $file );
	} );
};

// Получаем данные с клиента. Данные находятся в $data
$ws_worker->onMessage = function ( $connection, $data ) use ( $ws_worker ) {
	// Записываем пришедшие данные в файл
	file_put_contents( __DIR__ . '../madams.json', $data );

    // Отправляем полученные данные всем подключенным клиентам, чтобы обновилось у всех
	foreach ( $ws_worker->connections as $clientConnection ) {
		$clientConnection->send( $data );
	}
};

// Оповещения о закрытии соединения (к примеру, когда клиент закрывает вкладку в браузере)
$ws_worker->onClose = function ( $connection ) {
	echo "Соединение закрыто\n";
};

// Запуск worker
Worker::runAll();

// В консоли запускаем так: php server/server.php / php server/server.php start