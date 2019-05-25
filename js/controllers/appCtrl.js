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
        "gender": "male",
        "department": ""
    };

    $scope.addMembers = function () {
        console.log('$scope.membersObj', $scope.membersObj);
        $scope.allMembersList.push(angular.copy($scope.membersObj));
        $scope.membersObj.name = "";
        $scope.membersObj.empId = "";
        $scope.membersObj.gender = "male";
        $scope.membersObj.department = "";
        $scope.membersObj.image = "";
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

    var getElement, croppingElement;
    $scope.imageUplading = function () {
        $('#croppingContainer').show();
        getElement = document.getElementById('imageCroppingBox');
        var imageObject = document.getElementById('profilePhotoUploader').files[0];
        var img_src = URL.createObjectURL(imageObject);
        croppingElement = new Croppie(getElement, {
            viewport: {
                width: 150,
                height: 150,
                type: 'circle'
            },
            boundary: {
                width: 200,
                height: 200
            },
            showZoomer: false
        });
        croppingElement.bind({
            url: img_src,
            orientation: 4
        });
    };

    $scope.destroyTheCropping = function () {
        croppingElement.destroy();
        $('#profilePhotoUploader').val(null);
        $('#croppingContainer').hide();
    };

    $scope.cancelAll = function () {
        $('#croppedImageViewer').hide();
        $('#photoUploadingLabel').show();
    };

    $scope.getCroppedImage = function () {
        croppingElement.result('base64').then(function (result) {
            $('#croppedImageViewer img').attr('src', result);
            $scope.membersObj.image = result;
        });
        croppingElement.result('blob').then(function (result) {
            var imageFile = new File([result], "newPhoto.png");
            console.log('imageFile', imageFile);
        });
        croppingElement.destroy();
        $('#profilePhotoUploader').val(null);
        $('#croppingContainer, #photoUploadingLabel').hide();
        $('#croppedImageViewer').show();
    };

    $('#memberAddModal').on('hide.bs.modal', function (event) {
        if ($('#profilePhotoUploader').val()) {
            croppingElement.destroy();
            $('#profilePhotoUploader').val(null);
        }
        $('#croppingContainer, #croppedImageViewer').hide();
        $('#photoUploadingLabel').show();
    });

    $timeout(function () {
        $scope.mainLoaderIs = false;
    }, 1000);
}]);