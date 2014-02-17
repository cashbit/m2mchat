var app = angular.module('myApp',['ui.utils']) ;

app.controller('chatController',function($scope, $location, $anchorScroll) {
    $scope.messages = [];
    $scope.rooms = [] ;
    $scope.selectedRoom  ;

    $scope.socket = io.connect('http://localhost:3700');

    $scope.socket.on('roomList', function (data) {
        if(data) {
            $scope.$apply(function(){
                $scope.rooms = [] ;
                for (var rowkey in data){
                    var room = data[rowkey]  ;
                    $scope.rooms.push(room) ;
                }
            });
        } else {
            console.log('There is a problem:', data);
        }
    });

    $scope.socket.on('message', function (data) {
        if(data) {
            $scope.$apply(function(){
                $scope.messages.push('RX: ' + data.message + ' from: ' + data.identifier) ;
                var hash = 'message_' + ($scope.messages.length-1) ;
                $location.hash(hash);
                $anchorScroll();
            });
        } else {
            console.log('There is a problem:', data);
        }
    });

    $scope.socket.on('sendChar', function (data) {
        if(data.message) {
            $scope.$apply(function(){
                $scope.messages[$scope.messages.length-1] = data.message ;
            });
        } else {
            console.log('There is a problem:', data);
        }
    });
 
    $scope.sendChar = function(){
        //$scope.socket.emit('sendChar', { message: $scope.messageText, fromRoom: $scope.selectedRoom });
    };

    $scope.sendMessage = function() {
        var data = {
            identifier : 'console',
            message : $scope.messageText
        };
        $scope.socket.emit('message', data);
        $scope.messages.push('TX: ' + $scope.messageText) ;
        $scope.messageText = '';
    };

    $scope.keypressCallback = function(event){
        $scope.sendMessage() ;
    };

    $scope.newRoom = function(){
        $scope.rooms.push($scope.newRoomName) ;
        $scope.newRoomName = '';
    };

    $scope.roomSelected = function(index){
        if ($scope.selectedRoom){
            $scope.socket.emit('unsubscribe',{room:$scope.selectedRoom}) ;
        }
        $scope.messages = [] ;
        $scope.selectedRoom = $scope.rooms[index] ;
        $scope.socket.emit('subscribe',{room:$scope.selectedRoom}) ;
    };

    $scope.messageText = '' ;
});

/*directive('ngPippo', function () {
    return {
        restrict: 'A',
        link: function (scope, element, attrs) {
            console.log('Recognized the ngPippo directive usage');
            element.bind('keydown keypress', function (event) {
                if(event.which === 13) {
                    scope.$apply(function (){
                        scope.$eval(attrs.ngEnter);
                    });

                    event.preventDefault();
                }
            });
        }
    }
});
*/