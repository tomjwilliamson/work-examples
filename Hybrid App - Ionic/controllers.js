angular.module('starter.controllers', [])

.controller('MainCtrl', function($scope, $rootScope, Auth, $state, $window, $timeout) {
  //$scope.showHeader = true;

  $scope.loggedIn = true;
  $scope.footerIsHidden = false;
  $rootScope.dataLoaded = false;

  $scope.logout = function() {
    Auth.logout();
    $state.go('login');
    $scope.loggedIn = false;
  };

  // show/hide newsfeed tabs
  $scope.$on('$stateChangeSuccess', function(event, toState){

    if(toState.name === 'tab.newsfeed.news' || toState.name === 'tab.newsfeed.notifications'){
      $rootScope.showSubNavigation = true;
    }
    else{
      $rootScope.showSubNavigation = false;
    }

  });

  // function to show rotate message if landscape
  function readDeviceOrientation() {
    if(Math.abs(window.orientation) === 90) {
      // Landscape
      $rootScope.landscape = true;
    }
    else{
      // Portrait
      $rootScope.landscape = false;
    }
  }
  // call on orientationchange
  angular.element($window).on('orientationchange', function(event) {
    $timeout(function(){
      readDeviceOrientation();
    }, 5);
  });
  // inital call
  readDeviceOrientation();

})
.controller('NewsfeedCtrl', function($scope, $rootScope, DataService, $state, $sce, $cordovaSocialSharing, $ionicLoading) {

  $ionicLoading.show({
    content: 'Loading',
    animation: 'fade-in',
    showBackdrop: true,
    maxWidth: 200,
    showDelay: 0
  });

  returnNewsData = function(){

    DataService.getData('/news/get')
      .success(function(response){
        $ionicLoading.hide();
        $scope.newsData = [];
        angular.forEach(response.d, function(news) {
          if(news.video_url) {
            news.safe_video_url = $sce.trustAsResourceUrl(news.video_url);
          }

          // set is_featured to empty 0
          // fixes sorting by is_featured in view
          if(news.is_featured === 0 || !news.is_featured){
            news.is_featured = '';
          }

          $scope.newsData.push(news);
        });
        $rootScope.dataLoaded = true;
      });

    ga('send', 'pageview', {
      'page': '/newsfeed',
      'title': 'Newsfeed Tab'
    });

  };

  // on state change get data
  $scope.$on('$stateChangeSuccess', function(event, toState, fromState){

    if(toState.name === 'tab.newsfeed'){
      returnNewsData();
    }

  });

  // if init load - get data
  if($rootScope.dataLoaded === false){
    returnNewsData();
  }

  $scope.shareViaTwitter = function(message, image, link) {
    $cordovaSocialSharing.canShareVia("twitter", message, image, link).then(function(result) {
      $cordovaSocialSharing.shareViaTwitter(message, image, link);
    }, function(error) {
      alert("Cannot share on Twitter");
    });
  };

})
.controller('NotificationsCtrl', function($scope, $rootScope, DataService, $state, $filter, $ionicLoading) {

  $ionicLoading.show({
    content: 'Loading',
    animation: 'fade-in',
    showBackdrop: true,
    maxWidth: 200,
    showDelay: 0
  });

  var notificationData = [];

  returnData = function(){

    DataService.getData('/news/get')
      .success(function(response){

        // filter data to show only 'Article' type
        angular.forEach(response.d, function(item){

          if(item.content_type !== 'Article'){
            var idx = $filter('find')(item, notificationData);
            // is currently selected
            if (idx === -1) {
              notificationData.push(item);
            }
          }

          if(item.location && item.is_ghangout === 0){

            item.location = item.location.toString().split(',')[1];

          }

        });

        $scope.notificationData = notificationData;
        $rootScope.dataLoaded = true;
        $ionicLoading.hide();

        //console.log($scope.notificationData);

        ga('send', 'pageview', {
          'page': '/notifications',
          'title': 'Notifications Tab'
        });

      });

  };

  // on state change get data
  $scope.$on('$stateChangeSuccess', function(event, toState, fromState){

    if(toState.name === 'tab.notifications'){
      returnData();
    }

  });

  // if init load - get data
  if($rootScope.dataLoaded === false){
    returnData();
  }

})
.controller('NewsArticleCtrl', function($rootScope, $scope, $stateParams, DataService, $ionicHistory, $sce, $location, Auth, $timeout, $ionicLoading) {

  $ionicLoading.show({
    content: 'Loading',
    animation: 'fade-in',
    showBackdrop: true,
    maxWidth: 200,
    showDelay: 0
  });

  $scope.enterBtnText = 'Enter';
  $scope.attendBtnText = 'Sign up';

  $scope.setClass = function(type, isHangout){

    if(isHangout !== '' && type !== 'Competition' && type !== 'Article'){
      return 'type-Ghangout';
    }
    else{
      return 'type-' + type;
    }
  };

  $scope.goBack = function() {
    $ionicHistory.goBack();
  };

  var path;

  if(window.location.href.indexOf('Event') > -1) {
    path = '/events/event/';
  }
  else if(window.location.href.indexOf('Competition') > -1){
    path = '/competitions/competition/';
  }
  else if(window.location.href.indexOf('Article') > -1){
    path = '/news/article/';
  }

  var postcode;

  DataService.getData(path, '?id=' + $stateParams.Id)
    .success(function(response){

      // trust video src
      if(response.d.video_url) {
        response.d.safe_video_url = $sce.trustAsResourceUrl(response.d.video_url);
      }

      $scope.newsArticle = response.d;
      $ionicLoading.hide();

      //console.log($scope.newsArticle);

      ga('send', 'pageview', {
        'page': $scope.newsArticle.content_type + '/' + $scope.newsArticle.id,
        'title': $scope.newsArticle.title
      });

      // call map if item isn't Competition and/or google hangout
      if($scope.newsArticle.postcode){
        postcode = $scope.newsArticle.postcode;
        initMap();
      }

    });

  $scope.sendEventData = function(eventID, type){

    _gaq.push(['_trackEvent', 'ID: ' + eventID + ' Type: ' + type, 'clicked']);

  };

  $scope.userResponse = function(eventID, type){

    //console.log(Auth.getUser());

    _gaq.push(['_trackEvent', 'ID: ' + eventID + ' Type: ' + type, 'clicked']);

    //var userEmail = JSON.parse(Auth.getUser()).email;
    var userEmail = Auth.getUser().email;
    if (!userEmail) {
      userEmail = JSON.parse(Auth.getUser()).email;
    }


    function xhrHandler(response) {
      var returned = response.data.m,
          successText = 'Thank you',
          returnCopy;

      //successText += type === 'competition' ? 'entering': 'attending';

      $scope.postResponse = returned;

      if (returned === '') {
        returnCopy = successText;
      } else {
        returnCopy = 'Already Signed Up';
      }

      if (type === 'competition') {
        $scope.enterBtnText = returnCopy;
      } else {
        $scope.attendBtnText = returnCopy;
      }
    }


    if(type === 'competition'){
      DataService.getData('/competitions/enter', '?email=' + userEmail + '&competition_id=' + eventID)
        .then(xhrHandler);
    }
    else{
      DataService.getData('/events/attend', '?email=' + userEmail + '&event_id=' + eventID)
        .then(xhrHandler);
    }

  };

  initMap = function(){

    var geocoder = new google.maps.Geocoder();
    //console.log('postcode', postcode);

    var lat = '';
    var lng = '';
    geocoder.geocode( {'address':postcode }, function(results, status) {
      if (status == google.maps.GeocoderStatus.OK) {

        lat = results[0].geometry.location.G;
        lng = results[0].geometry.location.K;

        $timeout(function(){
          displayMap(lat, lng);
        }, 500);
      }
      else {
        console.log("Geocode was not successful for the following reason: " + status);
      }
    });

    displayMap = function(la, ln){

      $scope.map = { center: { latitude: la, longitude: ln }, zoom: 14 };
      $scope.marker = { coords: { latitude: la, longitude: ln } };

    };

  };

  $scope.triggerNotification = function(ev, content) {

  };

})
.controller('DiscussionsCtrl', function($scope, DataService, $ionicLoading, $rootScope, $localstorage, $timeout) {

  $ionicLoading.show({
    content: 'Loading',
    animation: 'fade-in',
    showBackdrop: true,
    maxWidth: 200,
    showDelay: 0
  });

  $scope.showSuggestionBox = false;

  /* Click '+' and open the Topic Suggestion box */
  $scope.toggleSuggestionBox = function(){

    if($localstorage.get('discussionsLoaded') === 'true'){
      $scope.firstDiscussionLoad = false;
    }

    if ($scope.showSuggestionBox === true) {
      $scope.showSuggestionBox = false;
    } else {
      $scope.showSuggestionBox = true;
    }
  };

  $scope.credentials = $localstorage.getObject('credentials');
  $scope.user = {};

  /* Click submit and display thank you message */
  $scope.toggleSuggestionSubmit = function(){

    var data = {"email":$scope.credentials.email,"topic":$scope.user.comment};

    DataService.postTopicData('/discussions/suggest', $.param(data))
      .then(function(response) {
        $rootScope.topicSubmit = true;

        if(response.data.m !== 'Suggestion sent'){
          $rootScope.showPostError = true;
        }
        else{
          $rootScope.showPostError = false;
        }

      });

      $scope.user.comment = '';

  };

  /* Watch for topicSubmit closing and close Topic Suggestion box */
  $scope.$watch('topicSubmit', function(nv){

    if (nv === false){
      $scope.showSuggestionBox = false;
    }
  });


  DataService.getDiscussions('/discussions/topics')
    .then(function(discussions) {
      $scope.discussions = discussions.topics;
      $ionicLoading.hide();
      });

  ga('send', 'pageview', {
    'page': '/discussions',
    'title': 'Discussions Tab'
  });

  $scope.suggestClose = function(){
    $scope.firstDiscussionLoad = false;
  };

  $scope.$on('$stateChangeSuccess', function(event, toState, fromState){

    if(toState.name === 'tab.discussions'){

      if($localstorage.get('discussionsLoaded') === 'true'){
        $scope.firstDiscussionLoad = false;
      }
      else{
        $localstorage.set('discussionsLoaded', true);
        $scope.firstDiscussionLoad = true;
      }

      ga('send', 'pageview', {
        'page': '/discussions',
        'title': 'Discussions Tab'
      });

    }

  });

})
.controller('DiscussionCommentsCtrl', function($scope, $stateParams, DataService, $localstorage,$ionicHistory, $ionicLoading, $ionicScrollDelegate) {

  $ionicLoading.show({
    content: 'Loading',
    animation: 'fade-in',
    showBackdrop: true,
    maxWidth: 200,
    showDelay: 0
  });

  $scope.goBack = function() {
    $ionicHistory.goBack();
  };

  DataService.getDiscussionComments('/discussions/get/','?id='+$stateParams.topicId)
    .then(function(discussions) {
      $scope.comments = discussions.comments;
      $ionicLoading.hide();
      //console.log($scope.comments);
    });

  DataService.getDiscussionTopic('/discussions/topic/','?id='+$stateParams.topicId)
    .then(function(topic) {
      $scope.topic = topic.topic;
      //console.log($scope.topic.topic);

      ga('send', 'pageview', {
        'page': '/discussion/' +  $scope.topic.id,
        'title': $scope.topic.topic
      });
    });

  $scope.submit = function() {
    if ($scope.comment) {
      var email = $localstorage.getObject('credentials'),
          data = {"email":email.email,"comment":$scope.comment,"topic_id":$scope.topic.id};

      DataService.postData('/discussions/post',$.param(data))
          .then(function(comment) {
            $ionicScrollDelegate.scrollTop(150);
            $scope.comments.push(comment.data);
          });
      $scope.comment = '';
    }
  };
})
.controller('MoreCtrl', function($scope,DataService,$localstorage,Auth,$state,$ionicPopover,$rootScope, $ionicLoading) {
 $scope.credentials = $localstorage.getObject('credentials');
 $scope.loadedUser = {};

  $ionicLoading.show({
    content: 'Loading',
    animation: 'fade-in',
    showBackdrop: true,
    maxWidth: 200,
    showDelay: 0
  });

 DataService.getData('/users/get','?email='+$scope.credentials.email)
     .then(function(user) {
        $scope.user = user.data.d;
        $scope.loadedUser = angular.copy(user.data.d);
        $ionicLoading.hide();
      });

 $scope.signout = function() {
   Auth.logout();
   $state.go('login');
   $scope.loggedIn = false;
 };

 $scope.submit = function(more) {
   DataService.getData('/users/update','?email='+$scope.user.email+'&username='+$scope.user.username+'&comms_email='+$scope.user.comms_email)
       .then(function(updatedUser) {
         if(updatedUser.data.e == 1) {
           $scope.error = updatedUser.data.m;
           $scope.user.username = $scope.loadedUser.username;
         }
         else {
           $scope.user = updatedUser.data.d;
           $scope.error = false;
           more.$setPristine();
         }
       });
 };

 $scope.triggerNotification = function(event) {
   var clientRect = event.srcElement.getBoundingClientRect();
    $rootScope.iconPosition = {'top':clientRect.top, 'left':clientRect.left};
    $rootScope.notification = "Turning off email notifications will not affect confirmation emails to events or competition entries.";
 };

 ga('send', 'pageview', {
    'page': '/more',
    'title': 'More Tab'
  });
})
.controller('LoginCtrl', function($scope, Auth, DataService, $ionicPopup, $state) {

    $scope.loggedIn = false;
    $scope.footerIsHidden = true;

    // // Form data for the login modal
    $scope.user = {};
    $scope.loginError = '';

     // Perform the login action when the user submits the login form
    $scope.formLogin = function() {

      if(!angular.isDefined($scope.user.email) || $scope.user.email.trim() === ""){
         $scope.loginError = 'Email address is invalid. Please try again.';
         return;
      }

      var loginParams = '?email=' + $scope.user.email;

      DataService.getData('/users/get', loginParams)
        .success(function(response){
          //console.log(response);

          // handle if user doesn't exist
          if(response.d === null){
            $scope.loginError = 'Email address is invalid. Please try again.';
            return;
          }

          // handle success
          // set user
          Auth.setUser({
            username: $scope.user.email
          });

          // TODO: remove when changing to native app dist
          $('.homescreen-dialog').hide();

          // go to dashboard
          $state.go('tab.newsfeed');

          $scope.loggedIn = true;

          // hide error message
          $scope.loginError = '';
        })
        .error(function(){
          console.log('Nope');
        });

    };

})
.controller('ShareCtrl', function($scope, $stateParams) {
  $scope.description = $stateParams.desc;
})
.controller('AuxiliaryCtrl', function($scope, $ionicHistory) {
  $scope.goBack = function() {
    $ionicHistory.goBack();
  };
});
