ngApp.controller('myCtrl', ['$scope', '$timeout', function ($scope, $timeout) {
    $scope.mainLoaderIs = true;

    $scope.membersList = [{
        "id": "1",
        "name": "Jamal Mohammed"
    }, {
        "id": "2",
        "name": "Rajeshree"
    }, {
        "id": "3",
        "name": "Neha"
    }, {
        "id": "4",
        "name": "Jaffar Ali"
    }, {
        "id": "5",
        "name": "Ravi Kore"
    }, {
        "id": "6",
        "name": "Hamza Shaikh"
    }, {
        "id": "7",
        "name": "Shashi Yadav"
    }, {
        "id": "8",
        "name": "Mahesh"
    }, {
        "id": "9",
        "name": "Charan"
    }, {
        "id": "10",
        "name": "Komal"
    }, {
        "id": "11",
        "name": "Yusuf Aslam"
    }, {
        "id": "12",
        "name": "Paras"
    }, {
        "id": "13",
        "name": "Vasuda"
    }, {
        "id": "14",
        "name": "Ameer Shaikh"
    }, {
        "id": "15",
        "name": "Shruti"
    }, {
        "id": "16",
        "name": "Faizan"
    }, {
        "id": "17",
        "name": "Amir"
    }, {
        "id": "18",
        "name": "Abdul Niyaz"
    }, {
        "id": "19",
        "name": "Shiyam Sunder"
    }, {
        "id": "20",
        "name": "Sharuk Khan"
    }];

    $scope.createdGroupList = [];
    $scope.checkRandomNo = [];
    $scope.membersCount = 5;
    $scope.groupsCount = 4;
    $scope.membersInGroup = [];

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

        for (var m = 0; m < $scope.membersCount; m++) {
            var members = "Member-" + (m + 1);
            $scope.membersInGroup.push(members);
        }

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
        $scope.createdGroupList = [];
        $scope.checkRandomNo = [];
        $scope.membersInGroup = [];
        $scope.autoCreateGroup();
    };

    $timeout(function () {
        $scope.mainLoaderIs = false;
    }, 1000);
}]);