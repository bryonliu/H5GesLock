"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * Created by bryonliu on 2016/8/15.
 */

/***
 * option={
 *     width : 宽度，建议使用默认的屏幕宽度
 *     height : 高度
 *     R      : 大圆的半径
 *     R_INNER: 选中之后内圆的半径
 *     dy     : 维度（N*N），默认是3
 *     offsetX: 左右留白
 *     offsetY:上下留白
 *     lineWidthNormal : 绘制大圆的线宽
 *     lineWidthTouched：绘制触摸点连接线的线宽
 *
 *     colorNormal ： 正常情况下绘制大圆的边框颜色
 *     colorNormalTouched：选中情况下绘制连接线的颜色
 *     colorNormalTouchedFill ：选中情况下绘制大圆的填充色
 *     colorWarnTouched ：警告情况下连接线的颜色
 *     colorWarnTouchedFill： 警告情况下选中点的大圆填充色
 *
 *     inputEnd： 输入一次之后的回调函数参数｛pwd｝
 * }
 *     H5GesLock 对外方法：
 *     init:初始化
 *     drawWarn ： 绘制上次的告警样式
 *
 */
var H5GesLock = function () {
    function H5GesLock(options) {
        _classCallCheck(this, H5GesLock);

        options = options || {};
        this.inputEnd = options.inputEnd;
        this.width = options.width || document.body.offsetWidth;
        this.height = options.height || this.width;
        this.R = options.R || this.width * 0.17 / 2;
        this.R_INNER = this.R * 0.3; //选中之后内圆的半径
        this.dy = options.type || 3; // 维度 默认是3*3
        this.offsetX = options.offsetX || this.width * 0.145; //触摸点上下和左右的留白
        this.offsetY = options.offsetY || this.width * 0.145;
        this.lineWidthNormal = options.lineWidthNormal || 1.5;
        this.lineWidthTouched = options.lineWidthTouched || 1.5;

        this.colorNormal = options.colorNormal || "#CCCCCC"; // 默认点边框颜色值
        this.colorNormalTouched = options.colorNormalTouched || "#2D72F1"; //划线颜色
        this.colorNormalTouchedFill = options.colorNormalTouchedFill || "#B0C8F3"; // 选择点的填充颜色
        this.colorWarnTouched = options.colorWarnTouched || "#F95A5A"; //错误情况下划线颜色
        this.colorWarnTouchedFill = options.colorWarnTouchedFill || "#F6BFBF"; // 错误情况下的选择点的填充颜色

        if (!options.container || !document.getElementById(options.container)) {
            throw new Error("please input right id of you canvas");
        }
        this.mContainer = document.getElementById(options.container);
        this.mContext = this.mContainer.getContext("2d");

        this.mContainer.width = this.width;
        this.mContainer.height = this.height;

        this.touchSpots = caculateTouchSpotsLocation(this); // 屏幕上的所有点
        this.hasTouchedSpots = [];

        this.touchStartListener = touchStartHandler(this);
        this.touchMoveListenner = touchMoveHandler(this);
        this.touchEndListener = touchEndHandler(this);
    }

    _createClass(H5GesLock, [{
        key: "init",
        value: function init() {
            clear(this);
            this.hasTouchedSpots = [];
            drawDefaultSpots(this);
            bindEvent(this);
        }
    }, {
        key: "drawWarn",
        value: function drawWarn() {
            clear(this);
            _drawWarn(this);
        }
    }]);

    return H5GesLock;
}();

window.H5GesLock = H5GesLock;
/**
 * 计算手势密码的N*N个位置
 * 3*3顺序依次为：
 *    1 2 3
 *    4 5 6
 *    7 8 9
 */

function clear(h5ges) {
    h5ges.mContext.clearRect(0, 0, h5ges.width, h5ges.height);
}
function caculateTouchSpotsLocation(H5Ges) {
    var spots = [];

    var X_Dis = (H5Ges.width - 2 * H5Ges.offsetX - 2 * H5Ges.R) / (H5Ges.dy - 1); // X 轴上的圆心距
    var Y_Dis = (H5Ges.height - 2 * H5Ges.offsetY - 2 * H5Ges.R) / (H5Ges.dy - 1); // Y 轴上的圆心距

    for (var row = 0; row < H5Ges.dy; row++) {
        for (var col = 0; col < H5Ges.dy; col++) {
            var point = {
                X: H5Ges.offsetX + H5Ges.R + col * X_Dis,
                Y: H5Ges.offsetY + H5Ges.R + row * Y_Dis
            };
            spots.push(point);
        }
    }
    return spots;
}

function drawNormal(h5ges, lastPoint) {

    drawDefaultSpots(h5ges);
    drawTouchSpots(h5ges, true);
    drawTouchLine(h5ges, true, lastPoint);
    drawTouchCenter(h5ges, true);
}
function _drawWarn(h5ges) {

    drawDefaultSpots(h5ges);
    drawTouchSpots(h5ges, false);
    drawTouchLine(h5ges, false, null);
    drawTouchCenter(h5ges, false);
}
/**
 * 选择点颜色填充
 * @param h5ges
 * @param isNormal 是正常选中还是警告
 */
function drawTouchSpots(h5ges, isNormal) {
    var mContext = h5ges.mContext;
    h5ges.hasTouchedSpots.forEach(function (spotIndex) {
        var spot = h5ges.touchSpots[spotIndex];
        var color = isNormal ? h5ges.colorNormalTouchedFill : h5ges.colorWarnTouchedFill;
        mContext.beginPath();
        mContext.strokeStyle = color;
        mContext.fillStyle = color;
        mContext.arc(spot.X, spot.Y, h5ges.R, 0, Math.PI * 2);
        mContext.fill();
        mContext.closePath();
        mContext.stroke();
    });
}
/***
 *  绘初始化默认图
 * @param h5ges
 */
function drawDefaultSpots(h5ges) {

    var mContext = h5ges.mContext;
    h5ges.touchSpots.forEach(function (spot) {
        mContext.beginPath();
        mContext.lineWidth = h5ges.lineWidthNormal;
        mContext.strokeStyle = h5ges.colorNormal;
        mContext.arc(spot.X, spot.Y, h5ges.R, 0, Math.PI * 2);
        mContext.closePath();
        mContext.stroke();
    });
}

/**
 * 绘制以选择点的中间小圆
 * @param mContext
 * @param touchSpots
 * @param color
 * @param allSpots
 */
function drawTouchCenter(h5ges, isNormal) {
    var mContext = h5ges.mContext;
    h5ges.hasTouchedSpots.forEach(function (spotIndex) {
        var spot = h5ges.touchSpots[spotIndex];
        mContext.beginPath();
        mContext.lineWidth = 1;
        mContext.fillStyle = isNormal ? h5ges.colorNormalTouched : h5ges.colorWarnTouched;
        mContext.arc(spot.X, spot.Y, h5ges.R_INNER, 0, Math.PI * 2);
        mContext.fill();
        mContext.closePath();
        mContext.stroke();
    });
}
/**
 * 绘制一选择点以及当前触摸点的连线
 * @param h5ges
 * @param color
 * @param lastPoint
 */
function drawTouchLine(h5ges, isNormal, lastPoint) {

    var touchSpots = h5ges.hasTouchedSpots;

    if (!touchSpots || touchSpots.length == 0) return;
    h5ges.mContext.beginPath();
    touchSpots.forEach(function (spot) {
        h5ges.mContext.lineTo(h5ges.touchSpots[spot].X, h5ges.touchSpots[spot].Y);
    });
    h5ges.mContext.lineWidth = h5ges.lineWidthTouched;
    h5ges.mContext.strokeStyle = isNormal ? h5ges.colorNormalTouched : h5ges.colorWarnTouched;
    h5ges.mContext.stroke();
    h5ges.mContext.closePath();
    var mContext = h5ges.mContext;

    if (lastPoint != null) {
        var lastTouchSpotIndex = touchSpots[touchSpots.length - 1];
        var lastSpot = h5ges.touchSpots[lastTouchSpotIndex];
        mContext.beginPath();
        mContext.moveTo(lastSpot.X, lastSpot.Y);
        mContext.lineTo(lastPoint.X, lastPoint.Y);
        mContext.stroke();
        mContext.closePath();
    }
}
function bindEvent(h5Ges) {

    h5Ges.mContainer.addEventListener("touchstart", h5Ges.touchStartListener, false);
    h5Ges.mContainer.addEventListener("touchmove", h5Ges.touchMoveListenner, false);
    h5Ges.mContainer.addEventListener("touchend", h5Ges.touchEndListener, false);
}
var touchStartHandler = function touchStartHandler(h5Ges) {
    return function (e) {
        var touche = e.touches[0];
        var touchPoint = getTouchCoordinateOFElement(h5Ges, touche);
        isTouchSpot(h5Ges, touchPoint);
    };
};

var touchMoveHandler = function touchMoveHandler(h5Ges) {
    return function (e) {
        e.preventDefault();
        var touche = e.touches[0];
        var touchPoint = getTouchCoordinateOFElement(h5Ges, touche);
        var istouch = isTouchSpot(h5Ges, touchPoint);
        pickSpotsOnLine(h5Ges.hasTouchedSpots, h5Ges.dy);
        clear(h5Ges);
        var lastPoint = istouch ? null : touchPoint;
        drawNormal(h5Ges, lastPoint);
    };
};

var touchEndHandler = function touchEndHandler(h5Ges) {
    return function (e) {
        clear(h5Ges);
        drawNormal(h5Ges, h5Ges.hasTouchedSpots);
        h5Ges.lastTouchSpots = h5Ges.hasTouchedSpots;

        if (h5Ges.inputEnd && typeof h5Ges.inputEnd == "function") {
            h5Ges.inputEnd(h5Ges.hasTouchedSpots.join(""));
        } else {
            console.log(h5Ges.hasTouchedSpots.join(""));
        }
        h5Ges.hasTouchedSpots = [];
        unbindEvent(h5Ges);
    };
};

function unbindEvent(h5Ges) {
    var mContainer = h5Ges.mContainer;
    mContainer.removeEventListener("touchstart", h5Ges.touchStartListener, false);
    mContainer.removeEventListener("touchmove", h5Ges.touchMoveListenner, false);
    mContainer.removeEventListener("touchend", h5Ges.touchEndListener, false);
}
/**
 * @brify 判断是否触摸到某个点以及是否已经被触摸过
 * @param h5ges
 * @param currentSpot
 * @returns {*|boolean}
 */
function isTouchSpot(h5ges, currentSpot) {
    return h5ges.touchSpots.some(function (spot, index) {
        var xDiff = spot.X - currentSpot.X;
        var yDiff = spot.Y - currentSpot.Y;
        var dir = Math.pow(xDiff * xDiff + yDiff * yDiff, 0.5);
        if (dir < h5ges.R & h5ges.hasTouchedSpots.indexOf(index) < 0) {
            h5ges.hasTouchedSpots.push(index);
            return true;
        }
    });
}
/**
 * 检查任意相邻两点直接是否有其他点，如果有者插入他们中间
 * @param touchedSpots
 * @param d
 */
function pickSpotsOnLine(touchedSpots, d) {

    for (var i = 0; i < touchedSpots.length - 1; i++) {

        var nums = numberOntheLineOf(touchedSpots[i], touchedSpots[i + 1], d);
        var last = i + 1;
        for (var k = 0; k < nums.length; k++) {
            if (touchedSpots.indexOf(nums[k]) == -1) {
                //console.log("has")
                touchedSpots.splice(last, 0, nums[k]);
                last += 1;
            }
        }
    }
}
/***
 * @brify 判断两个相连的数字在d*d宫格中的连线上是否有其他数字， 比如在九宫格中，0，2之间会有1
 * @param i 数字i
 * @param j 数字j
 * @param d 维度d(3*3,4*4)
 * @returns {Array}
 */
function numberOntheLineOf(i, j, d) {
    var result = [];
    if (i > j) {
        var t = i;
        i = j;
        j = t;
    }
    var ix = i % d,
        iy = parseInt(i / d);
    var jx = j % d,
        jy = parseInt(j / d);

    var dx = jx - ix,
        dy = jy - iy;

    if (dx != dy && dx != 0 && dy != 0) return result;

    //console.log("dx : dy = " + dx + " : " + dy);
    if (dx == dy) {
        var begin = d + 1 + i;
        while (begin < j) {
            result.push(begin);
            console.log(begin);
            begin += d + 1;
        }
    } else if (dx == 0) {
        var begin = i + d;
        while (begin < j) {
            result.push(begin);
            begin += d;
        }
    } else if (dy == 0) {

        var begin = i + 1;

        while (begin < j) {
            result.push(begin);
            begin += 1;
        }
    }
    return result;
}
function getTouchCoordinateOFElement(h5ges, touche) {
    var result = {};
    var eleCo = getEleCoordinateOfPage(h5ges.mContainer);
    result.X = touche.pageX - eleCo.pageX;
    result.Y = touche.pageY - eleCo.pageY;
    return result;
}
function getEleCoordinateOfPage(ele) {
    var offsetLeft = ele.offsetLeft;
    var offsetTop = ele.offsetTop;
    if (ele.offsetParent !== null) {
        var parCo = getEleCoordinateOfPage(ele.offsetParent);
        offsetLeft += parCo.pageX;
        offsetTop += parCo.pageY;
    }
    return { pageX: offsetLeft, pageY: offsetTop };
}

//# sourceMappingURL=h5geslock.js.map