// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.services' is found in services.js
// 'starter.controllers' is found in controllers.js
angular.module('starter', ['ionic', 'starter.controllers', 'starter.services', 'starter.filters', 'starter.directives', 'angularMoment', 'ngSanitize', 'uiGmapgoogle-maps','ngCordova','ezfb'])

.run(function($ionicPlatform) {
  $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if (window.cordova && window.cordova.plugins && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
    }

    setTimeout(function() {
      if (window.StatusBar) {
        StatusBar.styleLightContent();
      }
    }, 300);
  });
  //$cordovaStatusBar.style(1) //Light
})
.run(function ($rootScope, $state, $log) {
  $rootScope.$on('$stateChangeError', function () {
    // Redirect user to our login page
    $state.go('login');
  });
})
.config(function($stateProvider, $urlRouterProvider, $ionicConfigProvider, $sceProvider) {

  $sceProvider.enabled(false);
  // tabs layout at bottom
  $ionicConfigProvider.tabs.position('bottom');

  // Ionic uses AngularUI Router which uses the concept of states
  // Learn more here: https://github.com/angular-ui/ui-router
  // Set up the various states which the app can be in.
  // Each state's controller can be found in controllers.js
  $stateProvider

  .state('login', {
    url: '/login',
    templateUrl: 'templates/login.html',
    controller: 'LoginCtrl',
    onEnter: function(Auth,$stateParams,$state){
        if(Auth.isLoggedIn()){
         $state.go('tab.newsfeed');
      }
    }
  })

  // setup an abstract state for the tabs directive
  .state('tab', {
    url: '/tab',
    abstract: true,
    templateUrl: 'templates/tabs.html',
    controller: 'MainCtrl',
    onEnter: function($state, Auth){
      if(!Auth.isLoggedIn()){
         $state.go('login');
      }
    }
  })
  // Each tab has its own nav history stack:
  .state('tab.newsfeed', {
    url: '/news',
    views: {
      'tab-newsfeed': {
        templateUrl: 'templates/tab-newsfeed.html',
        controller: 'NewsfeedCtrl'
      }
    }
  })
  .state('tab.notifications', {
    url: '/notifications',
    views: {
      'tab-notifications': {
        templateUrl: 'templates/tab-notifications.html',
        controller: 'NotificationsCtrl'
      }
    }
  })
  .state('news-article', {
    url: '/:Type/:Id/news-article',
    templateUrl: 'templates/news-article.html',
    controller: 'NewsArticleCtrl'
  })
  .state('tab.discussions', {
      url: '/discussions',
      views: {
        'tab-discussions': {
          templateUrl: 'templates/tab-discussions.html',
          controller: 'DiscussionsCtrl'
        }
      }
    })
  .state('discussion-comments', {
    url: '/discussions/:topicId/comments',
    templateUrl: 'templates/discussion-comments.html',
    controller: 'DiscussionCommentsCtrl'
  })
  .state('tab.more', {
    url: '/more',
    views: {
      'tab-more': {
        templateUrl: 'templates/tab-more.html',
        controller: 'MoreCtrl'
      }
    }
  })
  .state('terms', {
    url: '/terms',
    templateUrl: 'templates/terms.html',
    controller: 'AuxiliaryCtrl'
  }).state('privacy', {
    url: '/privacy-policy',
    templateUrl: 'templates/privacy.html',
    controller: 'AuxiliaryCtrl'
  })
  .state('terms-comp', {
    url: '/terms-comp',
    templateUrl: 'templates/terms-comp.html',
    controller: 'AuxiliaryCtrl'
  });

  $urlRouterProvider.otherwise('/login');

})
.config(function(moment) {
    moment.locale('en', {
      relativeTime : {
        future: "in %s",
        past:   "%s",
        s:  "%ds",
        m:  "1m",
        mm: "%dm",
        h:  "1h",
        hh: "%dh",
        d:  "1d",
        dd: "%dd",
        M:  "1mon",
        MM: function (number, withoutSuffix, key, isFuture) {
          console.log("number = " + number);
          console.log("withoutSuffix = " + withoutSuffix);
          console.log("key = " + key);
          console.log("isFuture = " + isFuture);
          return "xxx";
        },
        y:  "1y",
        yy: "%dy"
      }
    });
})
.config(function (ezfbProvider) {
  ezfbProvider.setInitParams({
    // This is my FB app id for plunker demo app
    appId: '686500068152950',

    // Module default is `v2.0`.
    // If you want to use Facebook platform `v2.3`, you'll have to add the following parameter.
    // https://developers.facebook.com/docs/javascript/reference/FB.init
    version: 'v2.3'
  });
});
