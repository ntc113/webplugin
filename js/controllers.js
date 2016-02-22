angular.module('soweb.controllers', [
    'btford.socket-io',
    // 'luegg.directives'
]).controller("HomeCtrl", function($scope, $rootScope, socket, $localStorage, $sessionStorage, $route){
    $(".nano").nanoScroller();
    // angular.element(document.getElementsByTagName('head')).append(angular.element('<base href="' + window.location.pathname + '" >'));
    
    /*tab-sidebar*/
    $scope.tab = 1;
    $scope.setTab = function(newTab){
      $scope.tab = newTab;
    };
    $scope.isSet = function(tabNum){
      return $scope.tab === tabNum;
    };
    //variable - congnt
    $scope.pluginButtonShow = "Show";
    $scope.pluginButtonHidden = "Hidden";
    $scope.sidebarButtonShow = "Show";
    $scope.sidebarButtonHidden = "Hidden";
    $scope.pluginShowButton = $scope.pluginButtonShow;
    $scope.sidebarShowButton = $scope.sidebarButtonHidden;
    $scope.name = "HomeCtrl";
    var employeeCode = $('#employeeCode').val();
    // function - congnt
    $scope.togglePlugin = function() {
        $scope.statePlugin = !$scope.statePlugin;
    };
    $scope.toggleSidebar = function() {
        $scope.stateSidebar = !$scope.stateSidebar;
    };
    $scope.randomAvatarColor = function (uid) {
        return 'cl' + uid%7;
    }

    // init variable - haivh2
    $scope.isShowTyping = false;
    $scope.messages = [];
    $scope.chatThread = [];
    $scope.listFriend = [];
    $scope.listOrgFriend = [];
    var periodTyping = 5000;
    var currentChatUser = 0;
    var curentChatName = "";
    var preChatUser = 12;
    var allMessages = [];
    var timeTyping = 0;
    $scope.myUserId = 0;
    $scope.myFullname = "";
    $scope.myOrganization = "";
    $scope.currentChatName = "";
    $scope.currentStautus = "";

    $scope.threadChatClick = function(userId, fullname){
        $("#input-content").removeClass("hidden");
        $('#msg').val('');

        $scope.selected = userId;
        currentChatUser = userId;
        curentChatName = fullname;
        $scope.currentChatName = fullname;
        $scope.messages = [];
        for(i = 0;i < allMessages.length ; i ++){
            if(allMessages[i].from==userId){
                if(!allMessages[i].name)
                    allMessages[i].name = fullname;
                $scope.messages.push(allMessages[i]);   
            }
                
        }
        var status;
        var lastVisitDate;
        for(j= 0;j < $scope.listFriend.length;j++){
            if($scope.listFriend[j].userId == userId){
                status = $scope.listFriend[j].status;
                lastVisitDate = $scope.listFriend[j].lastVisitDate;
            }
        }
        if(status == 1)//online
            $scope.currentStautus = "online";
        else{
            if(lastVisitDate > 0){
                $scope.currentStautus = "last online " + getLastOnline(lastVisitDate);
            }
        }
        //update count unread thread chat
        for(k=0;k < $scope.chatThread.length;k++){
            if($scope.chatThread[k].userId == userId){
                $scope.chatThread[k].count = 0;
            }
        }
    };
    $scope.keypress = function(event){
        if (event.which === 13) {
            $scope.sendMessage();
        } else {
            var message = $('#msg').val();
            var now = Math.round(+new Date());
            if((now - timeTyping) > periodTyping && message != ""){
                timeTyping = now;
                sendTyping(currentChatUser);
            }

        }

    };
    $scope.sendMessage = function () {
        var message = $('#msg').val();
        $('#msg').val('');
        if (!message) {return};
        var NOW = Math.round(+new Date()/1000);
        NOW++;
        if(currentChatUser <= 0 || !message)
            return;
        // send to server
        var packetBody = {to:currentChatUser, msgId:NOW, 'msg': message};
        var packet = {service: 72, body: JSON.stringify(packetBody)};
        sendPacket(packet);
        var newMsg ={
                    text: message,
                    from: currentChatUser,
                    msgId:NOW,
                    userId:$scope.myUserId,
                    name:$scope.myFullname
                }
        allMessages.push(newMsg);
        $scope.messages.push(newMsg);
        // update to thread chat
        var isContainConversation = containsUserId(currentChatUser,$scope.chatThread);
        if(isContainConversation >= 0){
            //update conversation
            updateConversation(currentChatUser,message);
            if(isContainConversation > 0){
                var tmp = $scope.chatThread[isContainConversation];
                $scope.chatThread.splice(isContainConversation,1);
                $scope.chatThread.unshift(tmp);
            }

        }
        else{//add conversation
            // get name of contact 
            var name;                 
            name = getFullName(currentChatUser,$scope.listFriend);
            if(name == "")
                name = getFullName(currentChatUser,$scope.listOrgFriend);
            $scope.chatThread.unshift(
            {
                text: message,                
                userId: currentChatUser,
                name:name
            });
        }

    };
    // waiting and exe when has package
    socket.on('WebPacket', function(data) {
        console.log(data);
        if(data.service == 1){
            var packetBody = {};
            var packet = {service: 1, body: JSON.stringify(packetBody)};
            sendPacket(packet);
        }            
        else if(data.service == 2){
            //login
            var obj = JSON.parse(data.body);
            $scope.myUserId = obj.userId;
            $scope.myFullname = obj.fullname;
            var org = obj.orgs;
            $scope.myOrganization =  org[2].name;
        }
        else if(data.service == 13){
            //list friend
            var obj = JSON.parse(data.body);
            var friendArr = obj.friends;
            
            for(i=0;i<friendArr.length; i++)
            {
                var user = {
                    userId:friendArr[i].userId,
                    fullname:friendArr[i].fullname,
                    lastVisitDate:friendArr[i].lastVisitDate,
                    status:friendArr[i].status,
                    avatarSmall:friendArr[i].avatarSmall,
                    phoneNumber:friendArr[i].phoneNumber
                };

                $scope.listFriend.push(user);
            }
        }
        else if(data.service == 24){
            // get UserInfo
             var obj = JSON.parse(data.body);
             var user = {
                userId:obj.userId,
                fullname:obj.fullname,
                lastVisitDate:obj.lastVisitDate,
                status:obj.status,
                avatarSmall:obj.avatarSmall,
                phoneNumber:obj.phoneNumber
             };
             $scope.listFriend.push(user);
             // update name in chat thread
             updateFullName(obj.userId,obj.fullname,$scope.chatThread);
        }
        else if (data.service == 73) {
            //have message
            output(data.body);
            var obj = JSON.parse(data.body);
            var fullname = "";
            //var namekey = getKeyFromFullname(curentChatName);
            var newMsg ={
                text: obj.msg,
                time: obj.time,
                from: obj.from,
                msgId:obj.msgId,
                name:"",
                userId:obj.from
                //nameKey:namekey
            }
            //send message report
            var packetBody = {to:obj.from, 'msgId': obj.msgId};
            var packet = {service: 167, body: JSON.stringify(packetBody)};
            sendPacket(packet);
            // save message to array
            if(obj.from == currentChatUser)
            {
                newMsg.name = curentChatName;
                $scope.isShowTyping = false;
                $scope.messages.push(newMsg);
            }
            allMessages.push(newMsg);
            //scrollToBottom();
            
            var isContainConversation = containsUserId(obj.from,$scope.chatThread);
            if(isContainConversation >= 0){
                //update conversation
                updateConversation(obj.from,obj.msg);
                if(isContainConversation > 0){
                // swap to top
                    var tmp = $scope.chatThread[isContainConversation];
                    $scope.chatThread.splice(isContainConversation,1);
                    $scope.chatThread.unshift(tmp);
                }
                if(obj.from != currentChatUser){
                    $scope.chatThread[0].count += 1;
                }
            }
            else{
                //add conversation
                var name;                 
                name = getFullName(obj.from ,$scope.listFriend);
                if(name == "")
                    name = getFullName(obj.from ,$scope.listOrgFriend);
                if(name == ""){
                    //get userInfo
                    getUserInfo(obj.from,8);
                }
                $scope.chatThread.unshift(
                {
                    text: obj.msg,
                    time: obj.time,
                    userId: obj.from,
                    name:name,
                    count : 1
                });

            }
        }
        else if(data.service == 142){
            // show typing
            var obj = JSON.parse(data.body);
            var userId = obj.from;
            if(userId == currentChatUser)
            {
                $scope.isShowTyping = true;
            }
            // show in thread chat
            var isContainConversation = containsUserId(obj.from,$scope.chatThread);
            if(isContainConversation >= 0){
                //update conversation
                updateConversation(obj.from,"is typing");
            }
        }
        else if(data.service == 166){
            //list org friend
            var obj = JSON.parse(data.body);
            var friendArr = obj.list;
            
            for(i=0;i<friendArr.length; i++)
            {
                var user = {
                    userId:friendArr[i].userId,
                    fullname:friendArr[i].fullname,
                    lastVisitDate:friendArr[i].lastVisitDate,
                    status:friendArr[i].status,
                    avatarSmall:friendArr[i].avatarSmall,
                    phoneNumber:friendArr[i].phoneNumber
                };

                $scope.listOrgFriend.push(user);
            }
        }
         else {
            output(data.service);
        }
    });

    function containsUserId(userId, list) {
        var i;
        for (i = 0; i < list.length; i++) {
        if (list[i].userId === userId) {
            return i;
            }
        }   

        return -1;
    }

    function getFullName(userId, list) {
        var i;
        for (i = 0; i < list.length; i++) {
        if (list[i].userId === userId) {
            return list[i].fullname;
            }
        }   

        return "";
    }
    
    function updateFullName(userId, fullname, list){
        var i;
        for (i = 0; i < list.length; i++) {
        if (list[i].userId == userId) {
                 list[i].name = fullname;
            }
        }   
    }

    $scope.convertUncountMessageToText = function(count){
        if(count > 9)
            return "9+";
        else if(count == 0)
            return "";
        else
            return count;
    }

    $scope.getKeyFromFullname = function(fullname){
        var key = "";
        if (!fullname) return "";

        var words = fullname.split(" ");
        if (words.length == 1)
        {
            key = words[0].substring(0, words[0].length == 1 ? 1 : 2);
        }
        else
        {
            key = words[0].substring(0, 1) + words[words.length - 1].substring(0, 1);
        }

        return key.toUpperCase();
    };

    function convertTimeStampToDate(timestamp){
      var a = new Date(timestamp * 1000);
      var months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
      var year = a.getFullYear();
      var month = months[a.getMonth()];
      var date = a.getDate();
      var hour = a.getHours();
      var min = a.getMinutes();
      var sec = a.getSeconds();
      //var time = date + ' ' + month + ' ' + year + ' ' + hour + ':' + min + ':' + sec ;
      return time;
    }

    function getLastOnline(lastVisitDate){
        var lastDate = new Date(lastVisitDate * 1000);
        var months = ['01','02','03','04','05','06','07','08','09','10','11','12'];
        var year = lastDate.getFullYear();
        var month = months[lastDate.getMonth()];
        var date = lastDate.getDate();
        var hour = lastDate.getHours();
        var min = lastDate.getMinutes();
        var now = Math.round(+new Date());
        var diff = lastVisitDate - now;
        var count = diff/(1000*60*60*24);
        if(count > 0){
            if(count == 1)
                return hour + ":" + min + " yesterday" ;
            else if(year == now.getFullYear())
                return hour + ":" + min + " " + date + "/" + month;
            else
                return hour + ":" + min + " " + date + "/" + month + "/" + year; 
        }
    }
    function updateConversation(userId,message){
        var i;
        for (i = 0; i < $scope.chatThread.length; i++) {
        if ($scope.chatThread[i].userId === userId) {
              $scope.chatThread[i].text = message;
              if($scope.chatThread[i].name == "")
              {
                // update name
                var name;                 
                name = getFullName(userId,$scope.listFriend);
                if(name == "")
                    name = getFullName(userId ,$scope.listOrgFriend);
                $scope.chatThread[i].name = name;
              }

              return;
            }
        }   
    }
    function getUserInfo(userId,purpose){
        var packetBody = {userId:userId, purpose:purpose};
        var packet = {service: 24, body: JSON.stringify(packetBody)};
        sendPacket(packet);
    }
    function sendTyping(userId){
        var packetBody = {to:userId};
        var packet = {service: 142, body: JSON.stringify(packetBody)};
        sendPacket(packet);
    }
    function sendReportMessage (msg) {
        var packetBody = {to:msg.from, msgId:msg.msgId};
        var packet = {service: 167, body: JSON.stringify(packetBody)};
        sendPacket(packet);
    }
    function login() {
        var packet = {service: 29, body: JSON.stringify({apply:1})};
        sendPacket(packet);
        var packet = {service: 2, body: JSON.stringify({username:employeeCode, password: "123456"})};
        sendPacket(packet);
    }
    function sendPacket (packet) {
        socket.emit('WebPacket', packet);
    }
    function sendDisconnect() {
        socket.disconnect();
    }
    function output(message) {
        console.log(message);
    }

    socket.on('connect', function() {
        login();
        output('Client has connected to the server!');
    });
    
    socket.on('disconnect', function() {
        output('The client has disconnected!');
    });

    socket.on('reconnect', function() {
        output('The client has reconnected!');
    });

    socket.on('error', function() {
        output('The socket has error!');
    });

    socket.on('reconnect_attempt', function() {
        output('reconnect attempt!');
    });

    socket.on('reconnecting', function() {
        output('The client has reconnecting!');
    });

    socket.on('reconnect_error', function() {
        output('The client has reconnect_error!');
    });

    socket.on('reconnect_failed', function() {
        output('The client has reconnect_failed!');
    });
}).factory('socket', function ($rootScope) {
    var socket = io.connect('http://10.58.71.190:9092');
    //var socket = io.connect('http://127.0.0.1:9092');
    return {
        on: function (eventName, callback) {
            socket.on(eventName, function () {  
                var args = arguments;
                $rootScope.$apply(function () {
                    callback.apply(socket, args);
                });
            });
        },
        emit: function (eventName, data, callback) {
            socket.emit(eventName, data, function () {
                var args = arguments;
                $rootScope.$apply(function () {
                    if (callback) {
                        callback.apply(socket, args);
                    }
                });
            })
        }
    };
}).filter('cut', function () {
    return function (value, wordwise, max, tail) {
        if (!value) return '';

        max = parseInt(max, 10);
        if (!max) return value;
        if (value.length <= max) return value;

        value = value.substr(0, max);
        if (wordwise) {
            var lastspace = value.lastIndexOf(' ');
            if (lastspace != -1) {
                value = value.substr(0, lastspace);
            }
        }

        return value + (tail || ' …');
    };
});