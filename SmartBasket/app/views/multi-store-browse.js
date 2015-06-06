// var vmModule = require("../view-models/homepage-view-model");
var frameModule = require("ui/frame");
var platformModule = require("platform");
var viewModule = require("ui/core/view");
var httpModule = require("http");
var observableModule = require("data/observable");
var observableArray = require("data/observable-array");
var NativeScriptMonitor = require('../NativeScriptMonitor').Monitor;
var config = require("../shared/models/config");
var el = require("../shared/models/el");
var cartBasket = new observableArray.ObservableArray([]);
var multiStore = new observableArray.ObservableArray([]);
var pageData = new observableModule.Observable();

var viewModel;

// Event handler for Page "loaded" event attached in main-page.xml
function pageLoaded(args) {
    var page = args.object;
    pageData.set("cartItem", "");
    //    pageData.set("cartBasket", cartBasket);
    pageData.set("cartBasket", cartBasket);
    pageData.set("multiStore", multiStore);
    pageData.set("cartCount", "");


    page.bindingContext = pageData;

    // Empty the array for subsequent visits to the page
    while (multiStore.length) {
        multiStore.pop();
    }

    while (cartBasket.length) {
        cartBasket.pop();
    }



    if (platformModule.device.os === "Android") {
        frameModule.topmost().android.actionBar.hide();
    }

    if (platformModule.device.os === "iOS") {
        frameModule.topmost().ios.navBarVisibility = "never";
    }

    if (MONITOR === null) {
        MONITOR = new NativeScriptMonitor({
            productId: '634be1a382dd447dacdc4fcc38b6a614',
            version: '1.0'
        });

        MONITOR.start();

        MONITOR.trackFeature('View.CartBrowse');

    }

    loadCartBasket();

}

var tempCartObj = {};

function loadCartBasket() {
    httpModule.getJSON({
        url: "http://api.everlive.com/v1/" + config.apiKey + "/Cart",
        method: "GET"
    }).then(function (result) {

        tempCartObj.userName = "murugan";
        tempCartObj.productIds = [];
        result.Result.forEach(function (cartItem) {
            cartBasket.push({
                name: cartItem.ProductName
            });
            tempCartObj.productIds.push(cartItem.ProductName);
        });
    }).then(function() {
        httpModule.request({
            url: "http://bigfoot-fireball-api-test-1.ch.flipkart.com:9090/groceries/smartBasket",
            method: "POST",
            content: JSON.stringify(tempCartObj),
            headers: {
                "Content-Type": "application/json"
            }

        }).then(function (result) {

            var str2 = "";
            for(var key in result) {
            	str2 += key + "=" + result[key] + "|";
            }
            alert("SURPRISE BASKET : " + str2);

            var tObj = {};
            result.forEach(function (singleStore) {
                tObj = {};                
                tObj.storeName = singleStore.storeName;
                tObj.productList = singleStore.productList;
                tObj.totalAmount = singleStore.totalAmount;
                multiStore.push(tObj);

            });

            
        });
    }).then(function () {
        
        httpModule.request({
            url: "http://bigfoot-fireball-api-test-1.ch.flipkart.com:9090/groceries/allStores",
            method: "POST",
            content: JSON.stringify(tempCartObj),
            headers: {
                "Content-Type": "application/json"
            }

        }).then(function (result) {

            var str1 = "";
            for(var key in result) {
            	str1 += key + "=" + result[key] + "|";
            }
            alert("MULTIPLE STORES : " + str1);

            var tObj = {};
            result.forEach(function (singleStore) {
                tObj = {};                
                tObj.storeName = singleStore.storeName;
                tObj.productList = singleStore.productList;
                tObj.totalAmount = singleStore.totalAmount;
                multiStore.push(tObj);

            });

            
        });
    });



};



function navigateToSurpriseBasket() {
    frameModule.topmost().navigate({
        moduleName: "views/surprise-basket-browse",
        context: pageData.get("cartBasket")
    });
};

exports.navigateToSurpriseBasket = navigateToSurpriseBasket;
exports.pageLoaded = pageLoaded;