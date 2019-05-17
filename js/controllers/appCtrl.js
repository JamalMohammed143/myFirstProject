ngApp.controller('myCtrl', ['$scope', '$timeout', '$http', function ($scope, $timeout, $http) {
    $scope.mainLoaderIs = true;
    $scope.membersList = [];
    $scope.createdGroupList = [];
    $scope.checkRandomNo = [];
    $scope.membersCount = 5;
    $scope.groupsCount = 4;
    //$scope.membersInGroup = [];
    $scope.membersObj = {
        "name": "",
        "empId": "",
        "department": ""
    };

    $scope.addMembers = function () {
        $scope.membersList.push(angular.copy($scope.membersObj));
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
        for (var r = 0; r < $scope.membersList.length; r++) {
            $scope.checkRandomNo.push(r);
        }

        // for (var m = 0; m < $scope.membersCount; m++) {
        //     var members = "Member-" + (m + 1);
        //     $scope.membersInGroup.push(members);
        // }

        for (var g = 0; g < $scope.groupsCount; g++) {
            var group = [];

            for (var i = 0; i < $scope.membersCount; i++) {
                var getIndex = 0;

                if (group.length < $scope.membersCount) {

                    getIndex = $scope.randomNoCreator();
                    group.push($scope.membersList[getIndex]);

                } else {
                    break;
                }
            }
            $scope.createdGroupList.push(group);
        }
    };

    $scope.reloadFun = function () {
        var url = "https://api.hosterapp.in/amsnode/getRoleList";
        $http.get(url).then(function (response) {
            $scope.students = response.data;
        });

        $.getJSON("js/json/membersList.json").then(function (result) {
            console.log('result', result);
            $scope.membersList = result;
            $scope.createdGroupList = [];
            $scope.checkRandomNo = [];
            $scope.membersInGroup = [];
            $scope.autoCreateGroup();
        });
    };

    $timeout(function () {
        $scope.mainLoaderIs = false;
    }, 1000);
}]);