/**
 * @title Robot distance control
 * @author L.Adel
 * @date 21/12/2017
 */

var socket;

/**
 * Handle robot distance control events
 */
module.exports = function (mySocket) {
    socket = mySocket;
        
    angVel();
    time();
    angle();
    rcMode();
    mode();
    leds();
    reset();
    forward();
    left();
    stop();
    right();
    backward();
    pan();
    tilt();
    period();
}

/**
 * The angular velocity bar has been changed, update the value in the label
 */
function angVel () {
    socket.on('set_angVel', function (data) {
        console.log('[angVel] progress = ' + data.PROGRESS);
        socket.broadcast.emit('get_angVel', data);
        socket.emit('get_angVel', data);
    });
}

/**
 * The time bar has been changed, set the mode to USE TIME and update the value in the label
 */
function time () {    
    socket.on('set_time', function (data) {
        console.log('[time] progress = ' + data.PROGRESS);
        socket.broadcast.emit('get_time', data);
        socket.emit('get_time', data);
    });
}

/**
 * the angle bar has been changed, set the mode to USE ANGLE and update the value in the label
 */
function angle () {    
    socket.on('set_angle', function (data) {
        console.log('[angle] progress = ' + data.PROGRESS);
        socket.broadcast.emit('get_angle', data);
        socket.emit('get_angle', data);
    });
}

/**
 * Control mode
 */
function rcMode () {    
    socket.on('set_rcMode', function (data) {
        console.log('[rcMode] isChecked = ' + data.IS_CHECKED);    
        socket.broadcast.emit('get_rcMode', data);
        socket.emit('get_rcMode', data);
    });
}

/**
 * Secure & Un-secure movement mode
 */
function mode () {    
    socket.on('set_mode', function (data) {
        console.log('[mode] isChecked = ' + data.IS_CHECKED);
        socket.broadcast.emit('get_mode', data);
        socket.emit('get_mode', data);
    });
}

/**
 * IR led toggle mode
 */
function leds () {        
    socket.on('set_leds', function (data) {
        console.log('[leds] isChecked = ' + data.IS_CHECKED);
        socket.broadcast.emit('get_leds', data);
        socket.emit('get_leds', data);
    });
}

/**
 * Pan & Tilt reset
 */
function reset () {        
    socket.on('set_reset', function (data) {
        console.log('[reset] ' + JSON.stringify(data));
        socket.broadcast.emit('get_reset', data);
        socket.emit('get_reset', data);
    });
}

/**
 * Move forward
 */
function forward () {
    socket.on('set_forward', function (data) {
        console.log('[forward] ' + JSON.stringify(data));
        socket.broadcast.emit('get_forward', data);
        socket.emit('get_forward', data);
    });
}

/**
 * Turn left
 */
function left () {
    socket.on('set_left', function (data) {
        console.log('[left] ' + JSON.stringify(data));
        socket.broadcast.emit('get_left', data);
        socket.emit('get_left', data);
    });
}

/**
 * Stop all movement
 */
function stop () {
    socket.on('set_stop', function (data) {
        console.log('[stop] ' + JSON.stringify(data));
        socket.broadcast.emit('get_stop', data);
        socket.emit('get_stop', data);
    });
}

/**
 * Turn right
 */
function right () {
    socket.on('set_right', function (data) {
        console.log('[right] ' + JSON.stringify(data));
        socket.broadcast.emit('get_right', data);
        socket.emit('get_right', data);
    });
}

/**
 * Move backward
 */
function backward () {
    socket.on('set_backward', function (data) {
        console.log('[backward] ' + JSON.stringify(data));
        socket.broadcast.emit('get_backward', data);
        socket.emit('get_backward', data);
    });
}

/**
 * Pan management
 */
function pan () {
    socket.on('set_pan', function (data) {
        console.log('[pan] progress = ' + data.PROGRESS);
        socket.broadcast.emit('get_pan', data);
        socket.emit('get_pan', data);
    });
}

/**
 * Tilt management
 */
function tilt () {
    socket.on('set_tilt', function (data) {
        console.log('[tilt] progress = ' + data.PROGRESS);
        socket.broadcast.emit('get_tilt', data);
        socket.emit('get_tilt', data);
    });
}

/**
 * Status period
 */
function period () {
    socket.on('set_period', function (data) {
        console.log('[period] progress = ' + data.PROGRESS);
        socket.broadcast.emit('get_period', data);
        socket.emit('get_period', data);
    });
}
