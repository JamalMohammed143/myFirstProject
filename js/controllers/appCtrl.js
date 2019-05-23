ngApp.controller('myCtrl', ['$scope', '$timeout', '$http', function ($scope, $timeout, $http) {
    $scope.mainLoaderIs = true;
    $scope.allMembersList = [];
    $scope.selMembersList = [];
    $scope.createdGroupList = [];
    $scope.checkRandomNo = [];
    $scope.membersCount = 5;
    $scope.groupsCount = 4;
    $scope.membersObj = {
        "name": "",
        "empId": "",
        "department": ""
    };

    $scope.addMembers = function () {
        $scope.allMembersList.push(angular.copy($scope.membersObj));
        $scope.membersObj.name = "";
        $scope.membersObj.empId = "";
        $scope.membersObj.department = "";
        $('#memberAddModal').modal('hide');
    };

    $scope.randomNoCreator = function () {
        for (var a = $scope.checkRandomNo, i = a.length; i--;) {
            var random = a.splice(Math.floor(Math.random() * (i + 1)), 1)[0];
            return random;
        }
    };

    $scope.autoCreateGroup = function () {
        for (var r = 0; r < $scope.selMembersList.length; r++) {
            $scope.checkRandomNo.push(r);
        }

        for (var g = 0; g < $scope.groupsCount; g++) {
            var group = [];

            for (var i = 0; i < $scope.membersCount; i++) {
                var getIndex = 0;

                if (group.length < $scope.membersCount) {

                    getIndex = $scope.randomNoCreator();
                    group.push($scope.selMembersList[getIndex]);

                } else {
                    break;
                }
            }
            $scope.createdGroupList.push(group);
        }
    };

    $scope.removeFromSelList = function (getIndex) {
        $scope.selMembersList.splice(getIndex, 1);
    };

    $scope.reloadFun = function (params) {
        if (params == 'onload') {
            $.getJSON("js/json/membersList.json").then(function (result) {
                $scope.allMembersList = result;
            });
            $.getJSON("js/json/selMembers.json").then(function (result) {
                $scope.selMembersList = result;
                $scope.autoCreateGroup();
            });
        } else {
            $scope.createdGroupList = [];
            $scope.checkRandomNo = [];
            $scope.membersInGroup = [];
            $scope.autoCreateGroup();
        }
    };

    $timeout(function () {
        $scope.mainLoaderIs = false;
    }, 1000);
}]);