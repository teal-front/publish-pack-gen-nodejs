#!/bin/sh

start(){
     echo 'Start killing server...'
     pm2 kill
     sleep 1
     echo 'Server has been killed'
     echo 'Start server...'
     pm2 start ../pm2-prod.json
     echo 'Sever has been started'
}

stop(){
    echo 'Stop server...'
    pm2 stop all
    echo 'Server has been stopped'
}

restart(){
    echo 'Restart server...'
    pm2 restart all
    echo 'Server has been restarted'
}

status(){
    pm2 list
}

case $1 in
    start)
        start;
    ;;
    stop)
        stop;
    ;;
    restart)
        restart;
    ;;
    status)
        status;
    ;;
  *)
    echo "Usage: server.sh {start|stop|restart|status}"
    ;;
esac
exit 0