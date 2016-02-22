angular.module('soweb.directives', ['sun.scrollable'])
.directive("myHeader", function () {
    
    return {
        // template: '<p>This is local header</p>'
        // templateUrl: 'app/templates/head.html'
    };
}).directive("myFooter", function () {
    return {
        
    };
}).directive("so", function () {
    return {
    };
}).directive("soweb", function () {
    return {
        template: '<!-- sidebar -->' +
                '<div id="sidebar" class="nano col-xs-4 col-sm-4 col-md-4 col-lg-4">' +
                    '<header id="header-sidebar" class="row top" ng-click="toggleState()">' +
                        '<strong>{{myFullname}}</strong> <!-- <small>{{myOrganization}}</small> -->' +
                    '</header><!-- /header -->' +
                    '<div id="container-sidebar" class="row content nano-content">' +
                        '<!-- list thread chat -->' +
                        '<div class="contact" ng-repeat="c in chatThread" ng-click="threadChatClick(c.userId,c.name)" ng-class="{active: c.userId == selected}">' +
                            '<div class="avatar col-xs-3 col-sm-3 col-md-3 col-lg-3">' +
                                '<span class="msg-avatar" ng-class="randomAvatarColor(c.userId)">{{getKeyFromFullname(c.name)}}</span>' +
                            '</div>' +
                            '<div class="contact-info col-xs-9 col-sm-9 col-md-9 col-lg-9 no-left">' +
                                '<span class="name" id=""><strong>{{c.name}}</strong></span>' +
                                '<span class="latestMsg" id=""><small>{{c.text}}</small></span>' +
                            '</div>' +
                        '</div>' +
                    '</div>' +
                '</div>' +
                
                '<!-- content -->' +
                '<div id="content" class="nano col-xs-8 col-sm-8 col-md-8 col-lg-8">' +
                    '<header id="header-content" class="row top" ng-click="toggleState()">' +
                        '<strong>{{currentChatName}}</strong> <small></small>' +
                    '</header><!-- /header -->' +
                    '<div id="container-content" class="row content nano-content" scroll-glue>' +
                        '<!-- chat content -->' +
                        '<div class="message" ng-repeat="m in messages">' +
                            '<div class="avatar col-xs-2 col-sm-2 col-md-2 col-lg-2">' +
                                '<span class="msg-avatar" ng-class="randomAvatarColor(m.userId)">{{getKeyFromFullname(m.name) || "UN"}}</span>' +
                            '</div>' +
                            '<div class="message col-xs-10 col-sm-10 col-md-10 col-lg-10">' +
                                '<p><strong>{{m.name || "Unknown"}}</strong></p>' +
                                '<p>{{m.text}}</p>' +
                            '</div>' +
                        '</div>' +
                    '</div>' +

                    '<div id="input-content" class="bottom hidden">' +
                        '<div class="avatar col-xs-2 col-sm-2 col-md-2 col-lg-2">' +
                            '<span class="msg-avatar" ng-class="randomAvatarColor(myUserId)">{{getKeyFromFullname(myFullname)}}</span>' +
                        '</div>' +
                        '<form name="msgForm">' +
                            '<div class="input col-xs-8 col-sm-8 col-md-8 col-lg-8">' +
                                '<!-- <textarea name="msg" ng-trim="true" required id="msg" ng-keypress="keypress($event)"></textarea> -->' +
                                '<input type="text" ng-trim="true" id="msg" ng-keypress="keypress($event)" ng-model="msg">' +
                            '</div>' +
                            '<div class="col-xs-2 col-sm-2 col-md-2 col-lg-2 no-padding">' +
                                '<button type="button" ng-click="sendMessage()" class="btn btn-sm" ng-disabled="!msg.length">Send</button>' +
                            '</div>' +
                        '</form>' +
                    '</div>' +
                '</div>'
    };
}).directive('resize', function ($window) {
    return function (scope, element) {
        var w = angular.element($window);
        scope.getWindowDimensions = function () {
            return {
                'h': w.height(),
                // 'w': w.width()
            };
        };
        scope.$watch(scope.getWindowDimensions, function (newValue, oldValue) {
            scope.windowHeight = newValue.h;
            scope.windowWidth = newValue.w;

            scope.style = function () {
                return {
                    'height': (newValue.h - 100) + 'px',
                    // 'width': (newValue.w - 100) + 'px'
                };
            };

        }, true);

        w.bind('resize', function () {
            scope.$apply();
        });
    }
})
.directive('sidebarDirective', function() {
    return {
        link : function(scope, element, attr) {
            scope.$watch(attr.sidebarDirective, function(newVal) {
                  if(!newVal) {
                    element.addClass('show'); 
                    return;
                  }
                  element.removeClass('show');
            });
        }
    };
})