app.controller('faceSearchCtrl', ['$scope', '$q', '$rootScope', '$http', '$state', '$sessionStorage', '$timeout', '$window', '$filter', 'CONFIG', function ($scope, $q, $rootScope, $http, $state, $sessionStorage, $timeout, $window, $filter, CONFIG) {
    $scope.checkLoginStatus();
    $scope.imageLoader = false;
    $scope.detectionFlowIs = false;
    toastr.clear();
    $scope.faceelatedData = {
        "eventTitle": "",
        "eventType": ""
    };
    $scope.messageToastr();
    /***************Global variables**************/
    var urlValidator = /^(http[s]?:\/\/){0,1}(www\.){0,1}[a-zA-Z0-9\.\-]+\.[a-zA-Z]{2,5}[\.]{0,1}/;
    //$scope.lblInfo = "Welcome to face detect";
    $scope.fileisDisabled = false;
    $scope.inputisDisabled = false;
    $scope.imageUrl = '';
    $scope.croppedFiles = [];
    var getData = [];
    var personGroupId = "ilmuxteam";
    var largeFaceListId = "ilmuxfacelist";
    var apiKey = "9cf8662171fb48f9842fda832742e1fc";
    $scope.imageObject = {};
    $scope.pictureMaster = {
        "base64Url": "",
        "currDateTime": "",
        "noOfFaces": 0,
        "totalFaces": 0,
        "knownFaces": 0,
        "unknownFaces": 0,
        "newFaces": 0
    };
    $scope.detectBtnDisabledIs = true;
    $(document).ready(function () {
        $('#myCanvas').css('-webkit-max-logical-width', '-webkit-fill-available');
    });
    $scope.imageUploadInputDragAndDrop = function (event) {
        if (event.type == 'dragenter') {
            $(this).addClass('dragHover');
        } else {
            $(this).removeClass('dragHover');
        }
    };
    $(document).on('dragenter', function () {
        $timeout(function () {
            $("#getImageFile").on("dragenter", $scope.imageUploadInputDragAndDrop);
            $("#getImageFile").on("dragleave", $scope.imageUploadInputDragAndDrop);
            $("#getImageFile").on("drop", $scope.imageUploadInputDragAndDrop);
        }, 100);
    });
    $scope.dragAndDropMsgShownIs = true;
    $scope.myOnLoadFun = function () {
        var holder = document.getElementById('getImageFileDragDrop');
        holder.ondragover = function () {
            this.classList.add('dragHover');
            return false;
        };
        holder.ondragend = function () {
            this.classList.remove('dragHover');
            return false;
        };
        holder.ondragleave = function () {
            this.classList.remove('dragHover');
            return false;
        };
        holder.ondrop = function (e) {
            this.classList.remove('dragHover');
            e.preventDefault();
            toastr.remove();
            var thisInput = e.dataTransfer.files[0];
            $scope.showClearBtn = false;
            $scope.showClearBtn = true;
            var ext = thisInput.name.split('.').pop().toLowerCase();
            if ($.inArray(ext, ['png', 'jpg', 'jpeg']) == -1) {
                $scope.messageToastr();
                toastr.warning("Invalid extension!");
            } else {
                $scope.imageObject = thisInput;
                $scope.inputisDisabled = true;
                $scope.showImage();
            }
        };
        $('.stop-propagation, .common-page-title, .detect-button-box').on('dragenter', function (e) {
            e.stopPropagation();
            e.preventDefault();
        });
        $('.stop-propagation, .common-page-title, .detect-button-box').on('dragover', function (e) {
            e.stopPropagation();
            e.preventDefault();
        });
        $('.stop-propagation, .common-page-title, .detect-button-box').on('drop', function (e) {
            e.stopPropagation();
            e.preventDefault();
        });
    };
    $scope.myOnLoadFun();

    $scope.gettingImageFile = function () {
        $scope.facePropertyViewer = false;
        toastr.remove();
        var thisInput = $('#getImageFile');
        //console.log('thisInput', thisInput.val());
        $scope.showClearBtn = false;
        if (thisInput.val() != '' && thisInput.val() != undefined) {
            $scope.showClearBtn = true;
            var ext = thisInput.val().split('.').pop().toLowerCase();
            if ($.inArray(ext, ['png', 'jpg', 'jpeg']) == -1) {
                $scope.messageToastr();
                toastr.warning("Invalid Picture format!");
            } else {
                $scope.imageObject = document.getElementById('getImageFile').files[0];
                $scope.inputisDisabled = true;
                $scope.showImage();
            }
        }
    };

    $scope.imageUrlGettingFun = function () {
        $timeout(function () {
            $scope.facePropertyViewer = false;
            $scope.imageUrl = $('#fileUrl').val();
            $scope.showClearBtn = false;
            if ($scope.imageUrl != "" && $scope.imageUrl != undefined) {
                $scope.fileisDisabled = true;
                $scope.showClearBtn = true;
            } else {
                $scope.fileisDisabled = false;
            }
        }, 100);
    };
    $scope.getSubmitVal = function (event) {
        if (event.keyCode == 13) {
            $scope.showImage();
        }
    };

    $scope.pasteUrlFromClipboard = async function () {
        const text = await navigator.clipboard.readText();
        console.log('text', text);
        $scope.imageUrl = text;
        $scope.showImage();
    };
    var img;
    $scope.showImage = async function () {
        toastr.remove();
        $scope.messageToastr();
        img = new Image();
        if ($scope.inputisDisabled) {
            var inputObj = $scope.imageObject;
            if (inputObj != undefined) {
                img.src = URL.createObjectURL(inputObj);
            } else {
                toastr.warning('Please fill some value');
                return false;
            }
        } else {
            if ($scope.imageUrl != undefined && $scope.imageUrl != '') {
                $scope.dragAndDropMsgShownIs = false;
                var exists = await imageExists($scope.imageUrl);
                if (exists) {
                    var awaitResponse = await imageDownloader($scope.imageUrl);
                    if (awaitResponse.success) {
                        var fileName = awaitResponse.filePath;
                        var img_src = CONFIG.imgServer + fileName;
                        img.src = img_src;
                    } else {
                        $scope.dragAndDropMsgShownIs = true;
                        $scope.imageLoader = false;
                        toastr.warning('Sorry! this image is not accessible');
                        return false;
                    }
                } else {
                    $scope.dragAndDropMsgShownIs = true;
                    $scope.imageLoader = false;
                    toastr.warning('Please input a valid url');
                    $timeout(function () {
                        $('#fileUrl').focus();
                    }, 300);
                    return false;
                }
            } else {
                toastr.warning('Please fill some value...');
                return false;
            }
        }
        //$scope.lblInfo = "Welcome to face detect";
        $scope.imageLoader = true;
        $scope.dragAndDropMsgShownIs = false;
        $scope.active = false;
        var canvas = document.getElementById("myCanvas");
        var context = canvas.getContext("2d");
        context.clearRect(0, 0, canvas.width, canvas.height);
        $scope.resizeCallingIs = false;
        //img.crossOrigin = "Anonymous";
        img.onload = function () {
            canvas.width = img.width;
            canvas.height = img.height;
            context.drawImage(img, 0, 0);
            if ($scope.inputisDisabled == false) {
                var dataURL = canvas.toDataURL("image/png");
                fetch(dataURL).then(res => res.blob()).then(blob => {
                    $scope.imageObject = new File([blob], "newPhoto.png");
                });
            }
            $scope.detectBtnDisabledIs = false;
            $timeout(function () {
                $('#detectFaceBtn').tooltip('show');
                $timeout(function () {
                    $('#detectFaceBtn').tooltip('hide');
                }, 3000);
            }, 100);
            $scope.croppedFiles = [];
            $scope.pictureMaster.totalFaces = 0;
            $scope.pictureMaster.knownFaces = 0;
            $scope.pictureMaster.unknownFaces = 0;
            $scope.pictureMaster.newFaces = 0;
            $scope.detectedFaceCnt = 0;
            $scope.imageLoader = false;
        };
        $timeout(function () {
            $scope.imageLoader = false;
        }, 1500);
    };
    /*$scope.viewFaceAttributesObj = {};
    $scope.viewFaceAttributes = function (faceAttrs) {
        var faceDetails = faceAttrs.faceAttributes;
        $scope.viewFaceAttributesObj = faceAttrs;
        $('#faceAttributesViewr').modal('show');
        var options = {
            'editable': false,
            'defaultCollapsed': true
        };
        var editor = new JsonEditor('#json-display', faceDetails, options);
    };*/
    $scope.facePropsObject = {};
    $scope.facePropertyViewer = false;
    $scope.viewFacePropsHover = function (mdlEvent, faceAttrs) {
        if (mdlEvent == 'open') {
            $scope.facePropsObject = {};
            faceAttrs.faceAttributes.blur.percentage = Math.round(faceAttrs.faceAttributes.blur.value * 100);
            faceAttrs.faceAttributes.exposure.percentage = Math.round(faceAttrs.faceAttributes.exposure.value * 100);
            faceAttrs.faceAttributes.noise.percentage = Math.round(faceAttrs.faceAttributes.noise.value * 100);
            faceAttrs.faceAttributes.faceImageSrc = faceAttrs.bindItemName;
            faceAttrs.faceAttributes.gender = faceAttrs.gender;
            faceAttrs.faceAttributes.age = faceAttrs.age;
            faceAttrs.faceAttributes.personState = faceAttrs.personState;
            faceAttrs.faceAttributes.personType = faceAttrs.personType;
            faceAttrs.faceAttributes.pinnedStatus = faceAttrs.pinnedStatus;
            faceAttrs.faceAttributes.personTag = faceAttrs.personTag;
            faceAttrs.faceAttributes.id = faceAttrs.id;

            $scope.facePropsObject = faceAttrs.faceAttributes;

            $scope.facePropertyViewer = true;
        } else {
            $scope.facePropertyViewer = false;
        }
    };

    function imageDownloader(imageUrl) {
        $scope.imageLoader = true;
        return new Promise(function (result) {
            $http({
                method: "POST",
                url: CONFIG.rootUrl + "dbApi/downloadImage",
                headers: {
                    'Content-Type': "application/json"
                },
                async: false,
                data: {
                    "imageUrl": imageUrl
                }
            }).then(function (response) {
                //$scope.getLoader(false);
                $timeout(function () {
                    $scope.imageLoader = false;
                    result(response.data);
                }, 1000);
            });
        });
    }

    function imageExists(url) {
        return new Promise(function (result) {
            var img = new Image();
            img.onload = function () {
                result(true);
            };
            img.onerror = function () {
                result(false);
            };
            img.src = url;
        });
    }
    /*********************Detect face API function*************/
    $scope.resizeCallingIs = false;
    $scope.imageResizing = function () {
        var file = $scope.imageObject;
        console.log('file', file);
        var res_img = new Image();
        res_img.src = URL.createObjectURL(file);
        res_img.onload = function () {
            var canvas = document.getElementById("myCanvas");
            var ctx = canvas.getContext("2d");
            var width = res_img.width * 2;
            var height = res_img.height * 2;
            canvas.width = width;
            canvas.height = height;
            ctx.drawImage(res_img, 0, 0, width, height);
            var res_data_url = canvas.toDataURL("image/png");
            img.src = res_data_url;
            fetch(res_data_url).then(res => res.blob()).then(blob => {
                $scope.imageObject = new File([blob], "resizedPhoto.png");
                $scope.detectFaces();
                $scope.resizeCallingIs = true;
            });
        }
    };
    $scope.detectFaces = function () {
        //toastr.remove();
        $scope.getLoader(true);
        var formData = new FormData();
        formData.append('file', $scope.imageObject);
        formData.append('trainType', 'manual');
        //$scope.showClearBtn = false;
        $http.post(CONFIG.rootUrl + "manualTrain/detectFaces", formData, {
            transformRequest: angular.identity,
            headers: {
                'Content-Type': undefined
            },
            async: false,
        }).then(function (response) {
            //console.log('response', response);
            if (response.data.success) {
                $scope.messageToastr();
                toastr.success("Image Detected Successfully", {
                    timeOut: 2000
                });
                $scope.processResult(response.data);
                $scope.getLoader(false);
            } else {
                if (response.data.detectResult != undefined) {
                    if (response.data.detectResult.length == 0) {
                        if ($scope.resizeCallingIs == false) {
                            toastr.warning("There seem to be a problem with picture! We are trying to proccess the picture again.", {
                                timeOut: 5000
                            });
                            $scope.imageResizing();
                        } else {
                            $scope.handleErrors('error');
                        }
                    } else {
                        $scope.handleErrors('error');
                    }
                } else {
                    toastr.warning("There seem to be a problem with picture please reload and try again...", {
                        timeOut: 5000
                    });
                    $scope.getLoader(false);
                }
            }
        }, function (error) {
            $scope.handleErrors(error);
            //$scope.showClearBtn = true;
        });
    };
    /*********************Identify face API function*************/
    $scope.personMaster = [];
    $scope.persistedFaceIds = [];
    $scope.persistedLargeFaceListIds = [];
    /*************************Draw rectangle and text  on image*******/
    $scope.processResult = function (response) {
        var responseDataObject = response;
        if (responseDataObject.detectResult.length > 0) {
            var canvas = document.getElementById('myCanvas');
            var context = canvas.getContext('2d');
            context.beginPath();
            // Draw face rectangles into canvas.
            $scope.croppedFiles = [];
            for (var i = 0; i < responseDataObject.detectResult.length; i++) {
                var detectResult = responseDataObject.detectResult[i];
                var faceRectangle = detectResult.faceRectangle;
                var faceAttributes = detectResult.faceAttributes;
                var personData = responseDataObject.personData[i];

                context.font = "26px Arial";
                context.lineWidth = 5;
                context.strokeStyle = "#765346";
                var textTopVal = faceRectangle.top - 10;

                context.strokeText($scope.splitName(personData.name), faceRectangle.left, textTopVal, faceRectangle.width);

                context.fillStyle = "white";
                context.fillText($scope.splitName(personData.name), faceRectangle.left, textTopVal, faceRectangle.width);

                //context.fillText(personData.name, faceRectangle.left, textTopVal, faceRectangle.width);

                context.rect(faceRectangle.left, faceRectangle.top, faceRectangle.width, faceRectangle.height);

                var crop_canvas = document.createElement('canvas');
                crop_canvas.width = faceRectangle.width;
                crop_canvas.height = faceRectangle.height;

                var bind_crop_canvas = document.createElement('canvas');
                bind_crop_canvas.width = faceRectangle.width;
                bind_crop_canvas.height = faceRectangle.height;

                var divLeftVal = Math.round((25 / 100) * faceRectangle.width);
                var divTopVal = Math.round((40 / 100) * faceRectangle.height);

                var imgLeft = faceRectangle.left - divLeftVal;
                var imgTop = faceRectangle.top - divTopVal;

                var imgWidth = faceRectangle.width + Math.round((40 / 100) * faceRectangle.height);
                var imgHeight = faceRectangle.height + Math.round((40 / 100) * faceRectangle.height);

                crop_canvas.getContext('2d').drawImage(img, faceRectangle.left, faceRectangle.top, faceRectangle.width, faceRectangle.height, 0, 0, faceRectangle.width, faceRectangle.height);

                bind_crop_canvas.getContext('2d').drawImage(img, imgLeft, imgTop, imgWidth, imgHeight, 0, 0, faceRectangle.width, faceRectangle.height);

                var url = crop_canvas.toDataURL("image/png");
                var bind_url = bind_crop_canvas.toDataURL("image/png");
                var personState = 'known';
                var view = 'known';
                if (personData.name.includes("unknown")) {
                    personState = "unknown";
                    view = 'unknown';
                }
                if (personData.name == 'New') {
                    personState = 'New';
                    view = 'New';
                }
                var personTrainIs = true;
                if (personData.personType == 'deleted' || personData.personType == 'ignore') {
                    personTrainIs = false;
                }
                $scope.croppedFiles.push({
                    name: personData.name,
                    bindName: $scope.splitName(personData.name),
                    firstName: personData.name,
                    lastName: personData.lastName,
                    age: faceAttributes.age,
                    emotions: faceAttributes.emotion,
                    gender: faceAttributes.gender,
                    smiles: faceAttributes.smile,
                    confidence: personData.confidence,
                    personId: personData.personId,
                    id: personData.id,
                    personType: personData.personType,
                    pinnedStatus: personData.pinnedStatus,
                    personTag: personData.personTag,
                    itemName: url,
                    bindItemName: bind_url,
                    faceRectangle: faceRectangle,
                    trainIs: personTrainIs,
                    personState: personState,
                    viewer: view,
                    faceAttributes: faceAttributes,
                    faceId: detectResult.faceId,
                    similiarFaceBtnBoxIs: false,
                    nameSelectedIs: false
                });
            }
            context.lineWidth = 3;
            context.strokeStyle = 'white';
            context.stroke();

            $scope.pictureMaster.totalFaces = responseDataObject.detectResult.length;
            $scope.pictureMaster.knownFaces = 0;
            $scope.pictureMaster.unknownFaces = 0;
            $scope.pictureMaster.newFaces = 0;
            $scope.picFilename = response.pictureMaster.pictureFilename;
            for (var i = 0; i < $scope.croppedFiles.length; i++) {
                if ($scope.croppedFiles[i].name == 'New') {
                    $scope.pictureMaster.newFaces++;
                }
                if ($scope.croppedFiles[i].name == 'Unknown' || $scope.croppedFiles[i].personState == "unknown") {
                    $scope.pictureMaster.unknownFaces++;
                }
                if ($scope.croppedFiles[i].personState != 'unknown' && $scope.croppedFiles[i].name != 'New') {
                    $scope.pictureMaster.knownFaces++;
                }
                if ($scope.croppedFiles[i].personType != 'deleted' && $scope.croppedFiles[i].personType != 'ignore') {
                    $scope.detectedFaceCnt++;
                }
            }
            $scope.pictureMaster.noOfFaces = $scope.croppedFiles.length;

            $scope.detectionFlowIs = true;
            $scope.imageUrl = "";
            $scope.fileisDisabled = false;
            $scope.inputisDisabled = false;
            $scope.detectBtnDisabledIs = true;
            $("#getImageFile").val('');
            if ($scope.detectionFlowIs) {
                $('#myCanvas').removeAttr('style');
                $timeout(function () {
                    $('#myCanvas').css('-webkit-max-logical-width', '-webkit-fill-available');
                }, 500);
            }
        }
    };
    $scope.trainedNewFaces = {};
    $scope.addntrain = function () {
        var iWantTrainThis = [];
        for (var w = 0; w < $scope.croppedFiles.length; w++) {
            if ($scope.croppedFiles[w].personState == 'stranger') {
                $scope.croppedFiles[w].firstName = "New";
                $scope.croppedFiles[w].lastName = "";
            }
            if ($scope.croppedFiles[w].trainIs) {
                iWantTrainThis.push($scope.croppedFiles[w]);
            }
        }
        $scope.trainedFace = {};
        if (iWantTrainThis.length > 0) {
            $scope.getLoader(true);
            $scope.isDisabled = true;
            var mainDataObj = {
                "personData": iWantTrainThis,
                "eventData": $scope.faceelatedData,
                "trainType": "manual",
                "scrapeDataId": 0,
                "pictureMaster": {
                    "pictureFilename": $scope.picFilename
                }
            };
            var allData = JSON.stringify(mainDataObj);
            $http({
                method: "POST",
                url: CONFIG.rootUrl + "manualTrain/addAndTrain",
                headers: {
                    'Content-Type': "application/json"
                },
                data: allData
            }).then(function (response) {
                $scope.isDisabled = false;
                if (response.data.success) {
                    var responseData = response.data;
                    var pictureData = responseData.pictureData;
                    for (var i = 0; i < pictureData.length; i++) {
                        pictureData[i].imgPath = CONFIG.imgServer + pictureData[i].personType + '/' + pictureData[i].firstName + '/' + pictureData[i].faceFilename;
                        pictureData[i].bindFirstName = $scope.splitName(pictureData[i].firstName);
                    }
                    var personRejected = responseData.personRejected;
                    for (var i = 0; i < personRejected.length; i++) {
                        personRejected[i].imgPath = CONFIG.imgServer + personRejected[i].personType + '/' + personRejected[i].firstName + '/' + personRejected[i].faceFilename;
                        personRejected[i].bindFirstName = $scope.splitName(personRejected[i].firstName);
                    }
                    var failedCount = responseData.totalFaces - responseData.totalFacesTrained;
                    $scope.trainedFacesList = {
                        totalCount: responseData.totalFaces,
                        trainedCount: responseData.totalFacesTrained,
                        failedCount: failedCount,
                        pictureData: pictureData,
                        personRejected: personRejected
                    };

                    $('#successMsgModal').modal('show');
                } else {
                    $scope.messageToastr();
                    if (response.data.message.message == undefined) {
                        toastr.warning('There seems to be a issue, Please try again!');
                    } else {
                        toastr.warning(response.data.message.message);
                    }
                }
                $scope.getLoader(false);
            }, function (error) {
                $scope.isDisabled = false;
                $scope.getLoader(false);
            });
        } else {
            var warningMsg = "Sorry! You can\'t train because no faces were selected";
            if ($scope.croppedFiles.length == 1) {
                if ($scope.croppedFiles[0].personType == "deleted") {
                    warningMsg = "The training is restricted for deleted person.";
                }
                if ($scope.croppedFiles[0].personType == "ignore") {
                    warningMsg = "The training is restricted for ignored person.";
                }
            }
            $scope.messageToastr();
            toastr.warning(warningMsg);
        }
    };
    /*====face-Detection=====*/
    $(function () {
        $('[data-toggle="tooltip"]').tooltip();
    });
    /*Clear Selected Faces jamal*/
    $scope.clearImage = function () {
        $scope.imageLoader = false;
        $scope.isDisabled = false;
        $scope.imageUrl = "";
        $scope.fileisDisabled = false;
        $scope.inputisDisabled = false;
        $scope.detectBtnDisabledIs = true;
        $scope.showClearBtn = false;
        $scope.croppedFiles = [];

        $scope.pictureMaster = {
            "base64Url": "",
            "currDateTime": "",
            "noOfFaces": 0,
            "totalFaces": 0,
            "knownFaces": 0,
            "unknownFaces": 0,
            "newFaces": 0
        };
        $scope.detectedFaceCnt = 0;
        $scope.viewFacePropsHover('close');

        var canvas = document.getElementById("myCanvas");
        canvas.width = 200;
        canvas.height = 200;
        var context = canvas.getContext("2d");
        context.clearRect(0, 0, canvas.width, canvas.height);
        $("#getImageFile").val('');
        $('#fileUrl').val('');
        $scope.dragAndDropMsgShownIs = true;
    };
    $scope.detectedFaceCnt = 0;
    /*Show Person Name Input*/
    $scope.addNewPersonDetails = function (event, person, index) {
        person.viewer = "";
        $scope.FPlaceholder = "First Name";
        $scope.LPlaceholder = "Last Name";
        person.firstName = "";
        person.lastName = "";
    };
    /*Hide Person Name Input*/
    $scope.backtToNew = function (event, person, index) {
        person.viewer = "New";
        person.firstName = "New";
        person.lastName = "";
    };
    /*Check Detected Person Correct or Incorrect*/
    $scope.checkPerson = function (person, obj) {
        if (obj == 'no') {
            //$timeout(function () {
            person.personState = "stranger";
            person.similiarFaceBtnBoxIs = true;
            //}, 100);
        } else {
            if (person.firstName.includes('unknown')) {
                person.personState = "unknown";
            } else {
                person.personState = "known";
            }
            person.similiarFaceBtnBoxIs = false;
        }
    };
    $scope.similiarFaceMainPersonObj = {};
    $scope.similiarFacesList = [];
    $scope.searchModalIs = false;
    $scope.similiarNameSearchVal = {
        "value": ""
    };
    $scope.getSimiliarFaces = function (selectedObj, callParam) {
        console.log('callParam', callParam);
        //if (callParam == 'similiar') {}
        $scope.similiarFaceMainPersonObj = selectedObj;
        $scope.similiarFacesList = [];
        if (callParam == 'search') {
            $scope.searchModalIs = true;
            $('#similiarFacesModalBox').modal('show');
            $timeout(function () {
                $('#similiarNameSearchBox').keypress(alphaOnly);
                $('#similiarNameSearchBox').focusin();
                $scope.similiarNameSearchVal.value = '';
            }, 100);
            return false;
        } else {
            $scope.searchModalIs = false;
            $('#similiarFacesModalBox').modal('show');
        }
        $scope.getLoader(true);
        var sendData = {
            "faceId": selectedObj.faceId,
            "personId": selectedObj.personId
        };
        $http({
            method: "POST",
            url: CONFIG.rootUrl + "backlog/getSimiliarFaces",
            headers: {
                'Content-Type': "application/json"
            },
            data: sendData

        }).then(function (response) {
            console.log('response', response.data);
            if (response.data.success == true) {
                var resData = response.data;
                console.log('resData', resData);
                var similiarArr = resData.similiarArr;
                for (var i = 0; i < similiarArr.length; i++) {
                    similiarArr[i].imgPath = CONFIG.imgServer + similiarArr[i].personType + '/' + similiarArr[i].firstname + '/' + similiarArr[i].faceFilename;
                    similiarArr[i].bindFirstName = $scope.splitName(similiarArr[i].firstname);
                    similiarArr[i].similiarFaceSelIs = false;
                };
                $scope.similiarFacesList = similiarArr;
            } else {}
            $scope.getLoader(false);
        }, function (error) {
            $scope.getLoader(false);
        });
    };
    /*Image Selection for Train*/
    $scope.checkCardFunction = function (person) {
        if (person.trainIs == undefined || person.trainIs == false) {
            person.trainIs = true;
            $scope.detectedFaceCnt++;
        } else {
            person.trainIs = false;
            $scope.detectedFaceCnt--;
        }
    };

    /*---Person similiar faces func open----*/

    $scope.personAlbumFacesList = [];
    $scope.mainPersonObject = {};
    $scope.viewAlbumFun = function (persObject) {
        $scope.getLoader(true);
        var sendData = {
            "offset": 0,
            "max": 0,
            "personIdOrName": persObject.id
        };
        $http({
            method: "POST",
            url: CONFIG.rootUrl + "dbApi/getIndividualFaceInfo",
            headers: {
                'Content-Type': "application/json"
            },
            data: sendData

        }).then(function (response) {
            if (response.data.success == true) {
                var personAlbumData = response.data;
                personAlbumData.bindFirstName = $scope.splitName(personAlbumData.firstname);
                personAlbumData.imgPath = persObject.faceImageSrc;
                personAlbumData.gender = persObject.gender;
                personAlbumData.id = persObject.id;
                personAlbumData.personType = persObject.personType;
                personAlbumData.personTag = persObject.personTag;
                personAlbumData.pinnedStatus = persObject.pinnedStatus;
                var faceArr = personAlbumData.jsonArr;
                for (var i = 0; i < faceArr.length; i++) {
                    faceArr[i].imgPath = CONFIG.imgServer + faceArr[i].personType + '/' + response.data.firstname + '/' + faceArr[i].faceFilename;
                };
                $scope.personAlbumFacesList = faceArr;
                $scope.mainPersonObject = personAlbumData;
                $('#personAlbumModalBox').modal('show');
            } else {}
            $scope.getLoader(false);
        }, function (error) {
            $scope.getLoader(false);
        });
    };

    $scope.mergingConfirmationObj = {};
    $scope.selectedSimiliarFace = function (selectedObj) {
        for (var i = 0; i < $scope.similiarFacesList.length; i++) {
            $scope.similiarFacesList[i].similiarFaceSelIs = false;
        }
        $timeout(function () {
            selectedObj.similiarFaceSelIs = true;
            $scope.mergingConfirmationObj = selectedObj;
            $('#mergingConfirmationModalBox').show();
        }, 100);
    };

    $scope.addFaceIntoTheSelPerson = function (mergingObj) {
        $('#mergingConfirmationModalBox').hide();
        $('#similiarFacesModalBox').modal('hide');
        for (var i = 0; i < $scope.croppedFiles.length; i++) {
            if ($scope.croppedFiles[i].id == $scope.similiarFaceMainPersonObj.id) {
                $scope.croppedFiles[i].name = mergingObj.firstname;
                $scope.croppedFiles[i].firstName = mergingObj.firstname;
                $scope.croppedFiles[i].id = mergingObj.id;
                $scope.croppedFiles[i].personId = mergingObj.personId;
                $scope.croppedFiles[i].personTag = mergingObj.personTag;
                $scope.croppedFiles[i].pinnedStatus = mergingObj.pinnedStatus;
                $scope.croppedFiles[i].personType = mergingObj.personType;
                $scope.croppedFiles[i].lastName = mergingObj.lastname;
                $scope.croppedFiles[i].bindName = mergingObj.bindFirstName;
                $scope.croppedFiles[i].personState = mergingObj.personType;
                $scope.croppedFiles[i].similiarFaceBtnBoxIs = false;
                $scope.croppedFiles[i].nameSelectedIs = true;
            }
        }
    };

    /*Search function area open*/
    function alphaOnly(event) {
        var charCode = event.keyCode;
        if ((charCode > 64 && charCode < 91) || (charCode > 96 && charCode < 123) || (charCode > 47 && charCode < 58) || charCode == 8 || charCode == 32) {
            return true;
        } else {
            return false;
        }
    }
    $scope.setTag = "known";
    $scope.similiarNameFilterFunc = function (searchingKeys) {
        toastr.remove();
        if (searchingKeys != "") {
            var sendParamType = 'searchByName';
            var keyValue = searchingKeys;
            if (keyValue.match(/^-{0,1}\d+$/)) {
                sendParamType = 'searchById';
                $scope.setTag = "known";
                $scope.similiarNameSearchFun(keyValue, sendParamType);
            } else {
                sendParamType = 'searchByName';
                var searchName = keyValue.toLowerCase();
                if (searchName.length > 2) {
                    if ($rootScope.canceller != undefined) {
                        $rootScope.cancelXHR();
                    }
                    if (/unk/ig.test(searchName)) {
                        if (searchName.length > 7 && searchName.includes('unknown')) {
                            $scope.setTag = "unknown";
                            $scope.similiarNameSearchFun(searchName, sendParamType);
                        }
                    } else {
                        $scope.setTag = "known";
                        $scope.similiarNameSearchFun(searchName, sendParamType);
                    }
                }
            }
        } else {
            $scope.similiarFacesList = [];
        }
    };

    $scope.similiarNameSearchFun = function (searchName, searchKeySelector) {
        var searchKeySelectorValue = searchKeySelector;
        $rootScope.canceller = $q.defer();
        $scope.getLoader(true, true);
        $http({
            method: 'POST',
            url: CONFIG.rootUrl + "backlog/searchByFilter",
            data: {
                "personInfo": searchName,
                "type": searchKeySelectorValue,
                "tag": $scope.setTag
            },
            headers: {
                'Content-Type': 'application/json'
            },
            timeout: $rootScope.canceller.promise
        }).then(function (response) {
            if (response.data.success == true) {
                var dataArray = response.data.data;
                for (var i = 0; i < dataArray.length; i++) {
                    dataArray[i].imgPath = CONFIG.imgServer + dataArray[i].personType + '/' + dataArray[i].firstname + '/' + dataArray[i].faceFilename;
                    dataArray[i].bindFirstName = $scope.splitName(dataArray[i].firstname);
                    dataArray[i].similiarFaceSelIs = false;
                };
                $scope.similiarFacesList = dataArray;
            } else {
                if (!(response.data.message == 'Empty string' && response.data.success == false)) {
                    toastr.warning(response.data.message);
                }
            }
            $scope.getLoader(false);
        }, function (error) {
            $scope.getLoader(false);
        });
    };
    /*Search function area close*/
}]);
